"use client";

import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatBillNumber } from '@/lib/legiscan-redis';
import { useBills, Bill } from '@/hooks/useBills';
import { ErrorState } from '@/components/ui/error-state';
import { formatDate, getBillProgress, getBillStatusLabel } from '@/lib/utils';
import { BillStatusBadge, BillActivityBadge } from '@/components/ui/bill-status-badge';
import { SearchInput } from '@/components/ui/search-input';
import { StatusFilter } from '@/components/ui/status-filter';
import { SanitizedContent } from '@/components/ui/sanitized-html';
import { useTranslations } from 'next-intl';

export interface LegislationTrackerProps {
  className?: string;
}

export function LegislationTracker({ className = "" }: LegislationTrackerProps) {
  const t = useTranslations();
  const { data, error, isValidating, mutate } = useBills();
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([]);

  // Extract bills from API response
  const bills = data?.data || [];
  const lastUpdated = data?.lastUpdated || null;
  const isUsingMockData = data?.isMockData || false;

  // Filter bills based on search term and status
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
                          bill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = selectedStatusIds.length === 0 || 
                          selectedStatusIds.includes(bill.status_id);
    
    return matchesSearch && matchesStatus;
  });

  // Get unique status IDs for the filter dropdown
  const uniqueStatusIds = Array.from(new Set(bills.map(bill => bill.status_id)));

  const toggleExpandBill = (billId: number) => {
    setExpandedBillId(expandedBillId === billId ? null : billId);
  };

  // Show loading state
  if (isValidating && !data) {
    return (
      <div className={`space-y-4 ${className}`}>
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

  // Show error state
  if (error) {
    return <ErrorState 
      title={t('error.billsTitle')}
      message={t('error.billsMessage')}
      onRetry={() => mutate()}
      className={className}
    />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('legislation.searchPlaceholder')}
          className="flex-grow"
        />
        <StatusFilter
          statusOptions={uniqueStatusIds}
          selectedStatuses={selectedStatusIds}
          onStatusChange={setSelectedStatusIds}
        />
      </div>

      {/* Last updated timestamp and API status */}
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
        {lastUpdated && (
          <div>
            {t('legislation.lastUpdated')}: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        {process.env.NEXT_PUBLIC_SHOW_API_STATUS === 'true' && (
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isUsingMockData ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <span>{isUsingMockData ? t('legislation.mockData') : t('legislation.liveApi')}</span>
          </div>
        )}
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('legislation.noResults')}
        </div>
      ) : (
        filteredBills.map((bill) => {
          // Get progress bar settings based on bill status
          const progressSettings = getBillProgress(bill.status_id, bill.progress);
          
          return (
            <div key={bill.bill_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {formatBillNumber(bill.bill_number)}
                    <BillStatusBadge statusId={bill.status_id} />
                    <BillActivityBadge date={bill.last_action_date} />
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
              
              {bill.progress !== undefined && (
                <Progress 
                  value={progressSettings.value} 
                  color={progressSettings.color}
                  striped={progressSettings.striped}
                  animated={progressSettings.animated}
                  showLabel={true}
                  className="mb-2"
                  height="sm"
                />
              )}
              
              <div className="text-sm text-muted-foreground">
                {bill.last_action && <p>{bill.last_action}</p>}
                {bill.last_action_date && (
                  <p className="text-xs">Updated: {formatDate(bill.last_action_date)}</p>
                )}
              </div>
              
              {/* Expanded details */}
              {expandedBillId === bill.bill_id && (
                <div className="mt-4 pt-4 border-t">
                  {bill.description && (
                    <div className="mb-4">
                      <SanitizedContent html={bill.description} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {bill.url && (
                      <Button size="sm" variant="outline" className="flex items-center" asChild>
                        <a href={bill.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} className="mr-1" />
                          {t('legislation.officialPage')}
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="flex items-center" asChild>
                      <a href={`/bills/${bill.bill_id}`}>
                        <FileText size={14} className="mr-1" />
                        {t('legislation.viewDetails')}
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}