"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import AdvancedBillFilter from "@/components/advanced-bill-filter";

// Mock data for bills
const MOCK_BILLS = Array.from({ length: 50 }).map((_, index) => ({
  id: `bill-${index + 1}`,
  number: `HB ${1000 + index}`,
  title: `Digital Asset ${index % 5 === 0 ? 'Custody' : index % 3 === 0 ? 'Trading' : 'Regulations'} Act`,
  description: `Establishes ${index % 4 === 0 ? 'comprehensive' : 'new'} regulations for ${
    index % 3 === 0 ? 'digital asset transactions' : 'blockchain technology applications'
  } in the Commonwealth of Virginia.`,
  status: index % 6 === 0 ? 'Passed' : index % 5 === 0 ? 'Failed/Dead' : index % 4 === 0 ? 'Committee' : 'Introduced',
  chamber: index % 2 === 0 ? 'House' : 'Senate',
  date: new Date(2025, 0, 10 + index % 20),
  progress: 10 + (index % 10) * 10,
  topics: [
    'Blockchain',
    ...(index % 3 === 0 ? ['Cryptocurrencies'] : []),
    ...(index % 5 === 0 ? ['Digital Assets'] : []),
    ...(index % 7 === 0 ? ['Financial Innovation'] : []),
    ...(index % 4 === 0 ? ['Regulation'] : []),
  ],
}));

export default function AdvancedFilterPage() {
  const [filteredBills, setFilteredBills] = useState(MOCK_BILLS);
  
  // Define the filter structure
  interface BillFilter {
    status: string[];
    chamber: string | null;
    progressRange: [number, number];
    dateRange: [Date | null, Date | null];
    keywords: string[];
    keywordType: 'all' | 'any';
    topics: string[];
  }

  // Handle filter changes from the advanced filter component
  const handleFilterChange = (filters: BillFilter) => {
    // In a real implementation, this would likely be an API call
    // Here we're just filtering the mock data client-side
    let filtered = [...MOCK_BILLS];
    
    // Filter by status
    if (filters.status.length > 0) {
      filtered = filtered.filter(bill => filters.status.includes(bill.status));
    }
    
    // Filter by chamber
    if (filters.chamber) {
      filtered = filtered.filter(bill => bill.chamber === filters.chamber);
    }
    
    // Filter by progress
    filtered = filtered.filter(
      bill => bill.progress >= filters.progressRange[0] && bill.progress <= filters.progressRange[1]
    );
    
    // Filter by date range
    if (filters.dateRange[0]) {
      filtered = filtered.filter(bill => bill.date >= filters.dateRange[0]);
    }
    if (filters.dateRange[1]) {
      filtered = filtered.filter(bill => bill.date <= filters.dateRange[1]);
    }
    
    // Filter by keywords
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(bill => {
        const content = `${bill.number} ${bill.title} ${bill.description}`.toLowerCase();
        
        if (filters.keywordType === 'all') {
          // Must match all keywords
          return filters.keywords.every((keyword: string) => 
            content.includes(keyword.toLowerCase())
          );
        } else {
          // Match any keyword
          return filters.keywords.some((keyword: string) => 
            content.includes(keyword.toLowerCase())
          );
        }
      });
    }
    
    // Filter by topics
    if (filters.topics.length > 0) {
      filtered = filtered.filter(bill => {
        return filters.topics.some((topic: string) => bill.topics.includes(topic));
      });
    }
    
    setFilteredBills(filtered);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        {/* Header with Back Button */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bills" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Bills
              </Link>
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Bill Search</h1>
            <p className="text-muted-foreground">
              Find exactly the blockchain legislation you're looking for
            </p>
          </div>
        </div>
        
        {/* Advanced Filter */}
        <AdvancedBillFilter 
          onFilterChange={handleFilterChange}
          totalBills={MOCK_BILLS.length}
          filteredCount={filteredBills.length}
        />
        
        {/* Results */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">
            {filteredBills.length} {filteredBills.length === 1 ? 'Result' : 'Results'}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>
        
        {filteredBills.length > 0 ? (
          <div className="grid gap-4">
            {filteredBills.slice(0, 10).map(bill => (
              <Card key={bill.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-medium">{bill.number}</span>
                        <span className="text-sm text-muted-foreground">({bill.chamber})</span>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${bill.status === 'Passed' ? 'bg-green-100 text-green-800' :
                            bill.status === 'Failed/Dead' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}
                        `}>
                          {bill.status}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">{bill.title}</h3>
                      <p className="text-sm text-muted-foreground">{bill.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bill.topics.map(topic => (
                          <span 
                            key={topic} 
                            className="px-2 py-0.5 bg-muted rounded-full text-xs"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" asChild className="shrink-0">
                      <Link href={`/bills/${bill.id}`} className="flex items-center gap-1">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredBills.length > 10 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing 10 of {filteredBills.length} results
                </p>
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No bills match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filter criteria to see more results
              </p>
              <Button onClick={() => handleFilterChange({
                status: [],
                keywordType: 'any',
                keywords: [],
                dateRange: [null, null],
                progressRange: [0, 100],
                topics: [],
                chamber: null,
              })}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}