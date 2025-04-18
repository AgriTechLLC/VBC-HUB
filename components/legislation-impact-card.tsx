"use client";

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CircleArrowUp, CircleArrowDown, CircleDashed, Building2, Users, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface ImpactData {
  bill_id: string;
  bill_number: string;
  title: string;
  impact_type: 'positive' | 'negative' | 'mixed' | 'neutral';
  impact_score: number; // -3 to +3
  business_impact: string[];
  consumer_impact: string[];
  industry_sectors: string[];
  analysis: string;
  source?: string;
}

interface LegislationImpactCardProps {
  data: ImpactData;
  className?: string;
}

export default function LegislationImpactCard({ data, className }: LegislationImpactCardProps) {
  const impactColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    mixed: 'text-amber-600 dark:text-amber-400',
    neutral: 'text-blue-600 dark:text-blue-400'
  };
  
  const impactIcons = {
    positive: <CircleArrowUp className="h-6 w-6 text-green-600" />,
    negative: <CircleArrowDown className="h-6 w-6 text-red-600" />,
    mixed: <CircleDashed className="h-6 w-6 text-amber-600" />,
    neutral: <CircleDashed className="h-6 w-6 text-blue-600" />
  };
  
  const impactLabel = {
    positive: 'Positive Impact',
    negative: 'Negative Impact',
    mixed: 'Mixed Impact',
    neutral: 'Neutral Impact'
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{data.bill_number}</CardTitle>
            <CardDescription className="mt-1">{data.title}</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {impactIcons[data.impact_type]}
            <span className={`text-sm font-medium ${impactColors[data.impact_type]}`}>
              {impactLabel[data.impact_type]}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Business Impact
          </h3>
          <div className="pl-6">
            <ul className="list-disc text-sm space-y-1 pl-4">
              {data.business_impact.map((impact, i) => (
                <li key={i} className="text-muted-foreground">{impact}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Consumer Impact
          </h3>
          <div className="pl-6">
            <ul className="list-disc text-sm space-y-1 pl-4">
              {data.consumer_impact.map((impact, i) => (
                <li key={i} className="text-muted-foreground">{impact}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Affected Industry Sectors</h3>
          <div className="flex flex-wrap gap-2">
            {data.industry_sectors.map((sector) => (
              <Badge key={sector} variant="outline" className="bg-muted/50">
                {sector}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Analysis</h3>
          <p className="text-sm text-muted-foreground">{data.analysis}</p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-xs text-muted-foreground">
          Analysis by Virginia Blockchain Council
        </p>
        
        <Button size="sm" variant="outline" asChild>
          <a href={`/bills/${data.bill_id}`} className="gap-1.5">
            <span>View Bill</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Example usage:
export function LegislationImpactExample() {
  const exampleData: ImpactData = {
    bill_id: "1234567",
    bill_number: "HB 1234",
    title: "Digital Asset Trading Marketplace Regulation",
    impact_type: "mixed",
    impact_score: 1,
    business_impact: [
      "Creates licensing requirements for digital asset exchanges",
      "Mandates cybersecurity standards for operators",
      "Requires quarterly reporting to regulators"
    ],
    consumer_impact: [
      "Enhances protection against fraud and market manipulation",
      "Improves transparency of fees and trading practices",
      "May reduce accessibility of certain services"
    ],
    industry_sectors: [
      "Financial Services",
      "Cryptocurrency",
      "Technology",
      "Legal Compliance"
    ],
    analysis: "This bill introduces a comprehensive regulatory framework for digital asset trading platforms operating in Virginia. While it creates new compliance requirements for businesses, it also provides regulatory clarity that could attract companies seeking a well-defined operating environment. The requirements are broadly aligned with emerging federal guidance, potentially reducing compliance burdens across jurisdictions."
  };

  return <LegislationImpactCard data={exampleData} />;
}