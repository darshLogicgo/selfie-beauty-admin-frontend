import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface CustomTooltipProps {
  /**
   * The content to show in the tooltip
   */
  content: React.ReactNode;
  /**
   * The element that triggers the tooltip on hover
   */
  children: React.ReactNode;
  /**
   * Tooltip variant
   */
  variant?: "default" | "info" | "success" | "warning" | "error";
  /**
   * Tooltip position
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Additional className for tooltip content
   */
  className?: string;
  /**
   * Delay before showing tooltip (in milliseconds)
   */
  delayDuration?: number;
  /**
   * Whether to disable the tooltip
   */
  disabled?: boolean;
  /**
   * Maximum width of the tooltip
   */
  maxWidth?: string;
}

const variantStyles = {
  default: "bg-gray-900 text-white border-gray-800",
  info: "bg-blue-600 text-white border-blue-700",
  success: "bg-green-600 text-white border-green-700",
  warning: "bg-amber-600 text-white border-amber-700",
  error: "bg-red-600 text-white border-red-700",
};

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  content,
  children,
  variant = "default",
  side = "top",
  className,
  delayDuration = 300,
  disabled = false,
  maxWidth = "max-w-xs",
}) => {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-medium shadow-lg",
            variantStyles[variant],
            maxWidth,
            className
          )}
          sideOffset={6}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Simple text tooltip wrapper for quick usage
 */
export const SimpleTooltip: React.FC<{
  text: string;
  children: React.ReactNode;
  variant?: CustomTooltipProps["variant"];
  side?: CustomTooltipProps["side"];
  disabled?: boolean;
}> = ({ text, children, variant = "default", side = "top", disabled }) => {
  return (
    <CustomTooltip
      content={text}
      variant={variant}
      side={side}
      disabled={disabled}
    >
      {children}
    </CustomTooltip>
  );
};
