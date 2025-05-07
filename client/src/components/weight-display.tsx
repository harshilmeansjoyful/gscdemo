import { Card } from "@/components/ui/card";
import { formatWeight } from "@/lib/utils";

interface WeightDisplayProps {
  weight: number;
  unit: string;
  label?: string;
  isLoading?: boolean;
}

export default function WeightDisplay({
  weight,
  unit,
  label = "Weight from IoT Device",
  isLoading = false
}: WeightDisplayProps) {
  return (
    <div className="mb-6 bg-black p-6 rounded-lg text-center">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-green-400 bg-opacity-20 rounded"></div>
          <div className="h-4 w-1/3 mx-auto mt-2 bg-green-400 bg-opacity-20 rounded"></div>
        </div>
      ) : (
        <>
          <div className="numeric text-green-400 text-5xl font-bold tracking-wider">
            {formatWeight(weight, unit)}
          </div>
          <div className="text-green-400 text-xs mt-2">{label}</div>
        </>
      )}
    </div>
  );
}
