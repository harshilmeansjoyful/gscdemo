import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WeightDisplay from "@/components/weight-display";
import SignaturePad from "@/components/signature-pad";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function WeighbridgeEntry() {
  const { toast } = useToast();
  
  // Mock data - these would come from previous screen or API in a real implementation
  const vehicleInfo = {
    vehicleNumber: "MH 04 AB 1234",
    gatePass: "GP-0012345",
    timeInfo: "Time: 14:35:23"
  };

  const [weight, setWeight] = useState<number>(24560);
  const [manualWeight, setManualWeight] = useState<string>("");
  const [unit, setUnit] = useState<string>("kg");
  const [remarks, setRemarks] = useState<string>("");
  const [loadType, setLoadType] = useState<string>("Steel Coils");
  const [signature, setSignature] = useState<string | null>(null);

  // Mutation for saving weighbridge entry
  const weighbridgeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/weighbridge/entry", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weighbridge entry saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save weighbridge entry: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveAndProceed = () => {
    const finalWeight = manualWeight ? parseInt(manualWeight) : weight;
    
    weighbridgeMutation.mutate({
      vehicleNumber: vehicleInfo.vehicleNumber,
      gatePass: vehicleInfo.gatePass,
      weight: finalWeight,
      unit,
      loadType,
      signature,
      remarks,
      manualEntry: !!manualWeight,
      type: "entry"
    });
  };

  const handleReset = () => {
    setManualWeight("");
    setRemarks("");
    setSignature(null);
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
  <Header 
    title="Weighbridge Entry"
    description="Capture entry weight of truck"
    vehicleInfo={vehicleInfo}
  />

  <div className="max-w-7xl mx-auto">
    <div className="py-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <Card className="w-full lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Weight Measurement</h2>
            </div>

            {/* Weight Display */}
            <WeightDisplay weight={weight} unit={unit} />

            {/* Manual Weight Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              <div className="sm:col-span-2">
                <Label htmlFor="manual-weight" className="block text-sm font-medium text-gray-700">
                  Manual Weight Input (Fallback)
                </Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    id="manual-weight"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    placeholder="Enter weight manually if needed"
                    className="rounded-r-none"
                    type="number"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {unit}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="unit-selector" className="block text-sm font-medium text-gray-700">
                  Unit
                </Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger id="unit-selector">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remarks */}
            <div className="mt-6">
              <Label htmlFor="weighbridge-remarks" className="block text-sm font-medium text-gray-700">
                Remarks
              </Label>
              <Textarea
                id="weighbridge-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional notes here"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="load-type" className="block text-sm font-medium text-gray-700">
                  Load Type
                </Label>
                <Select value={loadType} onValueChange={setLoadType}>
                  <SelectTrigger id="load-type">
                    <SelectValue placeholder="Select Load Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Steel Coils">Steel Coils</SelectItem>
                    <SelectItem value="Steel Plates">Steel Plates</SelectItem>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Signature
                </Label>
                <SignaturePad onSign={setSignature} />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Weight Reading
                </Label>
                <div className="bg-neutral-100 p-3 rounded-md text-base font-medium">
                  N/A (First Entry)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Action Bar */}
      <Card className="mt-6">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="text-sm text-gray-500">
            All weights are automatically logged for auditing purposes
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button 
              onClick={handleSaveAndProceed}
              disabled={weighbridgeMutation.isPending}
              className="w-full sm:w-auto"
            >
              Save & Proceed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}
