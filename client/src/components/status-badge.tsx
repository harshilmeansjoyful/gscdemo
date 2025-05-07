import { Badge } from "@/components/ui/badge";

type StatusType = 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "pending" 
  | "in-progress" 
  | "completed";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({
  status,
  label,
  animated = false,
  size = "md"
}: StatusBadgeProps) {
  // Map status to colors and default labels
  const statusConfig: Record<StatusType, { variant: string; defaultLabel: string }> = {
    "success": { variant: "success", defaultLabel: "Success" },
    "warning": { variant: "warning", defaultLabel: "Warning" },
    "error": { variant: "destructive", defaultLabel: "Error" },
    "info": { variant: "default", defaultLabel: "Info" },
    "pending": { variant: "secondary", defaultLabel: "Pending" },
    "in-progress": { variant: "outline", defaultLabel: "In Progress" },
    "completed": { variant: "success", defaultLabel: "Completed" }
  };
  
  const { variant, defaultLabel } = statusConfig[status];
  const displayLabel = label || defaultLabel;
  
  // Size classes
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-0.5 px-2.5",
    lg: "text-base py-1 px-3"
  };
  
  // Animation class for pulse effect
  const animationClass = animated ? "animate-pulse" : "";
  
  return (
    <Badge 
      variant={variant as any} 
      className={`${sizeClasses[size]} ${animationClass}`}
    >
      {animated && status === "in-progress" && (
        <span className="h-2 w-2 bg-blue-500 rounded-full mr-1"></span>
      )}
      {animated && status === "pending" && (
        <span className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
      )}
      {displayLabel}
    </Badge>
  );
}
