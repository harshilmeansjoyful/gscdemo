import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import WeightDisplay from "@/components/weight-display";
import AnprCamera from "@/components/anpr-camera";
import { Download, LogOut } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function ExitWeighbridge() {
  const { toast } = useToast();
  
  // Mock data - these would come from previous screen or API in a real implementation
  const vehicleInfo = {
    vehicleNumber: "MH 04 AB 1234",
    gatePass: "GP-0012345",
    timeInfo: "Operation: Outbound"
  };

  const [weight, setWeight] = useState<number>(18750);
  const [manualWeight, setManualWeight] = useState<string>("");
  const [unit, setUnit] = useState<string>("kg");
  const [remarks, setRemarks] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState<string>(vehicleInfo.vehicleNumber);
  
  const [checklistItems, setChecklistItems] = useState([
    { id: 'bay_op_complete', label: 'Bay Operations Complete', checked: true },
    { id: 'docs_generated', label: 'Documents Generated', checked: true },
    { id: 'anpr_confirmed', label: 'ANPR Reconfirmation', checked: false },
    { id: 'final_check', label: 'Final Security Check', checked: false },
  ]);

  // Query for entry weight
  const entryWeightQuery = useQuery({
    queryKey: ["/api/weighbridge/entry-weight", vehicleInfo.vehicleNumber],
  });

  // Mutation for exit weighbridge
  const exitWeighbridgeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/weighbridge/exit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exit weight recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record exit weight: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for gate exit
  const gateExitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/gate/exit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gate opened for vehicle exit",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process gate exit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAnprDetection = (detectedPlate: string) => {
    setVehicleNumber(detectedPlate);
    
    // Update ANPR checklist item
    setChecklistItems(prev => prev.map(item => {
      if (item.id === 'anpr_confirmed') {
        return { ...item, checked: true };
      }
      return item;
    }));
  };

  const handleUpdateChecklist = (id: string, checked: boolean) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, checked };
      }
      return item;
    }));
  };

  const handleSaveWeight = () => {
    const finalWeight = manualWeight ? parseInt(manualWeight) : weight;
    
    exitWeighbridgeMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      gatePass: vehicleInfo.gatePass,
      weight: finalWeight,
      unit,
      remarks,
      manualEntry: !!manualWeight,
      type: "exit"
    });
  };

  const handleExit = () => {
    // Check if all checklist items are checked
    const allChecked = checklistItems.every(item => item.checked);
    
    if (!allChecked) {
      toast({
        title: "Checklist Incomplete",
        description: "Please complete all checklist items before exit",
        variant: "destructive",
      });
      return;
    }
    
    gateExitMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      gatePass: vehicleInfo.gatePass,
      exitTime: new Date().toISOString(),
      remarks
    });
  };

  const handleDownloadDocument = (docType: string) => {
    toast({
      title: "Document Generated",
      description: `${docType} has been generated and downloaded`,
    });
  };

  const calculateNetWeight = () => {
    const entryWeight = entryWeightQuery.data?.weight || 0;
    return Math.abs(entryWeight - weight);
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
  <Header 
    title="Exit Weighbridge & Gate-Out"
    description="Capture final weight, verify ANPR, exit clearance"
    vehicleInfo={vehicleInfo}
  />

  <div className="max-w-7xl mx-auto">
    <div className="py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <Card className="w-full lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Weight & Vehicle Verification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weighbridge Info */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Weighbridge Weight (Exit)</Label>
                <WeightDisplay weight={weight} unit={unit} />

                {/* Manual Input */}
                <div className="mt-4">
                  <Label htmlFor="manual-weight" className="block text-sm font-medium text-gray-700">
                    Manual Weight Input (Fallback)
                  </Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      id="manual-weight"
                      type="number"
                      className="rounded-r-none"
                      value={manualWeight}
                      onChange={(e) => setManualWeight(e.target.value)}
                      placeholder="Enter weight manually if needed"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      {unit}
                    </span>
                  </div>
                </div>

                {/* Weight Summary */}
                <div className="mt-4 bg-blue-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm text-blue-700">
                    <span>Entry Weight:</span>
                    <span className="font-mono font-medium">{entryWeightQuery.data?.weight || 'Loading...'} {unit}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-700 mt-1">
                    <span>Exit Weight:</span>
                    <span className="font-mono font-medium">{weight} {unit}</span>
                  </div>
                  <div className="my-2 border-t border-blue-200" />
                  <div className="flex justify-between font-medium text-sm text-blue-700">
                    <span>Net Weight:</span>
                    <span className="font-mono">{calculateNetWeight()} {unit}</span>
                  </div>
                </div>
              </div>

              {/* ANPR */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">ANPR Reconfirmation</Label>
                <AnprCamera onDetection={handleAnprDetection} />

                <div className="mt-4">
                  <Label htmlFor="vehicle-number-confirm" className="block text-sm font-medium text-gray-700">
                    Confirm Vehicle Number
                  </Label>
                  <Input
                    id="vehicle-number-confirm"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="mt-1"
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={vehicleNumber === vehicleInfo.vehicleNumber ? 'success' : 'destructive'}>
                      {vehicleNumber === vehicleInfo.vehicleNumber ? 'Match' : 'Mismatch'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {vehicleNumber === vehicleInfo.vehicleNumber
                        ? 'Vehicle number matches the entry record'
                        : 'Vehicle number does not match the entry record'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Buttons */}
            <div className="mt-6 border-t border-gray-200 pt-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Document Generation</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => handleDownloadDocument('Proof of Delivery (POD)')}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm font-medium">Generate POD (Inbound)</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={() => handleDownloadDocument('Waybill / LR')}
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm font-medium">Generate LR / Waybill (Outbound)</span>
                </Button>
              </div>
            </div>



            {/* Remarks */}
            <div className="mt-6">
              <Label htmlFor="exit-remarks" className="block text-sm font-medium text-gray-700">
                Remarks
              </Label>
              <Textarea
                id="exit-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any final notes before exit"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Panel */}
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Final Checklist</h2>
            </div>

            <div className="space-y-4">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-start">
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => handleUpdateChecklist(item.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="ml-3 text-sm">
                    <Label htmlFor={item.id} className="font-medium text-gray-700">
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}

              <Button className="w-full mt-4" onClick={handleSaveWeight} disabled={exitWeighbridgeMutation.isPending}>
                Record Final Weight
              </Button>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Final Verification Timestamp:</span>
                    <span className="text-sm font-mono">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
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
            <Badge variant="destructive">Exit Closed</Badge>
          </div>
          <Button
            onClick={handleExit}
            disabled={
              gateExitMutation.isPending || 
              !checklistItems.every(item => item.checked) ||
              vehicleNumber !== vehicleInfo.vehicleNumber
            }
            className="w-full sm:w-auto"
          >
            <LogOut className="-ml-1 mr-2 h-5 w-5" />
            Open Exit Gate
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}
