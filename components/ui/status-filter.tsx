"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getBillStatusLabel } from '@/lib/utils';
import { Filter } from 'lucide-react';

export interface StatusFilterOption {
  id: number;
  label: string;
}

export interface StatusFilterProps {
  statusOptions: number[];
  selectedStatuses: number[];
  onStatusChange: (statuses: number[]) => void;
  className?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

/**
 * A dropdown filter for bill statuses
 */
export function StatusFilter({
  statusOptions,
  selectedStatuses,
  onStatusChange,
  className = '',
  buttonVariant = "outline",
  buttonSize = "default",
}: StatusFilterProps) {
  // Convert numeric IDs to labeled options
  const options = statusOptions.map(id => ({
    id,
    label: getBillStatusLabel(id)
  }));

  // Toggle a specific status selection
  const toggleStatus = (statusId: number) => {
    if (selectedStatuses.includes(statusId)) {
      onStatusChange(selectedStatuses.filter(id => id !== statusId));
    } else {
      onStatusChange([...selectedStatuses, statusId]);
    }
  };

  // Select all statuses
  const selectAll = () => {
    onStatusChange(statusOptions);
  };

  // Clear all selected statuses
  const clearAll = () => {
    onStatusChange([]);
  };

  // Get display text for the button
  const getButtonText = () => {
    if (selectedStatuses.length === 0) {
      return "All Statuses";
    }
    if (selectedStatuses.length === 1) {
      return getBillStatusLabel(selectedStatuses[0]);
    }
    return `${selectedStatuses.length} Statuses`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className={className}
        >
          <Filter className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex justify-between px-3 py-2 text-xs text-muted-foreground border-b">
          <button 
            onClick={selectAll} 
            className="hover:text-foreground"
          >
            Select All
          </button>
          <button 
            onClick={clearAll} 
            className="hover:text-foreground"
          >
            Clear
          </button>
        </div>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={selectedStatuses.includes(option.id)}
            onCheckedChange={() => toggleStatus(option.id)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}