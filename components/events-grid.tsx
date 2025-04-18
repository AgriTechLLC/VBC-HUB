"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useUpcomingEvents, LegislativeEvent } from '@/hooks/useEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { format } from 'date-fns';

export interface EventsGridProps {
  className?: string;
  maxEvents?: number;
}

export function EventsGrid({ className = "", maxEvents = 6 }: EventsGridProps) {
  const { data, error, isValidating, mutate } = useUpcomingEvents();
  
  // Format event date for display
  const formatEventDate = (dateStr: string, timeStr?: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy') + (timeStr ? ` at ${timeStr}` : '');
    } catch (e) {
      return dateStr;
    }
  };

  // Show loading state
  if (isValidating && !data) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return <ErrorState 
      title="Failed to load events" 
      message="There was a problem loading the events data. Please try again."
      onRetry={() => mutate()}
      className={className}
    />;
  }

  // Get events from data
  const events = data?.data || [];
  
  // Show empty state when no events
  if (events.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-semibold text-lg">No upcoming events</h3>
          <p className="text-muted-foreground">There are no scheduled legislative events at this time.</p>
        </CardContent>
      </Card>
    );
  }

  // Show events list, limited by maxEvents
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {events.slice(0, maxEvents).map((event) => (
        <Card key={event.event_id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{event.description}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatEventDate(event.date, event.time)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {event.event_type}
                </span>
              </div>
              {event.bill_id && (
                <Button size="sm" className="w-full" asChild>
                  <a href={`/bills/${event.bill_id}`}>
                    View Bill
                  </a>
                </Button>
              )}
              {!event.bill_id && (
                <Button size="sm" className="w-full">
                  RSVP
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}