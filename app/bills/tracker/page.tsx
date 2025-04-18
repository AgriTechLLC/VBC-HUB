import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CalendarClock, Download, List, GridIcon } from 'lucide-react';

export default function BillTrackerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bill Tracker</h1>
            <p className="text-muted-foreground">
              Monitor and receive updates on bills that matter to you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              Manage Alerts
            </Button>
          </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="all">All Bills</TabsTrigger>
              <TabsTrigger value="updates">New Updates</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-l-md">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none rounded-r-md bg-muted">
              <GridIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="border rounded-lg p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CalendarClock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No tracked bills yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Start tracking bills that interest you to receive notifications about updates, votes, and status changes.
          </p>
          <Button className="mt-6">Browse Active Bills</Button>
        </div>

        {/* Tracker Content (Commented out, placeholder for when there are tracked bills) */}
        {/* <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">HB 1164</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                Blockchain technology; establishes a regulatory framework for digital asset custody.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">In Committee</span>
                </div>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}