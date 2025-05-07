import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface YardSlot {
  slotId: string;
  status: "available" | "occupied";
  vehicleNumber?: string;
}

interface YardMapProps {
  slots: YardSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function YardMap({
  slots = [],
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  readOnly = false
}: YardMapProps) {
  // Default slot configuration if no slots are provided
  const defaultSlots: YardSlot[] = [
    { slotId: "A1", status: "available" },
    { slotId: "A2", status: "available" },
    { slotId: "A3", status: "occupied" },
    { slotId: "A4", status: "occupied" },
    { slotId: "A5", status: "available" },
    { slotId: "A6", status: "available" },
    { slotId: "B1", status: "occupied" },
    { slotId: "B2", status: "occupied" },
    { slotId: "B3", status: "occupied" },
    { slotId: "B4", status: "available" },
    { slotId: "B5", status: "available" },
    { slotId: "B6", status: "available" },
    { slotId: "C1", status: "available" },
    { slotId: "C2", status: "available" },
    { slotId: "C3", status: "available" },
    { slotId: "C4", status: "occupied" },
    { slotId: "C5", status: "occupied" },
    { slotId: "C6", status: "occupied" },
    { slotId: "D1", status: "occupied" },
    { slotId: "D2", status: "available" },
    { slotId: "D3", status: "available" },
    { slotId: "D4", status: "available" },
    { slotId: "D5", status: "available" },
    { slotId: "D6", status: "occupied" },
  ];
  
  // Use provided slots or default ones
  const displaySlots = slots.length > 0 ? slots : defaultSlots;
  
  // Group slots by row (based on the first character of slotId)
  const slotsByRow: { [key: string]: YardSlot[] } = {};
  displaySlots.forEach((slot) => {
    const row = slot.slotId.charAt(0);
    if (!slotsByRow[row]) {
      slotsByRow[row] = [];
    }
    slotsByRow[row].push(slot);
  });
  
  // Get sorted rows
  const rows = Object.keys(slotsByRow).sort();
  
  const handleSlotClick = (slot: YardSlot) => {
    if (readOnly || slot.status === "occupied") return;
    onSelectSlot(slot.slotId);
  };

  if (isLoading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
          {Array.from({ length: 24 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-5"></div>
      
      {/* Grid Overlay for Yard Slots */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2">
        {rows.map((row, rowIndex) => (
          slotsByRow[row].map((slot, colIndex) => (
            <div
              key={slot.slotId}
              className={`
                rounded-md border flex items-center justify-center
                ${slot.status === "available" 
                  ? "bg-green-500 bg-opacity-25 border-green-500" 
                  : "bg-red-500 bg-opacity-25 border-red-500"}
                ${selectedSlot === slot.slotId 
                  ? "ring-2 ring-offset-1 ring-blue-500" 
                  : ""}
                ${slot.status === "available" && !readOnly 
                  ? "cursor-pointer hover:bg-green-500 hover:bg-opacity-40 transition-colors" 
                  : ""}
              `}
              onClick={() => handleSlotClick(slot)}
              title={slot.vehicleNumber ? `${slot.slotId}: ${slot.vehicleNumber}` : slot.slotId}
            >
              <span 
                className={`text-xs font-bold ${slot.status === "available" ? "text-green-500" : "text-red-500"}`}
              >
                {slot.slotId}
              </span>
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
