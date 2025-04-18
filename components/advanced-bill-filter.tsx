"use client";

import { useState } from 'react';
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalBills: number;
  filteredCount: number;
}

export interface FilterOptions {
  status: string[];
  keywordType: 'any' | 'all';
  keywords: string[];
  dateRange: [Date | null, Date | null];
  progressRange: [number, number];
  topics: string[];
  chamber: string | null;
}

const initialFilters: FilterOptions = {
  status: [],
  keywordType: 'any',
  keywords: [],
  dateRange: [null, null],
  progressRange: [0, 100],
  topics: [],
  chamber: null,
};

// List of common bill statuses
const statusOptions = [
  "Introduced",
  "Committee",
  "Referred",
  "Amended",
  "Passed",
  "Failed/Dead",
  "Hearing",
  "Reported",
  "Enrolled",
  "Vetoed"
];

// List of common legislative topics
const topicOptions = [
  "Blockchain",
  "Cryptocurrencies",
  "Digital Assets",
  "Financial Innovation",
  "Technology",
  "Taxation",
  "Regulation",
  "Banking",
  "Privacy",
  "Consumer Protection"
];

export default function AdvancedBillFilter({
  onFilterChange,
  totalBills,
  filteredCount
}: AdvancedFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [keyword, setKeyword] = useState('');
  
  // Apply filters and notify parent component
  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Reset all filters to their default values
  const resetFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };
  
  // Toggle a status filter
  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
      
    applyFilters({ ...filters, status: newStatuses });
  };
  
  // Toggle a topic filter
  const toggleTopic = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter(t => t !== topic)
      : [...filters.topics, topic];
      
    applyFilters({ ...filters, topics: newTopics });
  };
  
  // Add a keyword
  const addKeyword = () => {
    if (keyword.trim() && !filters.keywords.includes(keyword.trim())) {
      const newKeywords = [...filters.keywords, keyword.trim()];
      applyFilters({ ...filters, keywords: newKeywords });
      setKeyword('');
    }
  };
  
  // Remove a keyword
  const removeKeyword = (word: string) => {
    const newKeywords = filters.keywords.filter(k => k !== word);
    applyFilters({ ...filters, keywords: newKeywords });
  };
  
  // Change keyword match type
  const toggleKeywordType = () => {
    const newType = filters.keywordType === 'any' ? 'all' : 'any';
    applyFilters({ ...filters, keywordType: newType });
  };
  
  // Handle chamber selection
  const setChamber = (chamber: string | null) => {
    applyFilters({ ...filters, chamber });
  };
  
  // Handle progress range change
  const handleProgressChange = (values: number[]) => {
    applyFilters({ ...filters, progressRange: [values[0], values[1]] });
  };
  
  // Handle date inputs
  const handleDateChange = (
    isStartDate: boolean,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    const newDateRange = [...filters.dateRange] as [Date | null, Date | null];
    
    if (isStartDate) {
      newDateRange[0] = newDate;
    } else {
      newDateRange[1] = newDate;
    }
    
    applyFilters({ ...filters, dateRange: newDateRange });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <h3 className="font-medium">Advanced Filters</h3>
            {hasActiveFilters(filters) && (
              <Badge variant="secondary" className="ml-2">
                {countActiveFilters(filters)} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Showing {filteredCount} of {totalBills} bills
            </p>
            
            {hasActiveFilters(filters) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 px-2 text-xs"
              >
                Reset
              </Button>
            )}
            
            <CollapsibleTrigger asChild onClick={() => setIsExpanded(!isExpanded)}>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                <span className="sr-only">Toggle filters</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        
        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Status filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => toggleStatus(status)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm cursor-pointer"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chamber & progress filter */}
              <div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Chamber</h4>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.chamber === 'House' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChamber(filters.chamber === 'House' ? null : 'House')}
                      className="flex-1"
                    >
                      House
                    </Button>
                    <Button
                      variant={filters.chamber === 'Senate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChamber(filters.chamber === 'Senate' ? null : 'Senate')}
                      className="flex-1"
                    >
                      Senate
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Progress</h4>
                  <Slider
                    defaultValue={[0, 100]}
                    value={[filters.progressRange[0], filters.progressRange[1]]}
                    max={100}
                    step={10}
                    onValueChange={handleProgressChange}
                    className="mb-2"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{filters.progressRange[0]}%</span>
                    <span>{filters.progressRange[1]}%</span>
                  </div>
                </div>
              </div>
              
              {/* Date range filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Date Range</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-1 border rounded-md text-sm"
                      value={filters.dateRange[0] ? filters.dateRange[0].toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(true, e)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-1 border rounded-md text-sm"
                      value={filters.dateRange[1] ? filters.dateRange[1].toISOString().split('T')[0] : ''}
                      onChange={(e) => handleDateChange(false, e)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Keywords filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Keywords</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleKeywordType}
                    className="h-6 px-2 text-xs"
                  >
                    Match {filters.keywordType === 'any' ? 'ANY' : 'ALL'} words
                  </Button>
                </div>
                
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="Enter keyword"
                    className="flex-1 px-3 py-1 border rounded-l-md text-sm"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button
                    onClick={addKeyword}
                    className="rounded-l-none"
                    disabled={!keyword.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.keywords.map(word => (
                    <Badge key={word} variant="secondary" className="flex items-center gap-1">
                      {word}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeKeyword(word)}
                      />
                    </Badge>
                  ))}
                  {filters.keywords.length === 0 && (
                    <p className="text-xs text-muted-foreground">No keywords added</p>
                  )}
                </div>
              </div>
              
              {/* Topics filter */}
              <div>
                <h4 className="text-sm font-medium mb-2">Topics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {topicOptions.map(topic => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={`topic-${topic}`}
                        checked={filters.topics.includes(topic)}
                        onCheckedChange={() => toggleTopic(topic)}
                      />
                      <label
                        htmlFor={`topic-${topic}`}
                        className="text-sm cursor-pointer"
                      >
                        {topic}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Helper function to check if there are active filters
function hasActiveFilters(filters: FilterOptions): boolean {
  return (
    filters.status.length > 0 ||
    filters.keywords.length > 0 ||
    filters.topics.length > 0 ||
    filters.chamber !== null ||
    filters.progressRange[0] > 0 ||
    filters.progressRange[1] < 100 ||
    filters.dateRange[0] !== null ||
    filters.dateRange[1] !== null
  );
}

// Helper function to count active filter types
function countActiveFilters(filters: FilterOptions): number {
  let count = 0;
  if (filters.status.length > 0) count++;
  if (filters.keywords.length > 0) count++;
  if (filters.topics.length > 0) count++;
  if (filters.chamber !== null) count++;
  if (filters.progressRange[0] > 0 || filters.progressRange[1] < 100) count++;
  if (filters.dateRange[0] !== null || filters.dateRange[1] !== null) count++;
  return count;
}