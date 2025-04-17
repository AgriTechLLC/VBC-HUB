"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar as CalendarIcon } from 'lucide-react';

export function EventsGrid() {
  // Placeholder events - will be replaced with API data
  const events = [
    {
      id: 1,
      title: "Blockchain Policy Workshop",
      date: "2024-04-15",
      location: "Richmond, VA",
      type: "Workshop",
    },
    {
      id: 2,
      title: "VBC Monthly Meetup",
      date: "2024-04-20",
      location: "Norfolk, VA",
      type: "Meetup",
    },
    {
      id: 3,
      title: "Crypto Regulation Forum",
      date: "2024-04-25",
      location: "Alexandria, VA",
      type: "Conference",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  {event.type}
                </span>
              </div>
              <Button size="sm" className="w-full">
                RSVP
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}