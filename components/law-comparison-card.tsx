"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LawComparisonProps {
  billTitle: string;
  billNumber: string;
  stateLaws: {
    state: string;
    summary: string;
    status: 'favorable' | 'unfavorable' | 'neutral' | 'strict';
    keyPoints: string[];
  }[];
}

export default function LawComparisonCard({
  billTitle,
  billNumber,
  stateLaws,
}: LawComparisonProps) {
  const [selectedTab, setSelectedTab] = useState<string>(stateLaws[0]?.state || '');
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  
  // Toggle expansion state for a specific state
  const toggleExpanded = (state: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [state]: !prev[state]
    }));
  };
  
  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'favorable':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unfavorable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'strict':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'favorable':
        return 'Industry-Friendly';
      case 'unfavorable':
        return 'Industry-Restrictive';
      case 'strict':
        return 'Strictly Regulated';
      default:
        return 'Neutral Framework';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{billNumber}: Comparison with Other State Laws</CardTitle>
        <CardDescription>
          How Virginia's approach compares to blockchain legislation in other states
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="px-6">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${stateLaws.length}, 1fr)` }}>
            {stateLaws.map(law => (
              <TabsTrigger key={law.state} value={law.state}>
                {law.state}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {stateLaws.map(law => (
            <TabsContent key={law.state} value={law.state} className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">{law.state}'s Approach</h3>
                <Badge className={getStatusColor(law.status)}>
                  {getStatusLabel(law.status)}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">{law.summary}</p>
              
              <h4 className="text-sm font-medium mb-2">Key Provisions:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2 mb-4">
                {law.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="px-6 pb-6">
          <h3 className="text-lg font-medium mb-3">Comparison Overview</h3>
          
          <div className="space-y-3">
            {stateLaws.map(law => (
              <Card key={law.state} className="overflow-hidden">
                <CardHeader className="p-3 cursor-pointer" onClick={() => toggleExpanded(law.state)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{law.state}</span>
                      <Badge className={getStatusColor(law.status)}>
                        {getStatusLabel(law.status)}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedStates[law.state] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedStates[law.state] && (
                  <CardContent className="p-3 pt-0 border-t">
                    <p className="text-sm text-muted-foreground">{law.summary}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-md text-sm">
            <p className="text-muted-foreground">
              Understanding how different states approach blockchain regulation helps contextualize Virginia's legislation and identify potential improvements or concerns. This comparison highlights key differences in regulatory frameworks across states.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage
export function LawComparisonExample() {
  return (
    <LawComparisonCard
      billTitle="Digital Asset Trading Marketplace Regulation"
      billNumber="HB 1234"
      stateLaws={[
        {
          state: "Wyoming",
          summary: "Wyoming has established the most comprehensive and favorable blockchain regulatory framework in the United States with its series of blockchain-enabling legislation, including special purpose depository institution (SPDI) charters for crypto banks.",
          status: "favorable",
          keyPoints: [
            "Created legal status for DAOs (Decentralized Autonomous Organizations)",
            "Established special purpose depository institutions for digital assets",
            "Exempted certain utility tokens from securities regulations",
            "Recognized direct property rights in digital assets"
          ]
        },
        {
          state: "New York",
          summary: "New York maintains one of the strictest regulatory approaches with its BitLicense requirement, which many in the industry consider overly burdensome due to its extensive compliance requirements and application costs.",
          status: "strict",
          keyPoints: [
            "Requires BitLicense for virtual currency businesses",
            "Imposes strict capital, compliance, and cybersecurity requirements",
            "Mandates detailed records of all transactions",
            "Requires approval for new products or material changes"
          ]
        },
        {
          state: "Colorado",
          summary: "Colorado has taken a balanced approach to blockchain regulation, focusing on regulatory clarity while supporting innovation through its Council for the Advancement of Blockchain Technology Use and a regulatory sandbox program.",
          status: "neutral",
          keyPoints: [
            "Exempts certain digital tokens from securities registration",
            "Established blockchain technology development council",
            "Created regulatory sandbox for blockchain businesses",
            "Recognizes blockchain records for government purposes"
          ]
        },
        {
          state: "Virginia (Proposed)",
          summary: "The proposed Virginia legislation takes elements from Colorado's balanced approach while incorporating some of the consumer protections seen in stricter frameworks, creating a moderately favorable environment with appropriate safeguards.",
          status: "neutral",
          keyPoints: [
            "Creates tiered regulatory framework based on transaction volume",
            "Establishes consumer protection requirements",
            "Recognizes smart contracts in legal agreements",
            "Provides regulatory clarity while maintaining oversight"
          ]
        }
      ]}
    />
  );
}