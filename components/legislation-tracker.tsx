"use client";

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function LegislationTracker() {
  // Placeholder bills - will be replaced with API data
  const bills = [
    {
      id: "HB1234",
      title: "Digital Asset Trading Regulation",
      status: "Committee",
      progress: 30,
      lastAction: "Referred to Commerce Committee",
      updated: "2024-03-15",
    },
    {
      id: "SB5678",
      title: "Blockchain Technology Innovation Act",
      status: "Passed",
      progress: 100,
      lastAction: "Signed by Governor",
      updated: "2024-03-10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'committee':
        return 'bg-yellow-500';
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <div key={bill.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {bill.id}
                <Badge variant="outline">{bill.status}</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{bill.title}</p>
            </div>
          </div>
          <Progress value={bill.progress} className="mb-2" />
          <div className="text-sm text-muted-foreground">
            <p>{bill.lastAction}</p>
            <p className="text-xs">Updated: {new Date(bill.updated).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}