"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Calendar, Eye, Share2, Trash2, FilePlus2 } from 'lucide-react';
import { getStatusColor } from '@/lib/legiscan';
import { useToast } from '@/hooks/use-toast';

// Define bill interface to match app's bill data structure
interface Bill {
  bill_id: number;
  bill_number: string;
  title: string;
  status_id: number;
  status: string;
  progress: number;
  last_action: string;
  last_action_date: string;
  url?: string;
  description?: string;
  change_hash: string;
}

// Mock function to get tracked bills from localStorage - would be replaced with API call in production
function getTrackedBills(): number[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const tracked = localStorage.getItem('vbc:tracked-bills');
    return tracked ? JSON.parse(tracked) : [];
  } catch (error) {
    console.error('Error getting tracked bills:', error);
    return [];
  }
}

// Mock function to get notification settings from localStorage
function getNotificationSettings(): Record<number, boolean> {
  if (typeof window === 'undefined') return {};
  
  try {
    const settings = localStorage.getItem('vbc:notification-settings');
    return settings ? JSON.parse(settings) : {};
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {};
  }
}

// Generate a unique key for export filename
function generateExportKey() {
  return `vbc-bills-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 8)}`;
}

export default function BillTrackerWidget() {
  const [trackedBillIds, setTrackedBillIds] = useState<number[]>([]);
  const [trackedBills, setTrackedBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Load tracked bill IDs and notification settings on component mount
  useEffect(() => {
    setTrackedBillIds(getTrackedBills());
    setNotificationSettings(getNotificationSettings());
    setLoading(false);
  }, []);

  // Fetch bill details for tracked bills
  useEffect(() => {
    if (!trackedBillIds.length) {
      setTrackedBills([]);
      return;
    }
    
    const fetchBills = async () => {
      setLoading(true);
      
      try {
        // Fetch bills in parallel
        const billPromises = trackedBillIds.map(id => 
          fetch(`/api/bills/${id}`).then(res => res.json())
        );
        
        const bills = await Promise.all(billPromises);
        setTrackedBills(bills);
      } catch (error) {
        console.error('Error fetching tracked bills:', error);
        toast({
          title: "Error loading tracked bills",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, [trackedBillIds, toast]);

  // Toggle notification setting for a bill
  const toggleNotification = (billId: number) => {
    const newSettings = {
      ...notificationSettings,
      [billId]: !notificationSettings[billId]
    };
    
    setNotificationSettings(newSettings);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('vbc:notification-settings', JSON.stringify(newSettings));
    }
    
    // Show toast confirmation
    toast({
      title: `Notifications ${newSettings[billId] ? 'enabled' : 'disabled'}`,
      description: `You will ${newSettings[billId] ? 'now' : 'no longer'} receive updates for this bill.`
    });
  };

  // Remove a bill from tracking
  const removeBill = (billId: number) => {
    const newTrackedBillIds = trackedBillIds.filter(id => id !== billId);
    setTrackedBillIds(newTrackedBillIds);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('vbc:tracked-bills', JSON.stringify(newTrackedBillIds));
    }
    
    // Show toast confirmation
    toast({
      title: "Bill removed from tracking",
      description: "You will no longer track this bill."
    });
  };

  // Add event to calendar
  const addToCalendar = (bill: Bill) => {
    // Calculate estimated next action date (2 weeks from last action)
    const lastActionDate = new Date(bill.last_action_date);
    const estimatedNextDate = new Date(lastActionDate);
    estimatedNextDate.setDate(lastActionDate.getDate() + 14);
    
    // Format for iCalendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDate = formatDate(estimatedNextDate);
    let endDate = new Date(estimatedNextDate);
    endDate.setHours(endDate.getHours() + 1);
    const endDateFormatted = formatDate(endDate);
    
    // Create event details
    const event = {
      title: `${bill.bill_number}: Potential Next Action`,
      description: `Bill Title: ${bill.title}\n\nLast Action: ${bill.last_action}\n\nTrack this bill on the VBC Hub.`,
      location: 'Virginia General Assembly',
      start: startDate,
      end: endDateFormatted
    };
    
    // Generate iCalendar format
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VBC Hub//Bill Tracker//EN
BEGIN:VEVENT
UID:${Date.now()}@vbchub.org
DTSTAMP:${formatDate(new Date())}
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR
    `.trim();
    
    // Create a download link
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${bill.bill_number.replace(/\s+/g, '')}-reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show toast confirmation
    toast({
      title: "Added to calendar",
      description: "Calendar event created for estimated next action."
    });
  };

  // Export tracked bills as CSV
  const exportToCsv = () => {
    if (!trackedBills.length) return;
    
    // Create CSV header row
    const headers = ['Bill Number', 'Title', 'Status', 'Last Action', 'Last Action Date', 'URL'];
    
    // Create data rows
    const rows = trackedBills.map(bill => [
      bill.bill_number,
      bill.title,
      bill.status,
      bill.last_action,
      bill.last_action_date,
      bill.url || ''
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tracked-bills-${generateExportKey()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show toast confirmation
    toast({
      title: "Export complete",
      description: "Tracked bills have been exported as CSV."
    });
  };

  // Generate markdown summary for sharing
  const shareAsMarkdown = (bill: Bill) => {
    const markdown = `
# ${bill.bill_number}: ${bill.title}

**Status:** ${bill.status}
**Last Action:** ${bill.last_action} (${bill.last_action_date})

## Description
${bill.description || 'No description available.'}

## More Information
${bill.url || 'No URL available.'}

*Shared from Virginia Blockchain Council Hub*
    `.trim();
    
    // Copy to clipboard
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Bill summary copied in markdown format."
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive"
      });
    });
  };

  // Render loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bill Tracker</CardTitle>
          <CardDescription>Loading your tracked bills...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!trackedBills.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Bill Tracker</CardTitle>
          <CardDescription>Your personalized bill tracking dashboard</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <FilePlus2 className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Bills Tracked</h3>
          <p className="text-muted-foreground mb-4">
            Visit the Bills page and click "Track This Bill" to add bills to your tracker.
          </p>
          <Button asChild>
            <a href="/bills">Browse Bills</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render bill tracker 
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bill Tracker</CardTitle>
            <CardDescription>Your personalized bill tracking dashboard</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCsv}>
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Bills</TabsTrigger>
              <TabsTrigger value="active">Active Bills</TabsTrigger>
              <TabsTrigger value="alerts">With Alerts</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="pt-2">
            <div className="space-y-4 px-6">
              {trackedBills.map(bill => (
                <BillTrackingCard
                  key={bill.bill_id}
                  bill={bill}
                  hasNotifications={!!notificationSettings[bill.bill_id]}
                  onToggleNotification={() => toggleNotification(bill.bill_id)}
                  onRemove={() => removeBill(bill.bill_id)}
                  onCalendar={() => addToCalendar(bill)}
                  onShare={() => shareAsMarkdown(bill)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="pt-2">
            <div className="space-y-4 px-6">
              {trackedBills
                .filter(bill => bill.status_id < 4) // Only bills not passed/failed
                .map(bill => (
                  <BillTrackingCard
                    key={bill.bill_id}
                    bill={bill}
                    hasNotifications={!!notificationSettings[bill.bill_id]}
                    onToggleNotification={() => toggleNotification(bill.bill_id)}
                    onRemove={() => removeBill(bill.bill_id)}
                    onCalendar={() => addToCalendar(bill)}
                    onShare={() => shareAsMarkdown(bill)}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="pt-2">
            <div className="space-y-4 px-6">
              {trackedBills
                .filter(bill => notificationSettings[bill.bill_id])
                .map(bill => (
                  <BillTrackingCard
                    key={bill.bill_id}
                    bill={bill}
                    hasNotifications={true}
                    onToggleNotification={() => toggleNotification(bill.bill_id)}
                    onRemove={() => removeBill(bill.bill_id)}
                    onCalendar={() => addToCalendar(bill)}
                    onShare={() => shareAsMarkdown(bill)}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-2">
        <p className="text-xs text-muted-foreground w-full text-center">
          {trackedBills.length} bills tracked • Last updated: {new Date().toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}

// Bill tracking card component
function BillTrackingCard({
  bill,
  hasNotifications,
  onToggleNotification,
  onRemove,
  onCalendar,
  onShare
}: {
  bill: Bill;
  hasNotifications: boolean;
  onToggleNotification: () => void;
  onRemove: () => void;
  onCalendar: () => void;
  onShare: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(bill.status_id)} text-white`}
            >
              {bill.status}
            </Badge>
            <h3 className="text-sm font-semibold">{bill.bill_number}</h3>
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={onToggleNotification}
                  >
                    <Bell className={`h-4 w-4 ${hasNotifications ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasNotifications ? 'Disable' : 'Enable'} notifications</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={onCalendar}
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to calendar</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={onShare}
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share bill</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={onRemove}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove from tracker</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <CardTitle className="text-sm font-medium mt-2 line-clamp-2">
          {bill.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-sm text-muted-foreground">
          <div className="flex justify-between items-center">
            <span className="text-xs">Last action: {new Date(bill.last_action_date).toLocaleDateString()}</span>
            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
              <a href={`/bills/${bill.bill_id}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">View</span>
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}