import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Clock, Users, CalendarIcon, Filter } from 'lucide-react';

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Blockchain meetups, conferences, and council meetings across Virginia
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Button variant="outline" className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Add to Calendar
            </Button>
            <Button variant="outline" className="flex items-center gap-1.5">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="vbc">VBC Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EventCard
                title="Virginia Blockchain Summit"
                type="Conference"
                date="May 15, 2025"
                time="9:00 AM - 5:00 PM"
                location="Richmond Convention Center"
                attendees={250}
              />
              <EventCard
                title="DeFi Developers Meetup"
                type="Meetup"
                date="April 25, 2025"
                time="6:30 PM - 8:30 PM"
                location="Capital One Labs, Arlington"
                attendees={45}
              />
              <EventCard
                title="Blockchain Policy Working Group"
                type="Meeting"
                date="April 30, 2025"
                time="10:00 AM - 12:00 PM"
                location="Virtual Meeting"
                attendees={20}
                isVBC={true}
              />
              <EventCard
                title="Smart Contract Workshop"
                type="Workshop"
                date="May 8, 2025"
                time="1:00 PM - 4:00 PM"
                location="Virginia Tech Research Center, Arlington"
                attendees={30}
              />
              <EventCard
                title="Regulatory Roundtable"
                type="Roundtable"
                date="May 22, 2025"
                time="2:00 PM - 4:00 PM"
                location="McGuireWoods LLP, Richmond"
                attendees={25}
                isVBC={true}
              />
              <EventCard
                title="Blockchain & AI Integration"
                type="Seminar"
                date="June 5, 2025"
                time="5:30 PM - 7:30 PM"
                location="UVA Research Park, Charlottesville"
                attendees={75}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="vbc" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EventCard
                title="Blockchain Policy Working Group"
                type="Meeting"
                date="April 30, 2025"
                time="10:00 AM - 12:00 PM"
                location="Virtual Meeting"
                attendees={20}
                isVBC={true}
              />
              <EventCard
                title="Regulatory Roundtable"
                type="Roundtable"
                date="May 22, 2025"
                time="2:00 PM - 4:00 PM"
                location="McGuireWoods LLP, Richmond"
                attendees={25}
                isVBC={true}
              />
              <EventCard
                title="VBC Quarterly Member Meeting"
                type="Meeting"
                date="June 15, 2025"
                time="3:00 PM - 5:00 PM"
                location="Dominion Energy Innovation Center, Richmond"
                attendees={50}
                isVBC={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EventCard
                title="Blockchain for Government"
                type="Panel"
                date="March 20, 2025"
                time="1:00 PM - 3:00 PM"
                location="Virginia State Capitol"
                attendees={60}
                isPast={true}
              />
              <EventCard
                title="Web3 Developer Workshop"
                type="Workshop"
                date="March 10, 2025"
                time="6:00 PM - 9:00 PM"
                location="1776 Startup Hub, Arlington"
                attendees={40}
                isPast={true}
              />
              <EventCard
                title="VBC Legislative Debrief"
                type="Meeting"
                date="February 28, 2025"
                time="12:00 PM - 1:30 PM"
                location="Virtual Meeting"
                attendees={35}
                isVBC={true}
                isPast={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface EventCardProps {
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  isVBC?: boolean;
  isPast?: boolean;
}

function EventCard({ title, type, date, time, location, attendees, isVBC = false, isPast = false }: EventCardProps) {
  return (
    <Card className={isPast ? "opacity-80" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={isVBC ? "default" : "secondary"} className="mb-2">
            {type}
          </Badge>
          {isVBC && (
            <Badge variant="outline" className="bg-primary/10">
              VBC Event
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1.5 mt-1">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{date}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{attendees} attendees expected</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {isPast ? (
          <Button variant="outline" className="w-full">View Recap</Button>
        ) : (
          <Button className="w-full">Register</Button>
        )}
      </CardFooter>
    </Card>
  );
}