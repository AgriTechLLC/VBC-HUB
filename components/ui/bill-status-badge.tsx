import { Badge } from "@/components/ui/badge";
import { getBillStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

export interface BillStatusBadgeProps {
  statusId: number;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline";
  showLabel?: boolean;
}

/**
 * Component for displaying a bill's status as a colored badge
 */
export function BillStatusBadge({
  statusId,
  className,
  size = "default",
  variant = "default",
  showLabel = true,
}: BillStatusBadgeProps) {
  const t = useTranslations('billStatus');
  
  // Get status label from i18n or fallback
  const statusKey = statusId.toString();
  // Make it more testable - handle the case when t.has is not available
  const statusLabel = typeof t.has === 'function' && t.has(statusKey) 
    ? t(statusKey)
    : getBillStatusLabel(statusId);
    
  const statusColorClass = getStatusColor(statusId);
  
  // Determine size classes
  const sizeClasses = {
    sm: "text-xs py-0 px-2",
    default: "text-sm py-1 px-2.5",
    lg: "text-md py-1.5 px-3",
  };
  
  // Styles for outlined badges
  const outlineStyles = variant === "outline" ? {
    border: "border border-current",
    bg: "bg-transparent",
    text: `text-${statusColorClass.replace('bg-', '')}`
  } : {};
  
  return (
    <Badge 
      variant={variant} 
      className={cn(
        sizeClasses[size],
        variant === "default" ? statusColorClass : "",
        variant === "default" ? "text-white" : "",
        outlineStyles.border,
        outlineStyles.bg,
        outlineStyles.text,
        className
      )}
    >
      {showLabel ? statusLabel : ""}
    </Badge>
  );
}

/**
 * Component for displaying a bill's recent activity status
 */
export function BillActivityBadge({ 
  date,
  className,
  days = 7,
}: { 
  date?: string,
  className?: string,
  days?: number
}) {
  const t = useTranslations('legislation');
  
  if (!date) return null;
  
  // Check if the activity is recent (within the specified days)
  const isRecent = new Date(date) > new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  if (!isRecent) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn("bg-orange-500 text-white", className)}
    >
      {t('newActivity')}
    </Badge>
  );
}