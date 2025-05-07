import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertVehicleSchema,
  insertGatePassSchema,
  insertWeighbridgeRecordSchema,
  insertYardAllocationSchema,
  insertBayAssignmentSchema,
  insertVehicleTrackingSchema,
  insertYardSlotSchema,
  insertBaySchema
} from "@shared/schema";

// Map to store connected WebSocket clients
const clients = new Map<string, WebSocket>();

// Function to broadcast messages to all connected clients
function broadcastMessage(type: string, payload: any) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);

    ws.on('message', (messageBuffer) => {
      try {
        const message = JSON.parse(messageBuffer.toString());
        console.log(`Received message from client ${clientId}:`, message);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  // API Routes
  // Vehicle routes
  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const vehicle = await storage.getVehicleById(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.get('/api/vehicles/number/:vehicleNumber', async (req, res) => {
    try {
      const vehicle = await storage.getVehicleByNumber(req.params.vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.get('/api/vehicles/validate/:vehicleNumber', async (req, res) => {
    try {
      const vehicleNumber = req.params.vehicleNumber;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      
      res.json({
        exists: !!vehicle,
        vehicle: vehicle || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate vehicle" });
    }
  });

  app.post('/api/vehicles', async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data", error });
    }
  });

  // Gate pass routes
  app.get('/api/gate-passes', async (req, res) => {
    try {
      const gatePasses = await storage.getAllGatePasses();
      res.json(gatePasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gate passes" });
    }
  });

  app.get('/api/gate-passes/:id', async (req, res) => {
    try {
      const gatePass = await storage.getGatePassById(parseInt(req.params.id));
      if (!gatePass) {
        return res.status(404).json({ message: "Gate pass not found" });
      }
      res.json(gatePass);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gate pass" });
    }
  });

  app.get('/api/gate-passes/number/:gatePassNumber', async (req, res) => {
    try {
      const gatePass = await storage.getGatePassByNumber(req.params.gatePassNumber);
      if (!gatePass) {
        return res.status(404).json({ message: "Gate pass not found" });
      }
      res.json(gatePass);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gate pass" });
    }
  });

  app.get('/api/gate-passes/validate/:gatePassNumber', async (req, res) => {
    try {
      const gatePassNumber = req.params.gatePassNumber;
      const gatePass = await storage.getGatePassByNumber(gatePassNumber);
      
      res.json({
        isValid: !!gatePass && gatePass.isValid,
        isUsed: !!gatePass && gatePass.isUsed,
        scheduleTime: gatePass?.scheduleTime || "Not scheduled",
        cargoType: gatePass?.cargoType || "Unknown",
        gatePass: gatePass || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to validate gate pass" });
    }
  });

  app.post('/api/gate-passes', async (req, res) => {
    try {
      const validatedData = insertGatePassSchema.parse(req.body);
      const gatePass = await storage.createGatePass(validatedData);
      res.status(201).json(gatePass);
    } catch (error) {
      res.status(400).json({ message: "Invalid gate pass data", error });
    }
  });

  // Gate entry/exit routes
  app.post('/api/gate/entry', async (req, res) => {
    try {
      const { vehicleNumber, gatePassNumber, driverName, driverMobile, manualOverride, remarks } = req.body;
      
      // Check if vehicle exists, if not create it
      let vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        vehicle = await storage.createVehicle({
          vehicleNumber,
          driverName,
          driverMobile,
          currentStatus: "at_gate"
        });
      } else {
        // Update driver information if provided
        vehicle = await storage.updateVehicle(vehicle.id, {
          driverName: driverName || vehicle.driverName,
          driverMobile: driverMobile || vehicle.driverMobile,
          currentStatus: "at_gate",
          lastSeenAt: new Date()
        });
      }
      
      // Validate gate pass if provided
      let gatePass = null;
      if (gatePassNumber) {
        gatePass = await storage.getGatePassByNumber(gatePassNumber);
        if (gatePass) {
          // Mark gate pass as used
          gatePass = await storage.updateGatePass(gatePass.id, {
            isUsed: true,
            vehicleId: vehicle.id
          });
        }
      }
      
      // Create vehicle tracking record
      const tracking = await storage.createVehicleTracking({
        vehicleId: vehicle.id,
        gatePassId: gatePass?.id,
        entryTime: new Date(),
        currentLocation: "gate",
        currentStatus: "entered",
        remarks
      });
      
      // Broadcast the entry event to all clients
      broadcastMessage("VEHICLE_UPDATE", {
        action: "ENTRY",
        vehicleNumber,
        status: "at_gate",
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Gate entry recorded successfully",
        vehicle,
        gatePass,
        tracking
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process gate entry", error });
    }
  });

  app.post('/api/gate/exit', async (req, res) => {
    try {
      const { vehicleNumber, gatePass, exitTime, remarks } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "exited",
        lastSeenAt: new Date()
      });
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          exitTime: new Date(exitTime),
          currentLocation: "exit",
          currentStatus: "exited",
          remarks: remarks || tracking.remarks
        });
      }
      
      // Broadcast the exit event to all clients
      broadcastMessage("VEHICLE_UPDATE", {
        action: "EXIT",
        vehicleNumber,
        status: "exited",
        timestamp: exitTime
      });
      
      res.status(200).json({
        success: true,
        message: "Gate exit recorded successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process gate exit", error });
    }
  });

  // Weighbridge routes
  app.get('/api/weighbridge/entry-weight/:vehicleNumber', async (req, res) => {
    try {
      const vehicleNumber = req.params.vehicleNumber;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      const entryWeight = await storage.getWeighbridgeRecordByVehicleAndType(vehicle.id, "entry");
      
      res.json({
        weight: entryWeight?.weight || 0,
        unit: entryWeight?.unit || "kg",
        timestamp: entryWeight?.timestamp || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entry weight" });
    }
  });

  app.post('/api/weighbridge/entry', async (req, res) => {
    try {
      const { vehicleNumber, gatePass, weight, unit, type, loadType, signature, remarks, manualEntry } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Create weighbridge record
      const weighbridgeRecord = await storage.createWeighbridgeRecord({
        vehicleId: vehicle.id,
        weight,
        unit,
        type: "entry",
        remarks,
        manualEntry
      });
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "weighed_in",
        lastSeenAt: new Date()
      });
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "weighbridge",
          currentStatus: "weighed_in"
        });
      }
      
      // Broadcast the weighbridge entry event
      broadcastMessage("WEIGHBRIDGE_UPDATE", {
        action: "ENTRY_WEIGHT",
        vehicleNumber,
        weight,
        unit,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Entry weight recorded successfully",
        weighbridgeRecord
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to record entry weight", error });
    }
  });

  app.post('/api/weighbridge/exit', async (req, res) => {
    try {
      const { vehicleNumber, gatePass, weight, unit, remarks, manualEntry } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Create weighbridge record
      const weighbridgeRecord = await storage.createWeighbridgeRecord({
        vehicleId: vehicle.id,
        weight,
        unit,
        type: "exit",
        remarks,
        manualEntry
      });
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "weighed_out",
        lastSeenAt: new Date()
      });
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "exit_weighbridge",
          currentStatus: "weighed_out"
        });
      }
      
      // Broadcast the weighbridge exit event
      broadcastMessage("WEIGHBRIDGE_UPDATE", {
        action: "EXIT_WEIGHT",
        vehicleNumber,
        weight,
        unit,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Exit weight recorded successfully",
        weighbridgeRecord
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to record exit weight", error });
    }
  });

  // Yard allocation routes
  app.get('/api/yard/slots', async (req, res) => {
    try {
      const slots = await storage.getAllYardSlots();
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch yard slots" });
    }
  });

  app.post('/api/yard/allocate', async (req, res) => {
    try {
      const { vehicleNumber, slotId, yardArea, truckType, cargoType, manualAssignment } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Check if slot is available
      const slot = await storage.getYardSlotBySlotId(slotId);
      if (slot && slot.status === "occupied") {
        return res.status(400).json({ message: "Yard slot is already occupied" });
      }
      
      // Update slot status
      let updatedSlot;
      if (slot) {
        updatedSlot = await storage.updateYardSlot(slot.id, {
          status: "occupied",
          vehicleId: vehicle.id,
          lastUpdated: new Date()
        });
      } else {
        updatedSlot = await storage.createYardSlot({
          slotId,
          yardArea,
          status: "occupied",
          vehicleId: vehicle.id
        });
      }
      
      // Create yard allocation record
      const yardAllocation = await storage.createYardAllocation({
        vehicleId: vehicle.id,
        slotId,
        yardArea,
        status: "allocated"
      });
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "in_yard",
        truckType,
        lastSeenAt: new Date()
      });
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "yard",
          currentStatus: "waiting"
        });
      }
      
      // Broadcast the yard allocation event
      broadcastMessage("YARD_UPDATE", {
        action: "ALLOCATE",
        vehicleNumber,
        slotId,
        yardArea,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Yard slot allocated successfully",
        yardAllocation,
        slot: updatedSlot
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to allocate yard slot", error });
    }
  });

  // Bay assignment routes
  app.get('/api/bays/available', async (req, res) => {
    try {
      const bays = await storage.getAvailableBays();
      res.json(bays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available bays" });
    }
  });

  app.post('/api/bays/assign', async (req, res) => {
    try {
      const { vehicleNumber, bayId, operationType, cargoType, operatorNotes } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Check if bay is available
      const bay = await storage.getBayByBayId(bayId);
      if (bay && bay.status === "occupied") {
        return res.status(400).json({ message: "Bay is already occupied" });
      }
      
      // Update bay status
      let updatedBay;
      if (bay) {
        updatedBay = await storage.updateBay(bay.id, {
          status: "occupied",
          vehicleId: vehicle.id,
          lastUpdated: new Date()
        });
      } else {
        updatedBay = await storage.createBay({
          bayId,
          bayType: operationType.toLowerCase(),
          status: "occupied",
          vehicleId: vehicle.id
        });
      }
      
      // Create bay assignment record
      const bayAssignment = await storage.createBayAssignment({
        vehicleId: vehicle.id,
        bayId,
        operationType,
        operatorNotes,
        status: "in_progress"
      });
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "at_bay",
        lastSeenAt: new Date()
      });
      
      // Release yard allocation if any
      const yardAllocation = await storage.getYardAllocationByVehicleId(vehicle.id);
      if (yardAllocation) {
        await storage.updateYardAllocation(yardAllocation.id, {
          status: "released",
          releasedAt: new Date()
        });
        
        // Update yard slot status
        const slot = await storage.getYardSlotBySlotId(yardAllocation.slotId);
        if (slot) {
          await storage.updateYardSlot(slot.id, {
            status: "available",
            vehicleId: null,
            lastUpdated: new Date()
          });
        }
      }
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "bay",
          currentStatus: "loading_unloading"
        });
      }
      
      // Broadcast the bay assignment event
      broadcastMessage("BAY_UPDATE", {
        action: "ASSIGN",
        vehicleNumber,
        bayId,
        operationType,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Bay assigned successfully",
        bayAssignment,
        bay: updatedBay
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign bay", error });
    }
  });

  app.post('/api/bays/complete', async (req, res) => {
    try {
      const { vehicleNumber, bayId, operationTime, operatorNotes } = req.body;
      
      // Get vehicle
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Get bay assignment
      const bayAssignment = await storage.getBayAssignmentByVehicleAndBay(vehicle.id, bayId);
      if (!bayAssignment) {
        return res.status(404).json({ message: "Bay assignment not found" });
      }
      
      // Update bay assignment
      const updatedAssignment = await storage.updateBayAssignment(bayAssignment.id, {
        status: "completed",
        endTime: new Date(),
        operatorNotes: operatorNotes || bayAssignment.operatorNotes
      });
      
      // Update bay status
      const bay = await storage.getBayByBayId(bayId);
      if (bay) {
        await storage.updateBay(bay.id, {
          status: "available",
          vehicleId: null,
          lastUpdated: new Date()
        });
      }
      
      // Update vehicle status
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "bay_completed",
        lastSeenAt: new Date()
      });
      
      // Update vehicle tracking
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentStatus: "ready_for_exit"
        });
      }
      
      // Broadcast the bay completion event
      broadcastMessage("BAY_UPDATE", {
        action: "COMPLETE",
        vehicleNumber,
        bayId,
        operationTime,
        timestamp: new Date().toISOString()
      });
      
      res.status(200).json({
        success: true,
        message: "Bay operation completed successfully",
        bayAssignment: updatedAssignment
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete bay operation", error });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', async (req, res) => {
    try {
      const dateFilter = req.query.dateFilter as string || 'today';
      const shiftFilter = req.query.shiftFilter as string || 'all';
      
      // Get all vehicles with their current status
      const vehicles = await storage.getAllVehicles();
      
      // Get yard occupancy
      const yardSlots = await storage.getAllYardSlots();
      const occupiedSlots = yardSlots.filter(slot => slot.status === 'occupied').length;
      const totalSlots = yardSlots.length;
      const yardOccupancy = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
      
      // Get bay utilization
      const bays = await storage.getAllBays();
      const bayUtilization = bays.map(bay => ({
        bayId: bay.bayId,
        status: bay.status,
        utilization: Math.random() * 100 // This would be calculated based on historical data
      }));
      
      // Get weighbridge stats
      const weighbridgeRecords = await storage.getAllWeighbridgeRecords();
      
      // Get active vehicles in the facility
      const activeVehicles = vehicles.filter(v => v.currentStatus !== 'exited');
      
      res.json({
        vehicleCount: {
          total: vehicles.length,
          active: activeVehicles.length,
          atGate: vehicles.filter(v => v.currentStatus === 'at_gate').length,
          inYard: vehicles.filter(v => v.currentStatus === 'in_yard').length,
          atBay: vehicles.filter(v => v.currentStatus === 'at_bay').length,
          exiting: vehicles.filter(v => v.currentStatus === 'weighed_out').length
        },
        yardOccupancy: {
          percentage: yardOccupancy,
          occupied: occupiedSlots,
          total: totalSlots
        },
        bayUtilization,
        weighbridgeStats: {
          today: {
            inbound: weighbridgeRecords.filter(r => r.type === 'entry').length,
            outbound: weighbridgeRecords.filter(r => r.type === 'exit').length
          }
        },
        documentSuccess: {
          success: 92,
          failed: 8
        },
        apiStatus: [
          { name: "ANPR", status: "online" },
          { name: "YMS", status: "online" },
          { name: "Load Mgmt", status: "online" },
          { name: "Park+", status: "online" }
        ],
        alerts: [
          // Recent alerts would be generated based on system events
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data", error });
    }
  });

  return httpServer;
}
