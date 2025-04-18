"use client";

import { useEffect, useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useBillEvents } from '@/hooks/useEvents';
import { InlineError } from '@/components/ui/error-state';
import { format } from 'date-fns';

export interface NewsTickerProps {
  className?: string;
  interval?: number;
}

export function NewsTicker({ className = "", interval = 5000 }: NewsTickerProps) {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const { data, error, isValidating, mutate } = useBillEvents("recent");
  
  // Format news items based on events
  const formatNewsItems = () => {
    if (!data?.data || data.data.length === 0) {
      return ["No recent legislative updates."];
    }
    
    return data.data.map(event => {
      const date = format(new Date(event.date), 'MMM d');
      
      if (event.bill_id) {
        return `${date}: ${event.description}`;
      } else {
        return `${date}: ${event.description}`;
      }
    });
  };

  // Get formatted news items
  const newsItems = formatNewsItems();

  // Rotate through news items
  useEffect(() => {
    if (newsItems.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, interval);

    return () => clearInterval(timer);
  }, [newsItems.length, interval]);

  // Show error state
  if (error) {
    return (
      <div className={`bg-secondary py-2 border-y border-border ${className}`}>
        <div className="container mx-auto px-4">
          <InlineError 
            message="Failed to load latest updates" 
            onRetry={() => mutate()} 
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (isValidating && !data) {
    return (
      <div className={`bg-secondary py-2 border-y border-border ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-secondary-foreground animate-pulse">
            <ArrowRight className="h-4 w-4" />
            <div className="h-4 bg-secondary-foreground/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary py-2 border-y border-border ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 text-secondary-foreground">
          {newsItems.length === 0 ? (
            <>
              <AlertCircle className="h-4 w-4" />
              <p className="font-medium">No recent updates available</p>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <p className="font-medium">{newsItems[currentNewsIndex]}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}