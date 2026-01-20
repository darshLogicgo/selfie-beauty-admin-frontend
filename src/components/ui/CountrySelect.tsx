import React, { useState, useMemo } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COUNTRIES, getCountryFullName, type Country } from "@/constants/countries";

export interface CountrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  showClearButton?: boolean;
  emptyMessage?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a country",
  disabled = false,
  className,
  triggerClassName,
  showClearButton = true,
  emptyMessage = "No countries found",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Map common abbreviations to ISO codes for search
  const abbreviationMap: Record<string, string> = {
    uae: "AE", // United Arab Emirates
    usa: "US", // United States of America
    uk: "GB",  // United Kingdom
    pak: "PK", // Pakistan (common abbreviation)
  };

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return COUNTRIES;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryUpper = query.toUpperCase();
    
    // Check if query is a common abbreviation and get the ISO code
    const mappedIsoCode = abbreviationMap[query];
    
    return COUNTRIES.filter((country) => {
      // Search by full name
      if (country.fullName.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search by short name (ISO code) - case insensitive
      if (country.shortName.toUpperCase().includes(queryUpper)) {
        return true;
      }
      
      // Search by common abbreviations (e.g., "UAE" -> "AE", "USA" -> "US")
      if (mappedIsoCode && country.shortName.toUpperCase() === mappedIsoCode) {
        return true;
      }
      
      return false;
    });
  }, [searchQuery]);

  // Get display value
  const displayValue = useMemo(() => {
    if (!value) return placeholder;
    return getCountryFullName(value) || value;
  }, [value, placeholder]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
    setSearchQuery(""); // Reset search when closing
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onValueChange) {
      onValueChange("");
    }
    setSearchQuery("");
  };

  // Reset search when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="truncate flex-1 text-left">{displayValue}</span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {showClearButton && value && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleClear}
                onMouseDown={(e) => e.preventDefault()}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)} 
        align="start"
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-2 shrink-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Countries List */}
          <div 
            ref={scrollContainerRef}
            className="max-h-[300px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--border)) transparent'
            }}
            onWheel={(e) => {
              // Allow normal scrolling behavior
              e.stopPropagation();
            }}
            onMouseEnter={() => {
              // Ensure the container can receive wheel events
              if (scrollContainerRef.current) {
                scrollContainerRef.current.focus();
              }
            }}
          >
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredCountries.map((country) => {
                  const isSelected = value === country.shortName;
                  return (
                    <div
                      key={country.shortName}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => handleValueChange(country.shortName)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1">{country.fullName}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {country.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results count */}
          {searchQuery && filteredCountries.length > 0 && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              {filteredCountries.length} result{filteredCountries.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelect;
