import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  mobileNumber: text("mobile_number"),
  role: text("role").notNull().default("security"),
  fullName: text("full_name").notNull(),
  status: text("status").notNull().default("active"),
  accessRights: json("access_rights").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  mobileNumber: true,
  role: true,
  fullName: true,
  status: true,
  accessRights: true,
});

// Vehicle model for trucks
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  driverName: text("driver_name"),
  driverMobile: text("driver_mobile"),
  truckType: text("truck_type"),
  currentStatus: text("current_status").notNull().default("pending"),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  vehicleNumber: true,
  driverName: true,
  driverMobile: true,
  truckType: true,
  currentStatus: true,
});

// Gate pass model
export const gatePasses = pgTable("gate_passes", {
  id: serial("id").primaryKey(),
  gatePassNumber: text("gate_pass_number").notNull().unique(),
  vehicleId: integer("vehicle_id"),
  scheduleTime: text("schedule_time"),
  cargoType: text("cargo_type"),
  isValid: boolean("is_valid").notNull().default(true),
  isUsed: boolean("is_used").notNull().default(false),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGatePassSchema = createInsertSchema(gatePasses).pick({
  gatePassNumber: true,
  vehicleId: true,
  scheduleTime: true,
  cargoType: true,
  isValid: true,
  isUsed: true,
  remarks: true,
});

// Weighbridge records
export const weighbridgeRecords = pgTable("weighbridge_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  weight: integer("weight").notNull(),
  unit: text("unit").notNull().default("kg"),
  type: text("type").notNull(), // entry or exit
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  remarks: text("remarks"),
  manualEntry: boolean("manual_entry").notNull().default(false),
});

export const insertWeighbridgeRecordSchema = createInsertSchema(weighbridgeRecords).pick({
  vehicleId: true,
  weight: true,
  unit: true,
  type: true,
  remarks: true,
  manualEntry: true,
});

// Yard allocations
export const yardAllocations = pgTable("yard_allocations", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  slotId: text("slot_id").notNull(),
  yardArea: text("yard_area").notNull(),
  allocatedAt: timestamp("allocated_at").notNull().defaultNow(),
  releasedAt: timestamp("released_at"),
  status: text("status").notNull().default("allocated"), // allocated, released
});

export const insertYardAllocationSchema = createInsertSchema(yardAllocations).pick({
  vehicleId: true,
  slotId: true,
  yardArea: true,
  status: true,
});

// Bay assignments
export const bayAssignments = pgTable("bay_assignments", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  bayId: text("bay_id").notNull(),
  operationType: text("operation_type").notNull(), // loading, unloading
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  operatorNotes: text("operator_notes"),
});

export const insertBayAssignmentSchema = createInsertSchema(bayAssignments).pick({
  vehicleId: true,
  bayId: true,
  operationType: true,
  operatorNotes: true,
  status: true,
});

// Vehicle tracking throughout the facility
export const vehicleTracking = pgTable("vehicle_tracking", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  gatePassId: integer("gate_pass_id"),
  entryTime: timestamp("entry_time"),
  exitTime: timestamp("exit_time"),
  currentLocation: text("current_location"), // gate, weighbridge, yard, bay, exit
  currentStatus: text("current_status").notNull().default("pending"),
  remarks: text("remarks"),
  documents: json("documents").default({}), // For POD, LR, Waybill, etc.
});

export const insertVehicleTrackingSchema = createInsertSchema(vehicleTracking).pick({
  vehicleId: true,
  gatePassId: true,
  currentLocation: true,
  currentStatus: true,
  remarks: true,
});

// Yard slots definition
export const yardSlots = pgTable("yard_slots", {
  id: serial("id").primaryKey(),
  slotId: text("slot_id").notNull().unique(),
  yardArea: text("yard_area").notNull(),
  status: text("status").notNull().default("available"), // available, occupied
  vehicleId: integer("vehicle_id"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertYardSlotSchema = createInsertSchema(yardSlots).pick({
  slotId: true,
  yardArea: true,
  status: true,
  vehicleId: true,
});

// Bay definition
export const bays = pgTable("bays", {
  id: serial("id").primaryKey(),
  bayId: text("bay_id").notNull().unique(),
  bayType: text("bay_type").notNull(), // loading, unloading, both
  status: text("status").notNull().default("available"), // available, occupied
  vehicleId: integer("vehicle_id"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertBaySchema = createInsertSchema(bays).pick({
  bayId: true,
  bayType: true,
  status: true,
  vehicleId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type GatePass = typeof gatePasses.$inferSelect;
export type InsertGatePass = z.infer<typeof insertGatePassSchema>;

export type WeighbridgeRecord = typeof weighbridgeRecords.$inferSelect;
export type InsertWeighbridgeRecord = z.infer<typeof insertWeighbridgeRecordSchema>;

export type YardAllocation = typeof yardAllocations.$inferSelect;
export type InsertYardAllocation = z.infer<typeof insertYardAllocationSchema>;

export type BayAssignment = typeof bayAssignments.$inferSelect;
export type InsertBayAssignment = z.infer<typeof insertBayAssignmentSchema>;

export type VehicleTracking = typeof vehicleTracking.$inferSelect;
export type InsertVehicleTracking = z.infer<typeof insertVehicleTrackingSchema>;

export type YardSlot = typeof yardSlots.$inferSelect;
export type InsertYardSlot = z.infer<typeof insertYardSlotSchema>;

export type Bay = typeof bays.$inferSelect;
export type InsertBay = z.infer<typeof insertBaySchema>;
