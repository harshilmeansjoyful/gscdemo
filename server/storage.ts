import {
  users,
  type User,
  type InsertUser,
  vehicles,
  type Vehicle,
  type InsertVehicle,
  gatePasses,
  type GatePass,
  type InsertGatePass,
  weighbridgeRecords,
  type WeighbridgeRecord,
  type InsertWeighbridgeRecord,
  yardAllocations,
  type YardAllocation,
  type InsertYardAllocation,
  bayAssignments,
  type BayAssignment,
  type InsertBayAssignment,
  vehicleTracking,
  type VehicleTracking,
  type InsertVehicleTracking,
  yardSlots,
  type YardSlot,
  type InsertYardSlot,
  bays,
  type Bay,
  type InsertBay
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Vehicle methods
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, update: Partial<Vehicle>): Promise<Vehicle>;
  
  // Gate Pass methods
  getAllGatePasses(): Promise<GatePass[]>;
  getGatePassById(id: number): Promise<GatePass | undefined>;
  getGatePassByNumber(gatePassNumber: string): Promise<GatePass | undefined>;
  createGatePass(gatePass: InsertGatePass): Promise<GatePass>;
  updateGatePass(id: number, update: Partial<GatePass>): Promise<GatePass>;
  
  // Weighbridge Record methods
  getAllWeighbridgeRecords(): Promise<WeighbridgeRecord[]>;
  getWeighbridgeRecordById(id: number): Promise<WeighbridgeRecord | undefined>;
  getWeighbridgeRecordsByVehicleId(vehicleId: number): Promise<WeighbridgeRecord[]>;
  getWeighbridgeRecordByVehicleAndType(vehicleId: number, type: string): Promise<WeighbridgeRecord | undefined>;
  createWeighbridgeRecord(record: InsertWeighbridgeRecord): Promise<WeighbridgeRecord>;
  
  // Yard Allocation methods
  getAllYardAllocations(): Promise<YardAllocation[]>;
  getYardAllocationById(id: number): Promise<YardAllocation | undefined>;
  getYardAllocationByVehicleId(vehicleId: number): Promise<YardAllocation | undefined>;
  createYardAllocation(allocation: InsertYardAllocation): Promise<YardAllocation>;
  updateYardAllocation(id: number, update: Partial<YardAllocation>): Promise<YardAllocation>;
  
  // Bay Assignment methods
  getAllBayAssignments(): Promise<BayAssignment[]>;
  getBayAssignmentById(id: number): Promise<BayAssignment | undefined>;
  getBayAssignmentByVehicleId(vehicleId: number): Promise<BayAssignment | undefined>;
  getBayAssignmentByVehicleAndBay(vehicleId: number, bayId: string): Promise<BayAssignment | undefined>;
  createBayAssignment(assignment: InsertBayAssignment): Promise<BayAssignment>;
  updateBayAssignment(id: number, update: Partial<BayAssignment>): Promise<BayAssignment>;
  
  // Vehicle Tracking methods
  getAllVehicleTrackings(): Promise<VehicleTracking[]>;
  getVehicleTrackingById(id: number): Promise<VehicleTracking | undefined>;
  getVehicleTrackingByVehicleId(vehicleId: number): Promise<VehicleTracking | undefined>;
  createVehicleTracking(tracking: InsertVehicleTracking): Promise<VehicleTracking>;
  updateVehicleTracking(id: number, update: Partial<VehicleTracking>): Promise<VehicleTracking>;
  
  // Yard Slot methods
  getAllYardSlots(): Promise<YardSlot[]>;
  getYardSlotById(id: number): Promise<YardSlot | undefined>;
  getYardSlotBySlotId(slotId: string): Promise<YardSlot | undefined>;
  createYardSlot(slot: InsertYardSlot): Promise<YardSlot>;
  updateYardSlot(id: number, update: Partial<YardSlot>): Promise<YardSlot>;
  
  // Bay methods
  getAllBays(): Promise<Bay[]>;
  getAvailableBays(): Promise<Bay[]>;
  getBayById(id: number): Promise<Bay | undefined>;
  getBayByBayId(bayId: string): Promise<Bay | undefined>;
  createBay(bay: InsertBay): Promise<Bay>;
  updateBay(id: number, update: Partial<Bay>): Promise<Bay>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private gatePasses: Map<number, GatePass>;
  private weighbridgeRecords: Map<number, WeighbridgeRecord>;
  private yardAllocations: Map<number, YardAllocation>;
  private bayAssignments: Map<number, BayAssignment>;
  private vehicleTrackings: Map<number, VehicleTracking>;
  private yardSlots: Map<number, YardSlot>;
  private bays: Map<number, Bay>;
  
  // Counters for IDs
  private userIdCounter: number;
  private vehicleIdCounter: number;
  private gatePassIdCounter: number;
  private weighbridgeRecordIdCounter: number;
  private yardAllocationIdCounter: number;
  private bayAssignmentIdCounter: number;
  private vehicleTrackingIdCounter: number;
  private yardSlotIdCounter: number;
  private bayIdCounter: number;

  constructor() {
    // Initialize maps to store data
    this.users = new Map();
    this.vehicles = new Map();
    this.gatePasses = new Map();
    this.weighbridgeRecords = new Map();
    this.yardAllocations = new Map();
    this.bayAssignments = new Map();
    this.vehicleTrackings = new Map();
    this.yardSlots = new Map();
    this.bays = new Map();
    
    // Initialize ID counters
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.gatePassIdCounter = 1;
    this.weighbridgeRecordIdCounter = 1;
    this.yardAllocationIdCounter = 1;
    this.bayAssignmentIdCounter = 1;
    this.vehicleTrackingIdCounter = 1;
    this.yardSlotIdCounter = 1;
    this.bayIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users with different roles
    // Admin user
    this.createUser({
      username: "admin",
      password: "password",
      email: "admin@example.com",
      mobileNumber: "9876543210",
      role: "admin",
      fullName: "System Administrator",
      status: "active",
      accessRights: ["view_dashboard", "manage_users", "manage_vehicles", "manage_gates", "manage_weighbridge", "manage_yard", "generate_reports"]
    });
    
    // Manufacturer user
    this.createUser({
      username: "manufacturer",
      password: "password",
      email: "manufacturer@example.com",
      mobileNumber: "9876543211",
      role: "manufacturer",
      fullName: "Factory Manager",
      status: "active",
      accessRights: ["view_dashboard", "manage_vehicles", "generate_reports"]
    });
    
    // Transporter user
    this.createUser({
      username: "transporter",
      password: "password",
      email: "transporter@example.com",
      mobileNumber: "9876543212",
      role: "transporter",
      fullName: "Transport Manager",
      status: "active",
      accessRights: ["view_dashboard", "manage_vehicles"]
    });
    
    // Security user
    this.createUser({
      username: "security",
      password: "password",
      email: "security@example.com",
      mobileNumber: "9876543213",
      role: "security",
      fullName: "Security Officer",
      status: "active",
      accessRights: ["manage_gates", "manage_weighbridge", "manage_yard"]
    });
    
    // Create sample yard slots (A1-D6)
    for (const row of ['A', 'B', 'C', 'D']) {
      for (let col = 1; col <= 6; col++) {
        const slotId = `${row}${col}`;
        this.createYardSlot({
          slotId,
          yardArea: "Main Yard",
          status: "available"
        });
      }
    }
    
    // Create sample bays
    for (let i = 1; i <= 5; i++) {
      const bayType = i % 2 === 0 ? "loading" : "unloading";
      this.createBay({
        bayId: `Bay ${i}`,
        bayType,
        status: "available"
      });
    }
    
    // Create a sample gate pass
    this.createGatePass({
      gatePassNumber: "GP-0012345",
      scheduleTime: "15 Aug 2023, 13:00 - 15:00",
      cargoType: "Steel Coils",
      isValid: true,
      isUsed: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = { 
      ...user, 
      ...update,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    this.users.delete(id);
  }
  
  // Vehicle methods
  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }
  
  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      lastSeenAt: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, update: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${id} not found`);
    }
    
    const updatedVehicle: Vehicle = { ...vehicle, ...update };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  // Gate Pass methods
  async getAllGatePasses(): Promise<GatePass[]> {
    return Array.from(this.gatePasses.values());
  }
  
  async getGatePassById(id: number): Promise<GatePass | undefined> {
    return this.gatePasses.get(id);
  }
  
  async getGatePassByNumber(gatePassNumber: string): Promise<GatePass | undefined> {
    return Array.from(this.gatePasses.values()).find(
      (gatePass) => gatePass.gatePassNumber === gatePassNumber
    );
  }
  
  async createGatePass(insertGatePass: InsertGatePass): Promise<GatePass> {
    const id = this.gatePassIdCounter++;
    const gatePass: GatePass = {
      ...insertGatePass,
      id,
      createdAt: new Date()
    };
    this.gatePasses.set(id, gatePass);
    return gatePass;
  }
  
  async updateGatePass(id: number, update: Partial<GatePass>): Promise<GatePass> {
    const gatePass = await this.getGatePassById(id);
    if (!gatePass) {
      throw new Error(`Gate Pass with ID ${id} not found`);
    }
    
    const updatedGatePass: GatePass = { ...gatePass, ...update };
    this.gatePasses.set(id, updatedGatePass);
    return updatedGatePass;
  }
  
  // Weighbridge Record methods
  async getAllWeighbridgeRecords(): Promise<WeighbridgeRecord[]> {
    return Array.from(this.weighbridgeRecords.values());
  }
  
  async getWeighbridgeRecordById(id: number): Promise<WeighbridgeRecord | undefined> {
    return this.weighbridgeRecords.get(id);
  }
  
  async getWeighbridgeRecordsByVehicleId(vehicleId: number): Promise<WeighbridgeRecord[]> {
    return Array.from(this.weighbridgeRecords.values())
      .filter((record) => record.vehicleId === vehicleId);
  }
  
  async getWeighbridgeRecordByVehicleAndType(vehicleId: number, type: string): Promise<WeighbridgeRecord | undefined> {
    return Array.from(this.weighbridgeRecords.values())
      .find((record) => record.vehicleId === vehicleId && record.type === type);
  }
  
  async createWeighbridgeRecord(insertRecord: InsertWeighbridgeRecord): Promise<WeighbridgeRecord> {
    const id = this.weighbridgeRecordIdCounter++;
    const record: WeighbridgeRecord = {
      ...insertRecord,
      id,
      timestamp: new Date()
    };
    this.weighbridgeRecords.set(id, record);
    return record;
  }
  
  // Yard Allocation methods
  async getAllYardAllocations(): Promise<YardAllocation[]> {
    return Array.from(this.yardAllocations.values());
  }
  
  async getYardAllocationById(id: number): Promise<YardAllocation | undefined> {
    return this.yardAllocations.get(id);
  }
  
  async getYardAllocationByVehicleId(vehicleId: number): Promise<YardAllocation | undefined> {
    return Array.from(this.yardAllocations.values())
      .find((allocation) => allocation.vehicleId === vehicleId && allocation.status === "allocated");
  }
  
  async createYardAllocation(insertAllocation: InsertYardAllocation): Promise<YardAllocation> {
    const id = this.yardAllocationIdCounter++;
    const allocation: YardAllocation = {
      ...insertAllocation,
      id,
      allocatedAt: new Date(),
      releasedAt: null
    };
    this.yardAllocations.set(id, allocation);
    return allocation;
  }
  
  async updateYardAllocation(id: number, update: Partial<YardAllocation>): Promise<YardAllocation> {
    const allocation = await this.getYardAllocationById(id);
    if (!allocation) {
      throw new Error(`Yard Allocation with ID ${id} not found`);
    }
    
    const updatedAllocation: YardAllocation = { ...allocation, ...update };
    this.yardAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }
  
  // Bay Assignment methods
  async getAllBayAssignments(): Promise<BayAssignment[]> {
    return Array.from(this.bayAssignments.values());
  }
  
  async getBayAssignmentById(id: number): Promise<BayAssignment | undefined> {
    return this.bayAssignments.get(id);
  }
  
  async getBayAssignmentByVehicleId(vehicleId: number): Promise<BayAssignment | undefined> {
    return Array.from(this.bayAssignments.values())
      .find((assignment) => assignment.vehicleId === vehicleId && assignment.status === "in_progress");
  }
  
  async getBayAssignmentByVehicleAndBay(vehicleId: number, bayId: string): Promise<BayAssignment | undefined> {
    return Array.from(this.bayAssignments.values())
      .find((assignment) => assignment.vehicleId === vehicleId && assignment.bayId === bayId);
  }
  
  async createBayAssignment(insertAssignment: InsertBayAssignment): Promise<BayAssignment> {
    const id = this.bayAssignmentIdCounter++;
    const assignment: BayAssignment = {
      ...insertAssignment,
      id,
      startTime: new Date(),
      endTime: null
    };
    this.bayAssignments.set(id, assignment);
    return assignment;
  }
  
  async updateBayAssignment(id: number, update: Partial<BayAssignment>): Promise<BayAssignment> {
    const assignment = await this.getBayAssignmentById(id);
    if (!assignment) {
      throw new Error(`Bay Assignment with ID ${id} not found`);
    }
    
    const updatedAssignment: BayAssignment = { ...assignment, ...update };
    this.bayAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }
  
  // Vehicle Tracking methods
  async getAllVehicleTrackings(): Promise<VehicleTracking[]> {
    return Array.from(this.vehicleTrackings.values());
  }
  
  async getVehicleTrackingById(id: number): Promise<VehicleTracking | undefined> {
    return this.vehicleTrackings.get(id);
  }
  
  async getVehicleTrackingByVehicleId(vehicleId: number): Promise<VehicleTracking | undefined> {
    return Array.from(this.vehicleTrackings.values())
      .find((tracking) => tracking.vehicleId === vehicleId);
  }
  
  async createVehicleTracking(insertTracking: InsertVehicleTracking): Promise<VehicleTracking> {
    const id = this.vehicleTrackingIdCounter++;
    const tracking: VehicleTracking = {
      ...insertTracking,
      id,
      exitTime: null,
      documents: {}
    };
    this.vehicleTrackings.set(id, tracking);
    return tracking;
  }
  
  async updateVehicleTracking(id: number, update: Partial<VehicleTracking>): Promise<VehicleTracking> {
    const tracking = await this.getVehicleTrackingById(id);
    if (!tracking) {
      throw new Error(`Vehicle Tracking with ID ${id} not found`);
    }
    
    const updatedTracking: VehicleTracking = { ...tracking, ...update };
    this.vehicleTrackings.set(id, updatedTracking);
    return updatedTracking;
  }
  
  // Yard Slot methods
  async getAllYardSlots(): Promise<YardSlot[]> {
    return Array.from(this.yardSlots.values());
  }
  
  async getYardSlotById(id: number): Promise<YardSlot | undefined> {
    return this.yardSlots.get(id);
  }
  
  async getYardSlotBySlotId(slotId: string): Promise<YardSlot | undefined> {
    return Array.from(this.yardSlots.values())
      .find((slot) => slot.slotId === slotId);
  }
  
  async createYardSlot(insertSlot: InsertYardSlot): Promise<YardSlot> {
    const id = this.yardSlotIdCounter++;
    const slot: YardSlot = {
      ...insertSlot,
      id,
      lastUpdated: new Date()
    };
    this.yardSlots.set(id, slot);
    return slot;
  }
  
  async updateYardSlot(id: number, update: Partial<YardSlot>): Promise<YardSlot> {
    const slot = await this.getYardSlotById(id);
    if (!slot) {
      throw new Error(`Yard Slot with ID ${id} not found`);
    }
    
    const updatedSlot: YardSlot = { ...slot, ...update };
    this.yardSlots.set(id, updatedSlot);
    return updatedSlot;
  }
  
  // Bay methods
  async getAllBays(): Promise<Bay[]> {
    return Array.from(this.bays.values());
  }
  
  async getAvailableBays(): Promise<Bay[]> {
    return Array.from(this.bays.values())
      .filter((bay) => bay.status === "available");
  }
  
  async getBayById(id: number): Promise<Bay | undefined> {
    return this.bays.get(id);
  }
  
  async getBayByBayId(bayId: string): Promise<Bay | undefined> {
    return Array.from(this.bays.values())
      .find((bay) => bay.bayId === bayId);
  }
  
  async createBay(insertBay: InsertBay): Promise<Bay> {
    const id = this.bayIdCounter++;
    const bay: Bay = {
      ...insertBay,
      id,
      lastUpdated: new Date()
    };
    this.bays.set(id, bay);
    return bay;
  }
  
  async updateBay(id: number, update: Partial<Bay>): Promise<Bay> {
    const bay = await this.getBayById(id);
    if (!bay) {
      throw new Error(`Bay with ID ${id} not found`);
    }
    
    const updatedBay: Bay = { ...bay, ...update };
    this.bays.set(id, updatedBay);
    return updatedBay;
  }
}

export const storage = new MemStorage();
