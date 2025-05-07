import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

interface AnprCameraProps {
  onDetection: (plateNumber: string) => void;
  autoDetect?: boolean;
  refreshInterval?: number;
}

export default function AnprCamera({
  onDetection,
  autoDetect = true,
  refreshInterval = 5000
}: AnprCameraProps) {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [streamActive, setStreamActive] = useState<boolean>(true);
  
  // Sample license plates for simulation
  const samplePlates = [
    "MH 04 AB 1234",
    "DL 05 CD 5678",
    "KA 03 EF 9012",
    "TN 02 GH 3456",
    "HR 01 IJ 7890"
  ];
  
  useEffect(() => {
    if (autoDetect) {
      simulateDetection();
    }
    
    // Set up interval for refreshing camera feed in real implementation
    return () => {
      // Clean up any intervals or camera resources
    };
  }, [autoDetect]);
  
  const simulateDetection = () => {
    setIsDetecting(true);
    
    // Simulate ANPR processing delay
    setTimeout(() => {
      // For demo, use the first sample plate
      const detectedPlate = samplePlates[0];
      onDetection(detectedPlate);
      setIsDetecting(false);
    }, 1500);
  };
  
  const handleManualCapture = () => {
    simulateDetection();
  };
  
  const handleRefreshFeed = () => {
    setStreamActive(false);
    setTimeout(() => setStreamActive(true), 500);
  };
  
  return (
    <div className="relative">
      <div 
        className={`camera-feed h-56 bg-gray-200 rounded-lg flex items-center justify-center relative ${!streamActive ? 'opacity-50' : ''}`}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1520106212299-d99c443e4568?auto=format&fit=crop&w=800&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
        <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center">
          <span className="animate-pulse mr-1">●</span> Live
        </div>
        
        {isDetecting && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-pulse flex space-x-4">
              <div className="bg-white bg-opacity-75 px-4 py-2 rounded-md">
                <span className="font-mono">Detecting...</span>
              </div>
            </div>
          </div>
        )}
        
        {!isDetecting && (
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white bg-opacity-75 hover:bg-white"
              onClick={handleRefreshFeed}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white bg-opacity-75 hover:bg-white"
              onClick={handleManualCapture}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
