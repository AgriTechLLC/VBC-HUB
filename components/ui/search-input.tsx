"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { debounce } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

/**
 * A controlled search input component with debouncing
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = '',
  debounceMs = 300,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  
  // Create a debounced version of onChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = React.useCallback(
    debounce((newValue: string) => {
      onChange(newValue);
    }, debounceMs),
    [onChange, debounceMs]
  );
  
  // Update local value when value prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };
  
  // Clear the search input
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={localValue}
        onChange={handleChange}
        autoFocus={autoFocus}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
          type="button"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}