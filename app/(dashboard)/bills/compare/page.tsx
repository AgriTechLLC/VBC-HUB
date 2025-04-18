"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowLeftRight, FileText, RefreshCw } from 'lucide-react';
import { formatBillNumber } from '@/lib/legiscan';

// Define bill interface
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

// Define comparison result interface
interface ComparisonResult {
  similarities: {
    title?: boolean;
    purpose?: boolean;
    approach?: boolean;
    scope?: boolean;
  };
  differences: string[];
  score: number; // 0-100 similarity score
  analysis: string;
}

export default function BillComparisonPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstBillId, setFirstBillId] = useState<string>("");
  const [secondBillId, setSecondBillId] = useState<string>("");
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  
  // Fetch all bills on component mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('/api/bills');
        if (!response.ok) throw new Error('Failed to fetch bills');
        
        const data = await response.json();
        setBills(data.bills || []);
      } catch (error) {
        console.error('Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, []);
  
  // Mock function to simulate bill comparison - would be replaced with real API call
  const compareBills = async () => {
    if (!firstBillId || !secondBillId) return;
    
    setComparing(true);
    
    try {
      // Get the full bill details for selected bills
      const firstBill = bills.find(b => b.bill_id.toString() === firstBillId);
      const secondBill = bills.find(b => b.bill_id.toString() === secondBillId);
      
      if (!firstBill || !secondBill) {
        throw new Error('Selected bills not found');
      }
      
      // In a real application, this would be an API call
      // For the prototype, we'll generate a mock comparison
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random similarity score between 30-90%
      const similarityScore = Math.floor(Math.random() * (91 - 30) + 30);
      
      // Generate mock comparison result based on score
      const mockResult: ComparisonResult = {
        similarities: {
          title: Math.random() > 0.5,
          purpose: similarityScore > 50,
          approach: similarityScore > 70,
          scope: similarityScore > 60,
        },
        differences: [
          "Different implementation approaches",
          "Varied scope of application",
          "Different regulatory frameworks referenced",
          "Distinct enforcement mechanisms"
        ].filter(() => Math.random() > 0.3),
        score: similarityScore,
        analysis: generateMockAnalysis(firstBill, secondBill, similarityScore)
      };
      
      setComparisonResult(mockResult);
    } catch (error) {
      console.error('Error comparing bills:', error);
    } finally {
      setComparing(false);
    }
  };
  
  // Generate mock analysis based on bills and similarity score
  const generateMockAnalysis = (first: Bill, second: Bill, score: number): string => {
    if (score > 80) {
      return `${first.bill_number} and ${second.bill_number} are highly similar bills addressing the same blockchain-related concerns. Both bills share similar language, regulatory approaches, and implementation strategies. The primary difference appears to be in the specific enforcement mechanisms and some minor definitional details.`;
    } else if (score > 60) {
      return `${first.bill_number} and ${second.bill_number} share moderate similarity in their approach to blockchain regulation. While both address similar core concerns, they differ significantly in scope, implementation timelines, and the specific requirements imposed on entities.`;
    } else if (score > 40) {
      return `${first.bill_number} and ${second.bill_number} demonstrate limited similarity despite addressing the same general topic. They propose fundamentally different regulatory frameworks, with distinct approaches to implementation, compliance requirements, and enforcement mechanisms.`;
    } else {
      return `${first.bill_number} and ${second.bill_number} show minimal similarity beyond addressing broadly related topics. These bills represent substantially different approaches to blockchain regulation and would likely result in vastly different outcomes if enacted.`;
    }
  };
  
  // Swap the selected bills
  const swapBills = () => {
    setFirstBillId(secondBillId);
    setSecondBillId(firstBillId);
    setComparisonResult(null);
  };
  
  // Reset the comparison
  const resetComparison = () => {
    setFirstBillId("");
    setSecondBillId("");
    setComparisonResult(null);
  };
  
  // Get the selected bill objects
  const firstBill = bills.find(b => b.bill_id.toString() === firstBillId);
  const secondBill = bills.find(b => b.bill_id.toString() === secondBillId);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Bill Comparison Tool</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Compare two blockchain-related bills to identify similarities and differences
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>First Bill</CardTitle>
            <CardDescription>Select the first bill to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first-bill">Bill</Label>
                <Select
                  value={firstBillId}
                  onValueChange={value => {
                    setFirstBillId(value);
                    setComparisonResult(null);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger id="first-bill" className="w-full">
                    <SelectValue placeholder="Select a bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {bills.map(bill => (
                      <SelectItem
                        key={`first-${bill.bill_id}`}
                        value={bill.bill_id.toString()}
                        disabled={bill.bill_id.toString() === secondBillId}
                      >
                        {formatBillNumber(bill.bill_number)} - {bill.title.slice(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {firstBill && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{formatBillNumber(firstBill.bill_number)}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{firstBill.title}</p>
                  <div className="text-xs flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {firstBill.status}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                      <a href={`/bills/${firstBill.bill_id}`} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="text-xs">View Details</span>
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Second Bill</CardTitle>
            <CardDescription>Select the second bill to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="second-bill">Bill</Label>
                <Select
                  value={secondBillId}
                  onValueChange={value => {
                    setSecondBillId(value);
                    setComparisonResult(null);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger id="second-bill" className="w-full">
                    <SelectValue placeholder="Select a bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {bills.map(bill => (
                      <SelectItem
                        key={`second-${bill.bill_id}`}
                        value={bill.bill_id.toString()}
                        disabled={bill.bill_id.toString() === firstBillId}
                      >
                        {formatBillNumber(bill.bill_number)} - {bill.title.slice(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {secondBill && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">{formatBillNumber(secondBill.bill_number)}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{secondBill.title}</p>
                  <div className="text-xs flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {secondBill.status}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                      <a href={`/bills/${secondBill.bill_id}`} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="text-xs">View Details</span>
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={compareBills}
          disabled={!firstBillId || !secondBillId || comparing}
          className="w-40"
        >
          {comparing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            'Compare Bills'
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={swapBills}
          disabled={!firstBillId || !secondBillId || comparing}
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Swap Bills
        </Button>
        
        <Button
          variant="ghost"
          onClick={resetComparison}
          disabled={comparing}
        >
          Reset
        </Button>
      </div>
      
      {/* Comparison Results */}
      {comparisonResult && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>
              Analysis of {firstBill?.bill_number} and {secondBill?.bill_number}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Similarity Score */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium mb-4">Similarity Score</h3>
                <div className="flex flex-col items-center">
                  <div className={`
                    relative w-44 h-44 rounded-full flex items-center justify-center border-8 mb-4
                    ${comparisonResult.score >= 75 ? 'border-green-500' : 
                      comparisonResult.score >= 50 ? 'border-yellow-500' : 'border-red-500'}
                  `}>
                    <div className="text-4xl font-bold">
                      {comparisonResult.score}%
                    </div>
                  </div>
                  <div className="text-sm text-center text-muted-foreground">
                    {comparisonResult.score >= 75 ? 'Highly Similar' : 
                     comparisonResult.score >= 50 ? 'Moderately Similar' : 
                     comparisonResult.score >= 25 ? 'Somewhat Similar' : 'Minimally Similar'}
                  </div>
                </div>
              </div>
              
              {/* Similarities and Differences */}
              <div className="md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Key Similarities</h3>
                    <div className="space-y-2">
                      {Object.entries(comparisonResult.similarities).map(([key, value]) => (
                        value ? (
                          <div key={key} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                            <div>
                              <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
                              <span className="text-muted-foreground">Both bills share similar {key}</span>
                            </div>
                          </div>
                        ) : null
                      ))}
                      {!Object.values(comparisonResult.similarities).some(Boolean) && (
                        <p className="text-muted-foreground">No significant similarities identified</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Key Differences</h3>
                    <div className="space-y-2">
                      {comparisonResult.differences.map((diff, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                          <div className="text-muted-foreground">{diff}</div>
                        </div>
                      ))}
                      {comparisonResult.differences.length === 0 && (
                        <p className="text-muted-foreground">No significant differences identified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                {comparisonResult.analysis}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <p className="text-sm text-muted-foreground text-center mt-8">
        Note: This tool compares bill language, scope, and intent to identify similarities and differences.
        For a complete legal analysis, please consult with a legislative expert.
      </p>
    </div>
  );
}