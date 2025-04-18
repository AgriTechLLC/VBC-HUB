import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, ChevronRight, Filter, Star, History, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getBillStatusDescription } from '@/lib/legiscan';

export default function BillsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Blockchain Legislation</h1>
          <p className="text-muted-foreground">
            Track and analyze blockchain-related bills in the Virginia General Assembly
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bills by keyword, number, or sponsor..."
              className="w-full pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link href="/bills/filter">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Link>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link href="/bills/compare">
                <ArrowDownUp className="h-4 w-4" />
                Compare Bills
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="tracked">Tracked</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <div className="grid gap-4">
              {/* Example Bill Card */}
              {Array.from({ length: 5 }).map((_, i) => (
                <BillCard key={i} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="tracked" className="mt-6">
            <div className="rounded-md border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No tracked bills</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking bills to see them appear here
              </p>
              <Button variant="outline">Explore Active Bills</Button>
            </div>
          </TabsContent>
          <TabsContent value="passed" className="mt-6">
            <div className="grid gap-4">
              {/* Example Passed Bills */}
              {Array.from({ length: 3 }).map((_, i) => (
                <BillCard key={i} status_id={4} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="failed" className="mt-6">
            <div className="grid gap-4">
              {/* Example Failed Bills */}
              {Array.from({ length: 2 }).map((_, i) => (
                <BillCard key={i} status_id={6} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface BillCardProps {
  bill?: {
    bill_id: number;
    bill_number: string;
    title: string;
    status_id: number;
    last_action_date: string;
    sponsor?: string;
  };
  status_id?: number;
}

function BillCard({ bill, status_id }: BillCardProps) {
  // Map mock status props to status IDs
  const mapStatusToId = (status?: string): number => {
    if (status === 'active') return 7; // Committee
    if (status === 'passed') return 4; // Passed
    if (status === 'failed') return 6; // Failed/Dead
    return status_id || 7; // Default to Committee
  };

  // Use either the bill's status_id or the mapped status
  const effectiveStatusId = bill?.status_id || mapStatusToId(status_id);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              {bill?.bill_number || "HB 1164"}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {bill?.title || "Blockchain technology; establishes a regulatory framework for digital asset custody."}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Star className="h-4 w-4" />
            <span className="sr-only">Track bill</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(effectiveStatusId)}`} />
              <span className="text-muted-foreground">
                {getBillStatusDescription(effectiveStatusId)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              <span>Updated {bill?.last_action_date ? new Date(bill.last_action_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : "Mar 15, 2025"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sponsor: {bill?.sponsor || "Del. J. Smith"}</span>
            <Button variant="ghost" size="sm" className="gap-1 h-8" asChild>
              <Link href={bill ? `/bills/${bill.bill_id}` : "/bills/bill-1"}>
                View Details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}