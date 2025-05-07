import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnprCamera from "@/components/anpr-camera";
import { CheckCircle, Truck, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function GateIn() {
  const { toast } = useToast();
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [gatePassNumber, setGatePassNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverMobile, setDriverMobile] = useState("");
  const [manualOverride, setManualOverride] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Query for vehicle validation
  const vehicleQuery = useQuery({
    queryKey: ["/api/vehicles/validate", vehicleNumber],
    enabled: vehicleNumber.length > 0,
  });

  // Query for gate pass validation
  const gatePassQuery = useQuery({
    queryKey: ["/api/gate-passes/validate", gatePassNumber],
    enabled: gatePassNumber.length > 0,
  });

  // Mutation for processing gate entry
  const gateEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/gate/entry", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gate opened for vehicle entry",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process gate entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenGate = () => {
    gateEntryMutation.mutate({
      vehicleNumber,
      gatePassNumber,
      driverName,
      driverMobile,
      manualOverride,
      remarks,
    });
  };

  const handleAnprDetection = (detectedPlate: string) => {
    setVehicleNumber(detectedPlate);
  };

  const isGatePassValid = gatePassQuery.data?.isValid;
  const scheduleTime = gatePassQuery.data?.scheduleTime || "Not scheduled";
  
  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
  <Header 
    title="Gate-In (Vehicle Entry)"
    description="Vehicle check-in using ANPR and Gate Pass verification"
  />

  <div className="max-w-7xl mx-auto">
    <div className="py-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Capture</h2>

            <div className="mb-6">
              <Label htmlFor="anpr-feed" className="block text-sm font-medium text-gray-700 mb-2">
                ANPR Camera Feed
              </Label>
              <AnprCamera onDetection={handleAnprDetection} />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicle-number" className="block text-sm font-medium text-gray-700">
                  Vehicle Number (Auto-filled from ANPR)
                </Label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <Input
                    id="vehicle-number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="pr-10"
                  />
                  {vehicleNumber && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="gate-pass" className="block text-sm font-medium text-gray-700">
                  Gate Pass Number
                </Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    id="gate-pass"
                    value={gatePassNumber}
                    onChange={(e) => setGatePassNumber(e.target.value)}
                    placeholder="Enter or scan gate pass"
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    <CreditCard className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver-name" className="block text-sm font-medium text-gray-700">
                    Driver Name
                  </Label>
                  <Input
                    id="driver-name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Auto/Manual Input"
                  />
                </div>
                <div>
                  <Label htmlFor="driver-mobile" className="block text-sm font-medium text-gray-700">
                    Driver Mobile
                  </Label>
                  <Input
                    id="driver-mobile"
                    value={driverMobile}
                    onChange={(e) => setDriverMobile(e.target.value)}
                    placeholder="Auto/Manual Input"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700">
                  Schedule Time (From Load Management)
                </Label>
                <div className="mt-1 bg-neutral-100 p-3 rounded-md text-base font-medium">
                  {scheduleTime}
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Gate Pass Verification Status
                </Label>
                <div className={`p-4 border rounded-md flex items-start bg-opacity-10 ${isGatePassValid ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500'}`}>
                  <CheckCircle className={`h-5 w-5 mt-1 ${isGatePassValid ? 'text-green-500' : 'text-red-500'}`} />
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${isGatePassValid ? 'text-green-500' : 'text-red-500'}`}>
                      {isGatePassValid ? 'Valid Gate Pass' : 'Invalid Gate Pass'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      {isGatePassValid 
                        ? 'Gate pass verified for steel coil delivery. Scheduled slot matches current time.' 
                        : 'Gate pass verification failed. Please check the gate pass number or use manual override.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Checkbox
                  id="manual-override"
                  checked={manualOverride}
                  onCheckedChange={(checked) => setManualOverride(!!checked)}
                  className="mt-1"
                />
                <div className="ml-3 text-sm">
                  <Label htmlFor="manual-override" className="font-medium text-gray-700">
                    Manual Override
                  </Label>
                  <p className="text-gray-500">
                    Select this option to manually verify the gate pass if system validation fails.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any additional notes here"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Action Bar */}
      <Card className="mt-6">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">Gate Status:</span>
            <Badge variant="destructive">Closed</Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel Entry
            </Button>
            <Button 
              onClick={handleOpenGate}
              disabled={gateEntryMutation.isPending || !vehicleNumber}
              className="w-full sm:w-auto"
            >
              <Truck className="-ml-1 mr-2 h-5 w-5" />
              Open Gate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}
