// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
var MemStorage = class {
  users;
  vehicles;
  gatePasses;
  weighbridgeRecords;
  yardAllocations;
  bayAssignments;
  vehicleTrackings;
  yardSlots;
  bays;
  // Counters for IDs
  userIdCounter;
  vehicleIdCounter;
  gatePassIdCounter;
  weighbridgeRecordIdCounter;
  yardAllocationIdCounter;
  bayAssignmentIdCounter;
  vehicleTrackingIdCounter;
  yardSlotIdCounter;
  bayIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.vehicles = /* @__PURE__ */ new Map();
    this.gatePasses = /* @__PURE__ */ new Map();
    this.weighbridgeRecords = /* @__PURE__ */ new Map();
    this.yardAllocations = /* @__PURE__ */ new Map();
    this.bayAssignments = /* @__PURE__ */ new Map();
    this.vehicleTrackings = /* @__PURE__ */ new Map();
    this.yardSlots = /* @__PURE__ */ new Map();
    this.bays = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.gatePassIdCounter = 1;
    this.weighbridgeRecordIdCounter = 1;
    this.yardAllocationIdCounter = 1;
    this.bayAssignmentIdCounter = 1;
    this.vehicleTrackingIdCounter = 1;
    this.yardSlotIdCounter = 1;
    this.bayIdCounter = 1;
    this.initializeSampleData();
  }
  initializeSampleData() {
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
    for (const row of ["A", "B", "C", "D"]) {
      for (let col = 1; col <= 6; col++) {
        const slotId = `${row}${col}`;
        this.createYardSlot({
          slotId,
          yardArea: "Main Yard",
          status: "available"
        });
      }
    }
    for (let i = 1; i <= 5; i++) {
      const bayType = i % 2 === 0 ? "loading" : "unloading";
      this.createBay({
        bayId: `Bay ${i}`,
        bayType,
        status: "available"
      });
    }
    this.createGatePass({
      gatePassNumber: "GP-0012345",
      scheduleTime: "15 Aug 2023, 13:00 - 15:00",
      cargoType: "Steel Coils",
      isValid: true,
      isUsed: false
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async getAllUsers() {
    return Array.from(this.users.values());
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = {
      ...insertUser,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, update) {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    const updatedUser = {
      ...user,
      ...update,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async deleteUser(id) {
    if (!this.users.has(id)) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.users.delete(id);
  }
  // Vehicle methods
  async getAllVehicles() {
    return Array.from(this.vehicles.values());
  }
  async getVehicleById(id) {
    return this.vehicles.get(id);
  }
  async getVehicleByNumber(vehicleNumber) {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );
  }
  async createVehicle(insertVehicle) {
    const id = this.vehicleIdCounter++;
    const vehicle = {
      ...insertVehicle,
      id,
      lastSeenAt: /* @__PURE__ */ new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  async updateVehicle(id, update) {
    const vehicle = await this.getVehicleById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${id} not found`);
    }
    const updatedVehicle = { ...vehicle, ...update };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  // Gate Pass methods
  async getAllGatePasses() {
    return Array.from(this.gatePasses.values());
  }
  async getGatePassById(id) {
    return this.gatePasses.get(id);
  }
  async getGatePassByNumber(gatePassNumber) {
    return Array.from(this.gatePasses.values()).find(
      (gatePass) => gatePass.gatePassNumber === gatePassNumber
    );
  }
  async createGatePass(insertGatePass) {
    const id = this.gatePassIdCounter++;
    const gatePass = {
      ...insertGatePass,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.gatePasses.set(id, gatePass);
    return gatePass;
  }
  async updateGatePass(id, update) {
    const gatePass = await this.getGatePassById(id);
    if (!gatePass) {
      throw new Error(`Gate Pass with ID ${id} not found`);
    }
    const updatedGatePass = { ...gatePass, ...update };
    this.gatePasses.set(id, updatedGatePass);
    return updatedGatePass;
  }
  // Weighbridge Record methods
  async getAllWeighbridgeRecords() {
    return Array.from(this.weighbridgeRecords.values());
  }
  async getWeighbridgeRecordById(id) {
    return this.weighbridgeRecords.get(id);
  }
  async getWeighbridgeRecordsByVehicleId(vehicleId) {
    return Array.from(this.weighbridgeRecords.values()).filter((record) => record.vehicleId === vehicleId);
  }
  async getWeighbridgeRecordByVehicleAndType(vehicleId, type) {
    return Array.from(this.weighbridgeRecords.values()).find((record) => record.vehicleId === vehicleId && record.type === type);
  }
  async createWeighbridgeRecord(insertRecord) {
    const id = this.weighbridgeRecordIdCounter++;
    const record = {
      ...insertRecord,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.weighbridgeRecords.set(id, record);
    return record;
  }
  // Yard Allocation methods
  async getAllYardAllocations() {
    return Array.from(this.yardAllocations.values());
  }
  async getYardAllocationById(id) {
    return this.yardAllocations.get(id);
  }
  async getYardAllocationByVehicleId(vehicleId) {
    return Array.from(this.yardAllocations.values()).find((allocation) => allocation.vehicleId === vehicleId && allocation.status === "allocated");
  }
  async createYardAllocation(insertAllocation) {
    const id = this.yardAllocationIdCounter++;
    const allocation = {
      ...insertAllocation,
      id,
      allocatedAt: /* @__PURE__ */ new Date(),
      releasedAt: null
    };
    this.yardAllocations.set(id, allocation);
    return allocation;
  }
  async updateYardAllocation(id, update) {
    const allocation = await this.getYardAllocationById(id);
    if (!allocation) {
      throw new Error(`Yard Allocation with ID ${id} not found`);
    }
    const updatedAllocation = { ...allocation, ...update };
    this.yardAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }
  // Bay Assignment methods
  async getAllBayAssignments() {
    return Array.from(this.bayAssignments.values());
  }
  async getBayAssignmentById(id) {
    return this.bayAssignments.get(id);
  }
  async getBayAssignmentByVehicleId(vehicleId) {
    return Array.from(this.bayAssignments.values()).find((assignment) => assignment.vehicleId === vehicleId && assignment.status === "in_progress");
  }
  async getBayAssignmentByVehicleAndBay(vehicleId, bayId) {
    return Array.from(this.bayAssignments.values()).find((assignment) => assignment.vehicleId === vehicleId && assignment.bayId === bayId);
  }
  async createBayAssignment(insertAssignment) {
    const id = this.bayAssignmentIdCounter++;
    const assignment = {
      ...insertAssignment,
      id,
      startTime: /* @__PURE__ */ new Date(),
      endTime: null
    };
    this.bayAssignments.set(id, assignment);
    return assignment;
  }
  async updateBayAssignment(id, update) {
    const assignment = await this.getBayAssignmentById(id);
    if (!assignment) {
      throw new Error(`Bay Assignment with ID ${id} not found`);
    }
    const updatedAssignment = { ...assignment, ...update };
    this.bayAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }
  // Vehicle Tracking methods
  async getAllVehicleTrackings() {
    return Array.from(this.vehicleTrackings.values());
  }
  async getVehicleTrackingById(id) {
    return this.vehicleTrackings.get(id);
  }
  async getVehicleTrackingByVehicleId(vehicleId) {
    return Array.from(this.vehicleTrackings.values()).find((tracking) => tracking.vehicleId === vehicleId);
  }
  async createVehicleTracking(insertTracking) {
    const id = this.vehicleTrackingIdCounter++;
    const tracking = {
      ...insertTracking,
      id,
      exitTime: null,
      documents: {}
    };
    this.vehicleTrackings.set(id, tracking);
    return tracking;
  }
  async updateVehicleTracking(id, update) {
    const tracking = await this.getVehicleTrackingById(id);
    if (!tracking) {
      throw new Error(`Vehicle Tracking with ID ${id} not found`);
    }
    const updatedTracking = { ...tracking, ...update };
    this.vehicleTrackings.set(id, updatedTracking);
    return updatedTracking;
  }
  // Yard Slot methods
  async getAllYardSlots() {
    return Array.from(this.yardSlots.values());
  }
  async getYardSlotById(id) {
    return this.yardSlots.get(id);
  }
  async getYardSlotBySlotId(slotId) {
    return Array.from(this.yardSlots.values()).find((slot) => slot.slotId === slotId);
  }
  async createYardSlot(insertSlot) {
    const id = this.yardSlotIdCounter++;
    const slot = {
      ...insertSlot,
      id,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.yardSlots.set(id, slot);
    return slot;
  }
  async updateYardSlot(id, update) {
    const slot = await this.getYardSlotById(id);
    if (!slot) {
      throw new Error(`Yard Slot with ID ${id} not found`);
    }
    const updatedSlot = { ...slot, ...update };
    this.yardSlots.set(id, updatedSlot);
    return updatedSlot;
  }
  // Bay methods
  async getAllBays() {
    return Array.from(this.bays.values());
  }
  async getAvailableBays() {
    return Array.from(this.bays.values()).filter((bay) => bay.status === "available");
  }
  async getBayById(id) {
    return this.bays.get(id);
  }
  async getBayByBayId(bayId) {
    return Array.from(this.bays.values()).find((bay) => bay.bayId === bayId);
  }
  async createBay(insertBay) {
    const id = this.bayIdCounter++;
    const bay = {
      ...insertBay,
      id,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.bays.set(id, bay);
    return bay;
  }
  async updateBay(id, update) {
    const bay = await this.getBayById(id);
    if (!bay) {
      throw new Error(`Bay with ID ${id} not found`);
    }
    const updatedBay = { ...bay, ...update };
    this.bays.set(id, updatedBay);
    return updatedBay;
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    return supplied === stored;
  }
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "gsc-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        if (user.status === "inactive") {
          return done(null, false, { message: "Account is inactive. Please contact administrator." });
        }
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({
          message: `Access denied. You are not authorized as a ${req.body.role}.`
        });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });
  app2.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    try {
      const users2 = await storage.getAllUsers();
      const sanitizedUsers = users2.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (req.body.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const userId = parseInt(req.params.id);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (req.body.username && req.body.username !== user.username) {
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      if (req.body.email && req.body.email !== user.email) {
        const existingEmail = await storage.getUserByEmail(req.body.email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      const updates = { ...req.body };
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      } else {
        delete updates.password;
      }
      const updatedUser = await storage.updateUser(userId, updates);
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const userId = parseInt(req.params.id);
    try {
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (userId === 1) {
        return res.status(400).json({ message: "Cannot delete primary administrator account" });
      }
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
}

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  mobileNumber: text("mobile_number"),
  role: text("role").notNull().default("security"),
  fullName: text("full_name").notNull(),
  status: text("status").notNull().default("active"),
  accessRights: json("access_rights").$type(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  mobileNumber: true,
  role: true,
  fullName: true,
  status: true,
  accessRights: true
});
var vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  driverName: text("driver_name"),
  driverMobile: text("driver_mobile"),
  truckType: text("truck_type"),
  currentStatus: text("current_status").notNull().default("pending"),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow()
});
var insertVehicleSchema = createInsertSchema(vehicles).pick({
  vehicleNumber: true,
  driverName: true,
  driverMobile: true,
  truckType: true,
  currentStatus: true
});
var gatePasses = pgTable("gate_passes", {
  id: serial("id").primaryKey(),
  gatePassNumber: text("gate_pass_number").notNull().unique(),
  vehicleId: integer("vehicle_id"),
  scheduleTime: text("schedule_time"),
  cargoType: text("cargo_type"),
  isValid: boolean("is_valid").notNull().default(true),
  isUsed: boolean("is_used").notNull().default(false),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertGatePassSchema = createInsertSchema(gatePasses).pick({
  gatePassNumber: true,
  vehicleId: true,
  scheduleTime: true,
  cargoType: true,
  isValid: true,
  isUsed: true,
  remarks: true
});
var weighbridgeRecords = pgTable("weighbridge_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  weight: integer("weight").notNull(),
  unit: text("unit").notNull().default("kg"),
  type: text("type").notNull(),
  // entry or exit
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  remarks: text("remarks"),
  manualEntry: boolean("manual_entry").notNull().default(false)
});
var insertWeighbridgeRecordSchema = createInsertSchema(weighbridgeRecords).pick({
  vehicleId: true,
  weight: true,
  unit: true,
  type: true,
  remarks: true,
  manualEntry: true
});
var yardAllocations = pgTable("yard_allocations", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  slotId: text("slot_id").notNull(),
  yardArea: text("yard_area").notNull(),
  allocatedAt: timestamp("allocated_at").notNull().defaultNow(),
  releasedAt: timestamp("released_at"),
  status: text("status").notNull().default("allocated")
  // allocated, released
});
var insertYardAllocationSchema = createInsertSchema(yardAllocations).pick({
  vehicleId: true,
  slotId: true,
  yardArea: true,
  status: true
});
var bayAssignments = pgTable("bay_assignments", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  bayId: text("bay_id").notNull(),
  operationType: text("operation_type").notNull(),
  // loading, unloading
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("in_progress"),
  // in_progress, completed
  operatorNotes: text("operator_notes")
});
var insertBayAssignmentSchema = createInsertSchema(bayAssignments).pick({
  vehicleId: true,
  bayId: true,
  operationType: true,
  operatorNotes: true,
  status: true
});
var vehicleTracking = pgTable("vehicle_tracking", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  gatePassId: integer("gate_pass_id"),
  entryTime: timestamp("entry_time"),
  exitTime: timestamp("exit_time"),
  currentLocation: text("current_location"),
  // gate, weighbridge, yard, bay, exit
  currentStatus: text("current_status").notNull().default("pending"),
  remarks: text("remarks"),
  documents: json("documents").default({})
  // For POD, LR, Waybill, etc.
});
var insertVehicleTrackingSchema = createInsertSchema(vehicleTracking).pick({
  vehicleId: true,
  gatePassId: true,
  currentLocation: true,
  currentStatus: true,
  remarks: true
});
var yardSlots = pgTable("yard_slots", {
  id: serial("id").primaryKey(),
  slotId: text("slot_id").notNull().unique(),
  yardArea: text("yard_area").notNull(),
  status: text("status").notNull().default("available"),
  // available, occupied
  vehicleId: integer("vehicle_id"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});
var insertYardSlotSchema = createInsertSchema(yardSlots).pick({
  slotId: true,
  yardArea: true,
  status: true,
  vehicleId: true
});
var bays = pgTable("bays", {
  id: serial("id").primaryKey(),
  bayId: text("bay_id").notNull().unique(),
  bayType: text("bay_type").notNull(),
  // loading, unloading, both
  status: text("status").notNull().default("available"),
  // available, occupied
  vehicleId: integer("vehicle_id"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});
var insertBaySchema = createInsertSchema(bays).pick({
  bayId: true,
  bayType: true,
  status: true,
  vehicleId: true
});

// server/routes.ts
var clients = /* @__PURE__ */ new Map();
function broadcastMessage(type, payload) {
  const message = JSON.stringify({ type, payload });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
async function registerRoutes(app2) {
  setupAuth(app2);
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    ws.on("message", (messageBuffer) => {
      try {
        const message = JSON.parse(messageBuffer.toString());
        console.log(`Received message from client ${clientId}:`, message);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    });
    ws.on("close", () => {
      clients.delete(clientId);
    });
  });
  app2.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles2 = await storage.getAllVehicles();
      res.json(vehicles2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });
  app2.get("/api/vehicles/:id", async (req, res) => {
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
  app2.get("/api/vehicles/number/:vehicleNumber", async (req, res) => {
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
  app2.get("/api/vehicles/validate/:vehicleNumber", async (req, res) => {
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
  app2.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data", error });
    }
  });
  app2.get("/api/gate-passes", async (req, res) => {
    try {
      const gatePasses2 = await storage.getAllGatePasses();
      res.json(gatePasses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gate passes" });
    }
  });
  app2.get("/api/gate-passes/:id", async (req, res) => {
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
  app2.get("/api/gate-passes/number/:gatePassNumber", async (req, res) => {
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
  app2.get("/api/gate-passes/validate/:gatePassNumber", async (req, res) => {
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
  app2.post("/api/gate-passes", async (req, res) => {
    try {
      const validatedData = insertGatePassSchema.parse(req.body);
      const gatePass = await storage.createGatePass(validatedData);
      res.status(201).json(gatePass);
    } catch (error) {
      res.status(400).json({ message: "Invalid gate pass data", error });
    }
  });
  app2.post("/api/gate/entry", async (req, res) => {
    try {
      const { vehicleNumber, gatePassNumber, driverName, driverMobile, manualOverride, remarks } = req.body;
      let vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        vehicle = await storage.createVehicle({
          vehicleNumber,
          driverName,
          driverMobile,
          currentStatus: "at_gate"
        });
      } else {
        vehicle = await storage.updateVehicle(vehicle.id, {
          driverName: driverName || vehicle.driverName,
          driverMobile: driverMobile || vehicle.driverMobile,
          currentStatus: "at_gate",
          lastSeenAt: /* @__PURE__ */ new Date()
        });
      }
      let gatePass = null;
      if (gatePassNumber) {
        gatePass = await storage.getGatePassByNumber(gatePassNumber);
        if (gatePass) {
          gatePass = await storage.updateGatePass(gatePass.id, {
            isUsed: true,
            vehicleId: vehicle.id
          });
        }
      }
      const tracking = await storage.createVehicleTracking({
        vehicleId: vehicle.id,
        gatePassId: gatePass?.id,
        entryTime: /* @__PURE__ */ new Date(),
        currentLocation: "gate",
        currentStatus: "entered",
        remarks
      });
      broadcastMessage("VEHICLE_UPDATE", {
        action: "ENTRY",
        vehicleNumber,
        status: "at_gate",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.post("/api/gate/exit", async (req, res) => {
    try {
      const { vehicleNumber, gatePass, exitTime, remarks } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "exited",
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          exitTime: new Date(exitTime),
          currentLocation: "exit",
          currentStatus: "exited",
          remarks: remarks || tracking.remarks
        });
      }
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
  app2.get("/api/weighbridge/entry-weight/:vehicleNumber", async (req, res) => {
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
  app2.post("/api/weighbridge/entry", async (req, res) => {
    try {
      const { vehicleNumber, gatePass, weight, unit, type, loadType, signature, remarks, manualEntry } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const weighbridgeRecord = await storage.createWeighbridgeRecord({
        vehicleId: vehicle.id,
        weight,
        unit,
        type: "entry",
        remarks,
        manualEntry
      });
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "weighed_in",
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "weighbridge",
          currentStatus: "weighed_in"
        });
      }
      broadcastMessage("WEIGHBRIDGE_UPDATE", {
        action: "ENTRY_WEIGHT",
        vehicleNumber,
        weight,
        unit,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.post("/api/weighbridge/exit", async (req, res) => {
    try {
      const { vehicleNumber, gatePass, weight, unit, remarks, manualEntry } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const weighbridgeRecord = await storage.createWeighbridgeRecord({
        vehicleId: vehicle.id,
        weight,
        unit,
        type: "exit",
        remarks,
        manualEntry
      });
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "weighed_out",
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "exit_weighbridge",
          currentStatus: "weighed_out"
        });
      }
      broadcastMessage("WEIGHBRIDGE_UPDATE", {
        action: "EXIT_WEIGHT",
        vehicleNumber,
        weight,
        unit,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.get("/api/yard/slots", async (req, res) => {
    try {
      const slots = await storage.getAllYardSlots();
      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch yard slots" });
    }
  });
  app2.post("/api/yard/allocate", async (req, res) => {
    try {
      const { vehicleNumber, slotId, yardArea, truckType, cargoType, manualAssignment } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const slot = await storage.getYardSlotBySlotId(slotId);
      if (slot && slot.status === "occupied") {
        return res.status(400).json({ message: "Yard slot is already occupied" });
      }
      let updatedSlot;
      if (slot) {
        updatedSlot = await storage.updateYardSlot(slot.id, {
          status: "occupied",
          vehicleId: vehicle.id,
          lastUpdated: /* @__PURE__ */ new Date()
        });
      } else {
        updatedSlot = await storage.createYardSlot({
          slotId,
          yardArea,
          status: "occupied",
          vehicleId: vehicle.id
        });
      }
      const yardAllocation = await storage.createYardAllocation({
        vehicleId: vehicle.id,
        slotId,
        yardArea,
        status: "allocated"
      });
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "in_yard",
        truckType,
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "yard",
          currentStatus: "waiting"
        });
      }
      broadcastMessage("YARD_UPDATE", {
        action: "ALLOCATE",
        vehicleNumber,
        slotId,
        yardArea,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.get("/api/bays/available", async (req, res) => {
    try {
      const bays2 = await storage.getAvailableBays();
      res.json(bays2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available bays" });
    }
  });
  app2.post("/api/bays/assign", async (req, res) => {
    try {
      const { vehicleNumber, bayId, operationType, cargoType, operatorNotes } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const bay = await storage.getBayByBayId(bayId);
      if (bay && bay.status === "occupied") {
        return res.status(400).json({ message: "Bay is already occupied" });
      }
      let updatedBay;
      if (bay) {
        updatedBay = await storage.updateBay(bay.id, {
          status: "occupied",
          vehicleId: vehicle.id,
          lastUpdated: /* @__PURE__ */ new Date()
        });
      } else {
        updatedBay = await storage.createBay({
          bayId,
          bayType: operationType.toLowerCase(),
          status: "occupied",
          vehicleId: vehicle.id
        });
      }
      const bayAssignment = await storage.createBayAssignment({
        vehicleId: vehicle.id,
        bayId,
        operationType,
        operatorNotes,
        status: "in_progress"
      });
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "at_bay",
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const yardAllocation = await storage.getYardAllocationByVehicleId(vehicle.id);
      if (yardAllocation) {
        await storage.updateYardAllocation(yardAllocation.id, {
          status: "released",
          releasedAt: /* @__PURE__ */ new Date()
        });
        const slot = await storage.getYardSlotBySlotId(yardAllocation.slotId);
        if (slot) {
          await storage.updateYardSlot(slot.id, {
            status: "available",
            vehicleId: null,
            lastUpdated: /* @__PURE__ */ new Date()
          });
        }
      }
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentLocation: "bay",
          currentStatus: "loading_unloading"
        });
      }
      broadcastMessage("BAY_UPDATE", {
        action: "ASSIGN",
        vehicleNumber,
        bayId,
        operationType,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.post("/api/bays/complete", async (req, res) => {
    try {
      const { vehicleNumber, bayId, operationTime, operatorNotes } = req.body;
      const vehicle = await storage.getVehicleByNumber(vehicleNumber);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const bayAssignment = await storage.getBayAssignmentByVehicleAndBay(vehicle.id, bayId);
      if (!bayAssignment) {
        return res.status(404).json({ message: "Bay assignment not found" });
      }
      const updatedAssignment = await storage.updateBayAssignment(bayAssignment.id, {
        status: "completed",
        endTime: /* @__PURE__ */ new Date(),
        operatorNotes: operatorNotes || bayAssignment.operatorNotes
      });
      const bay = await storage.getBayByBayId(bayId);
      if (bay) {
        await storage.updateBay(bay.id, {
          status: "available",
          vehicleId: null,
          lastUpdated: /* @__PURE__ */ new Date()
        });
      }
      await storage.updateVehicle(vehicle.id, {
        currentStatus: "bay_completed",
        lastSeenAt: /* @__PURE__ */ new Date()
      });
      const tracking = await storage.getVehicleTrackingByVehicleId(vehicle.id);
      if (tracking) {
        await storage.updateVehicleTracking(tracking.id, {
          currentStatus: "ready_for_exit"
        });
      }
      broadcastMessage("BAY_UPDATE", {
        action: "COMPLETE",
        vehicleNumber,
        bayId,
        operationTime,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
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
  app2.get("/api/dashboard", async (req, res) => {
    try {
      const dateFilter = req.query.dateFilter || "today";
      const shiftFilter = req.query.shiftFilter || "all";
      const vehicles2 = await storage.getAllVehicles();
      const yardSlots2 = await storage.getAllYardSlots();
      const occupiedSlots = yardSlots2.filter((slot) => slot.status === "occupied").length;
      const totalSlots = yardSlots2.length;
      const yardOccupancy = totalSlots > 0 ? occupiedSlots / totalSlots * 100 : 0;
      const bays2 = await storage.getAllBays();
      const bayUtilization = bays2.map((bay) => ({
        bayId: bay.bayId,
        status: bay.status,
        utilization: Math.random() * 100
        // This would be calculated based on historical data
      }));
      const weighbridgeRecords2 = await storage.getAllWeighbridgeRecords();
      const activeVehicles = vehicles2.filter((v) => v.currentStatus !== "exited");
      res.json({
        vehicleCount: {
          total: vehicles2.length,
          active: activeVehicles.length,
          atGate: vehicles2.filter((v) => v.currentStatus === "at_gate").length,
          inYard: vehicles2.filter((v) => v.currentStatus === "in_yard").length,
          atBay: vehicles2.filter((v) => v.currentStatus === "at_bay").length,
          exiting: vehicles2.filter((v) => v.currentStatus === "weighed_out").length
        },
        yardOccupancy: {
          percentage: yardOccupancy,
          occupied: occupiedSlots,
          total: totalSlots
        },
        bayUtilization,
        weighbridgeStats: {
          today: {
            inbound: weighbridgeRecords2.filter((r) => r.type === "entry").length,
            outbound: weighbridgeRecords2.filter((r) => r.type === "exit").length
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig(async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      // Dynamically import the cartographer plugin only when necessary
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ];
  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets")
      }
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist", "public"),
      emptyOutDir: true
    }
  };
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path2.dirname(__filename);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "../dist/public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/", (_req, res) => {
  res.send("App is running and reachable at root path!");
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`Serving on http://0.0.0.0:${port}`);
  });
})();
