import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, CircleAlert } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function BayAssignment() {
  const { toast } = useToast();
  
  // Mock data - these would come from previous screen or API in a real implementation
  const vehicleInfo = {
    vehicleNumber: "MH 04 AB 1234",
    timeInfo: "Waiting Since: 15:05:23"
  };

  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<string>("Loading");
  const [cargoType, setCargoType] = useState<string>("Steel Coils");
  const [operatorNotes, setOperatorNotes] = useState<string>("");
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  
  // Query to get available bays
  const baysQuery = useQuery({
    queryKey: ["/api/bays/available"],
  });

  // Mutation for assigning bay
  const assignBayMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bays/assign", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Bay ${selectedBay} assigned successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bays/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to assign bay: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for completing operation
  const completeOperationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bays/complete", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bay operation completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bays/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      
      // Reset timer and states
      handleStopTimer();
      setSelectedBay(null);
      setOperatorNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete operation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleBaySelect = (bayId: string) => {
    setSelectedBay(bayId);
  };

  const handleAssignBay = () => {
    if (!selectedBay) {
      toast({
        title: "Error",
        description: "Please select a bay to assign",
        variant: "destructive",
      });
      return;
    }
    
    assignBayMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      bayId: selectedBay,
      operationType,
      cargoType,
      operatorNotes
    });
    
    // Start timer when bay is assigned
    handleStartTimer();
  };

  const handleCompleteOperation = () => {
    if (!selectedBay) {
      toast({
        title: "Error",
        description: "No active bay assignment to complete",
        variant: "destructive",
      });
      return;
    }
    
    completeOperationMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      bayId: selectedBay,
      operationTime: elapsedTime,
      operatorNotes
    });
  };

  const handleRaiseIssue = () => {
    toast({
      title: "Issue Raised",
      description: "Supervisor has been notified of the issue",
    });
  };

  const handleStartTimer = () => {
    setStartTime(new Date());
    setTimerRunning(true);
    
    // Update the elapsed time every second
    const timerInterval = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const elapsed = now.getTime() - startTime.getTime();
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);
    
    // Store the interval ID in the component instance
    (window as any).timerInterval = timerInterval;
  };

  const handleStopTimer = () => {
    clearInterval((window as any).timerInterval);
    setTimerRunning(false);
    setStartTime(null);
    setElapsedTime("00:00:00");
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
  <Header 
    title="Bay Assignment & Dock Operations"
    description="Move truck from yard to loading/unloading bay"
    vehicleInfo={vehicleInfo}
  />

  <div className="max-w-7xl mx-auto">
    <div className="py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Available Bays */}
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Bays</h2>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="loading" className="flex-1">Loading</TabsTrigger>
                <TabsTrigger value="unloading" className="flex-1">Unloading</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {baysQuery.isPending ? (
                  <div className="text-center py-8">Loading available bays...</div>
                ) : baysQuery.data?.length > 0 ? (
                  baysQuery.data.map((bay: any) => (
                    <div 
                      key={bay.bayId}
                      className={`p-3 border rounded-md cursor-pointer ${selectedBay === bay.bayId ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-primary'}`}
                      onClick={() => handleBaySelect(bay.bayId)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{bay.bayId}</span>
                        <Badge variant={bay.bayType === 'loading' ? 'default' : 'secondary'}>
                          {bay.bayType}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Last activity: {bay.lastActivity || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No bays available at the moment</div>
                )}
              </TabsContent>

              <TabsContent value="loading" className="text-center py-6 text-gray-500">
                No loading bays available
              </TabsContent>

              <TabsContent value="unloading" className="text-center py-6 text-gray-500">
                No unloading bays available
              </TabsContent>
            </Tabs>

            <Button 
              className="w-full mt-4"
              onClick={() => {
                const availableBay = baysQuery.data?.[0]?.bayId;
                if (availableBay) {
                  setSelectedBay(availableBay);
                  toast({
                    title: "Auto-Assigned",
                    description: `Bay ${availableBay} has been auto-assigned based on availability`,
                  });
                } else {
                  toast({
                    title: "No Bays Available",
                    description: "No bays are currently available for assignment",
                    variant: "destructive",
                  });
                }
              }}
              disabled={baysQuery.isPending || !baysQuery.data?.length}
            >
              Auto-Assign Bay
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Dock Operations */}
        <Card className="w-full lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dock Operations</h2>
            </div>

            <div className="space-y-5">
              {/* Operation Type */}
              <div>
                <Label htmlFor="operation-type" className="block text-sm font-medium text-gray-700">
                  Loading/Unloading Type
                </Label>
                <Select value={operationType} onValueChange={setOperationType}>
                  <SelectTrigger id="operation-type">
                    <SelectValue placeholder="Select Operation Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loading">Loading</SelectItem>
                    <SelectItem value="Unloading">Unloading</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
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

              {/* Operator Notes */}
              <div>
                <Label htmlFor="operator-notes" className="block text-sm font-medium text-gray-700">
                  Operator Notes
                </Label>
                <Textarea
                  id="operator-notes"
                  rows={3}
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="Add any operational notes here"
                />
              </div>

              {/* Time Tracker */}
              <div className="bg-gray-50 p-4 rounded-md">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Tracker
                </Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="bg-black py-2 px-4 rounded text-white font-mono text-xl">
                    {elapsedTime}
                  </div>
                  <div className="space-x-2">
                    {!timerRunning ? (
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={handleStartTimer}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={handleStopTimer}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Action Bar */}
      <Card className="mt-6">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <Button 
            variant="outline" 
            className="text-red-500 border-red-200 hover:bg-red-50 w-full sm:w-auto"
            onClick={handleRaiseIssue}
          >
            <CircleAlert className="-ml-1 mr-2 h-5 w-5" />
            Raise Issue
          </Button>
          <div className="w-full sm:w-auto sm:space-x-3 flex flex-col sm:flex-row gap-3">
            {selectedBay && !timerRunning ? (
              <Button 
                onClick={handleAssignBay}
                disabled={!selectedBay || assignBayMutation.isPending}
              >
                Assign Bay & Start Operation
              </Button>
            ) : timerRunning ? (
              <Button 
                onClick={handleCompleteOperation}
                disabled={!timerRunning || completeOperationMutation.isPending}
              >
                Complete Operation
              </Button>
            ) : (
              <Button disabled>Select Bay to Continue</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}
