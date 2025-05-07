import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  facilityName?: string;
  vehicleInfo?: {
    vehicleNumber?: string;
    gatePass?: string;
    timeInfo?: string;
  };
}

export default function Header({
  title,
  description,
  facilityName = "Steel Plant - Main Gate",
  vehicleInfo
}: HeaderProps) {
  const { logoutMutation } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(now);

      const formattedTime = now.toLocaleTimeString();

      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title and Description */}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>

          {/* Right side: Vehicle info / facility + logout */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {vehicleInfo ? (
              <div className="flex flex-wrap items-center gap-2">
                {vehicleInfo.vehicleNumber && (
                  <div className="bg-neutral-100 px-3 py-1 rounded-md">
                    <span className="text-xs font-medium text-gray-700">Vehicle: </span>
                    <span className="text-xs font-medium">{vehicleInfo.vehicleNumber}</span>
                  </div>
                )}

                {vehicleInfo.gatePass && (
                  <div className="bg-neutral-100 px-3 py-1 rounded-md">
                    <span className="text-xs font-medium text-gray-700">Gate Pass: </span>
                    <span className="text-xs font-medium">{vehicleInfo.gatePass}</span>
                  </div>
                )}

                {vehicleInfo.timeInfo && (
                  <div className="bg-neutral-100 px-3 py-1 rounded-md">
                    <span className="text-xs font-medium text-gray-700">
                      {vehicleInfo.timeInfo.split(":")[0]}:
                    </span>
                    <span className="text-xs font-medium">{vehicleInfo.timeInfo.split(":")[1]}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span>Facility: {facilityName}</span>
                <span className="text-gray-700 font-medium">
                  {currentDate} | {currentTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
