import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-4 text-center sm:text-left">
            <AlertCircle className="h-10 w-10 text-red-500 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>

  );
}
