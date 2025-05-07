import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle } from "lucide-react";
import YardMap from "@/components/yard-map";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function YardAllocation() {
  const { toast } = useToast();
  
  // Mock data - these would come from previous screen or API in a real implementation
  const vehicleInfo = {
    vehicleNumber: "MH 04 AB 1234",
    timeInfo: "Arrival: 14:35:23"
  };

  const [selectedSlot, setSelectedSlot] = useState<string | null>("A1");
  const [truckType, setTruckType] = useState<string>("Standard Truck");
  const [cargoType, setCargoType] = useState<string>("Steel Coils");
  const [yardArea, setYardArea] = useState<string>("Main Yard");
  const [manualSlot, setManualSlot] = useState<boolean>(false);
  const [parkApiStatus, setParkApiStatus] = useState<string>("online");
  
  // Query to get yard slots
  const yardSlotsQuery = useQuery({
    queryKey: ["/api/yard/slots"],
  });

  // Mutation for allocating yard slot
  const allocateSlotMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/yard/allocate", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Yard slot ${selectedSlot} allocated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/yard/slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to allocate yard slot: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleAllocateSlot = () => {
    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a yard slot to allocate",
        variant: "destructive",
      });
      return;
    }
    
    allocateSlotMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      slotId: selectedSlot,
      yardArea,
      truckType,
      cargoType,
      manualAssignment: manualSlot
    });
  };

  const handleRefreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/yard/slots"] });
    
    toast({
      title: "Refreshed",
      description: "Yard slot statuses have been refreshed",
    });
  };

  return (
    <div className="py-6">
      <Header
        title="Yard Allocation"
        description="Allocate waiting space if no bay is available"
        vehicleInfo={vehicleInfo}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-5 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Yard Map */}
            <Card className="lg:col-span-2 w-full">
              <CardContent className="p-6">
                <div className="border-b border-gray-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h2 className="text-lg font-medium text-gray-900">Yard Map</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-500 bg-opacity-10 text-green-500 border-green-500">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                      Available
                    </Badge>
                    <Badge variant="outline" className="bg-red-500 bg-opacity-10 text-red-500 border-red-500">
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-1 inline-block"></span>
                      Occupied
                    </Badge>
                  </div>
                </div>

                <YardMap
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSlotSelect}
                  slots={yardSlotsQuery.data || []}
                  isLoading={yardSlotsQuery.isPending}
                />

                {selectedSlot && (
                  <div className="mt-6 bg-primary bg-opacity-5 rounded-md p-4">
                    <p className="text-sm text-primary font-medium">
                      Selected Slot: <span className="font-bold">{selectedSlot}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This slot is recommended based on truck type and estimated waiting time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="w-full">
              <CardContent className="p-6 space-y-6">
                <div className="border-b border-gray-200 pb-5">
                  <h2 className="text-lg font-medium text-gray-900">Slot Allocation</h2>
                </div>

                {/* Truck Type */}
                <div>
                  <Label htmlFor="truck-type" className="block text-sm font-medium text-gray-700">
                    Truck Type
                  </Label>
                  <Select value={truckType} onValueChange={setTruckType}>
                    <SelectTrigger id="truck-type">
                      <SelectValue placeholder="Select Truck Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard Truck">Standard Truck</SelectItem>
                      <SelectItem value="Flatbed">Flatbed</SelectItem>
                      <SelectItem value="Container Truck">Container Truck</SelectItem>
                      <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cargo Type */}
                <div>
                  <Label htmlFor="cargo-type" className="block text-sm font-medium text-gray-700">
                    Cargo Type
                  </Label>
                  <Select value={cargoType} onValueChange={setCargoType}>
                    <SelectTrigger id="cargo-type">
                      <SelectValue placeholder="Select Cargo Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel Coils">Steel Coils</SelectItem>
                      <SelectItem value="Steel Plates">Steel Plates</SelectItem>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Yard Area */}
                <div>
                  <Label htmlFor="yard-area" className="block text-sm font-medium text-gray-700">
                    Yard Area
                  </Label>
                  <Select value={yardArea} onValueChange={setYardArea}>
                    <SelectTrigger id="yard-area">
                      <SelectValue placeholder="Select Yard Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Yard">Main Yard</SelectItem>
                      <SelectItem value="East Wing">East Wing</SelectItem>
                      <SelectItem value="West Wing">West Wing</SelectItem>
                      <SelectItem value="Overflow Area">Overflow Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-800" />
                  <AlertTitle className="text-yellow-800">3rd Party Integration Notice</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Park+ API is currently operational. Slot assignments are being synchronized.
                  </AlertDescription>
                </Alert>

                {/* Park API status */}
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full h-2 w-2 ${parkApiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">
                    Park+ API Status:{" "}
                    <span className={`font-medium ${parkApiStatus === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                      {parkApiStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </span>
                </div>

                {/* Manual Slot Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Checkbox
                      id="manual-slot"
                      checked={manualSlot}
                      onCheckedChange={(checked) => setManualSlot(!!checked)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="manual-slot" className="font-medium text-gray-700">
                      Manual Slot Assignment
                    </Label>
                    <p className="text-gray-500">Override automatic slot assignment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Action Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefreshStatus}
                  disabled={yardSlotsQuery.isFetching}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                  Refresh Status
                </Button>
                <Button
                  onClick={handleAllocateSlot}
                  disabled={!selectedSlot || allocateSlotMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Allocate Slot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
