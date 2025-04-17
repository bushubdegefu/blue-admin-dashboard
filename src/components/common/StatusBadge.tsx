
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

const StatusBadge = ({
  active,
  activeText = "Active",
  inactiveText = "Inactive",
  className,
}: StatusBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        active
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full mr-1",
          active ? "bg-green-600" : "bg-gray-600"
        )}
      />
      {active ? activeText : inactiveText}
    </div>
  );
};

export default StatusBadge;
