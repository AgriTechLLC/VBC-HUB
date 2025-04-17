"use client";

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatBillNumber, getStatusColor, getBillStatusDescription } from '@/lib/legiscan';
import { debounce } from '@/lib/utils';

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
}

export function LegislationTracker() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch bills from our API route
  useEffect(() => {
    async function fetchBills() {
      try {
        setLoading(true);
        const response = await fetch('/api/bills');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bills');
        }
        
        const data = await response.json();
        setBills(data.bills);
        setLastUpdated(data.lastUpdated);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setLoading(false);
      }
    }

    fetchBills();

    // Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(fetchBills, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Debounced search handler
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 200),
    []
  );

  // Filter bills based on search term and status
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
                          bill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = filterStatus ? bill.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for the filter dropdown
  const uniqueStatuses = Array.from(new Set(bills.map(bill => bill.status)));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleExpandBill = (billId: number) => {
    setExpandedBillId(expandedBillId === billId ? null : billId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-full">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-2 w-full my-4" />
            <div className="text-sm">
              <Skeleton className="h-3 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search bills..."
            className="w-full px-4 py-2 border rounded-md"
            onChange={(e) => debouncedSetSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-md"
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || null)}
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="text-xs text-muted-foreground mb-2">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No bills match your search criteria
        </div>
      ) : (
        filteredBills.map((bill) => (
          <div key={bill.bill_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {formatBillNumber(bill.bill_number)}
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(bill.status_id)} text-white`}
                  >
                    {bill.status}
                  </Badge>
                  {new Date(bill.last_action_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <Badge variant="outline" className="bg-orange-500 text-white">
                      New Activity
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{bill.title}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleExpandBill(bill.bill_id)}
                aria-label={expandedBillId === bill.bill_id ? "Collapse bill details" : "Expand bill details"}
              >
                {expandedBillId === bill.bill_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
            </div>
            
            <Progress value={bill.progress} className="mb-2" />
            
            <div className="text-sm text-muted-foreground">
              <p>{bill.last_action}</p>
              <p className="text-xs">Updated: {formatDate(bill.last_action_date)}</p>
            </div>
            
            {/* Expanded details */}
            {expandedBillId === bill.bill_id && (
              <div className="mt-4 pt-4 border-t">
                <p className="mb-4">{bill.description}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex items-center" asChild>
                    <a href={bill.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} className="mr-1" />
                      View Official Page
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center" asChild>
                    <a href={`/bills/${bill.bill_id}`}>
                      <FileText size={14} className="mr-1" />
                      View Details
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}