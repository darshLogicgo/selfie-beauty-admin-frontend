import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onPresetChange?: () => void;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetChange,
  maxDate,
  disabled = false,
  className,
  showLabel = true,
  label = "to",
}) => {
  const today = maxDate || new Date().toISOString().split("T")[0];
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      onStartDateChange(format(date, "yyyy-MM-dd"));
      if (onPresetChange) {
        onPresetChange();
      }
      // Start date select hone par start popover close karo aur end popover open karo
      setStartPopoverOpen(false);
      // Small delay ke baad end popover open karo for smooth transition
      setTimeout(() => {
        setEndPopoverOpen(true);
      }, 100);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      onEndDateChange(format(date, "yyyy-MM-dd"));
      if (onPresetChange) {
        onPresetChange();
      }
      // End date select hone par popover close karo
      setEndPopoverOpen(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 px-3 text-xs font-normal border-gray-200 bg-white hover:bg-gray-50"
            disabled={disabled}
          >
            <Calendar className="mr-2 h-3.5 w-3.5" />
            {startDate
              ? format(new Date(startDate), "MMM dd, yyyy")
              : "Start Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate ? new Date(startDate) : undefined}
            onSelect={handleStartDateSelect}
            disabled={(date) =>
              date > new Date(endDate || today) || date > new Date(today)
            }
            defaultMonth={startDate ? new Date(startDate) : new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {showLabel && <span className="text-xs text-gray-500">{label}</span>}

      <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 px-3 text-xs font-normal border-gray-200 bg-white hover:bg-gray-50"
            disabled={disabled}
          >
            <Calendar className="mr-2 h-3.5 w-3.5" />
            {endDate ? format(new Date(endDate), "MMM dd, yyyy") : "End Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate ? new Date(endDate) : undefined}
            onSelect={handleEndDateSelect}
            disabled={(date) =>
              date < new Date(startDate) || date > new Date(today)
            }
            defaultMonth={endDate ? new Date(endDate) : new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
