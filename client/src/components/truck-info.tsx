import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration, calculateDuration } from "@/lib/utils";

interface TruckInfoProps {
  vehicleNumber: string;
  driverName?: string;
  driverMobile?: string;
  cargoType?: string;
  status: string;
  arrivalTime: string | Date;
  gatePassNumber?: string;
  className?: string;
}

export default function TruckInfo({
  vehicleNumber,
  driverName,
  driverMobile,
  cargoType,
  status,
  arrivalTime,
  gatePassNumber,
  className
}: TruckInfoProps) {
  const waitingTime = calculateDuration(arrivalTime);
  
  return (
    <div className={`p-4 border rounded-md bg-white ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{vehicleNumber}</h3>
        <Badge 
          variant={
            status === "At Gate" ? "default" : 
            status === "In Yard" ? "secondary" :
            status === "At Weighbridge" ? "outline" :
            status === "At Bay" ? "destructive" : 
            "default"
          }
        >
          {status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        {driverName && (
          <div>
            <span className="text-gray-500">Driver: </span>
            <span className="font-medium">{driverName}</span>
          </div>
        )}
        
        {driverMobile && (
          <div>
            <span className="text-gray-500">Mobile: </span>
            <span className="font-medium">{driverMobile}</span>
          </div>
        )}
        
        {cargoType && (
          <div>
            <span className="text-gray-500">Cargo: </span>
            <span className="font-medium">{cargoType}</span>
          </div>
        )}
        
        {gatePassNumber && (
          <div>
            <span className="text-gray-500">Gate Pass: </span>
            <span className="font-medium">{gatePassNumber}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
        <div>Arrived: {formatDateTime(arrivalTime)}</div>
        <div>Waiting: {formatDuration(waitingTime)}</div>
      </div>
    </div>
  );
}
