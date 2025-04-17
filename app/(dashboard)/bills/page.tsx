import { Metadata } from 'next';
import { LegislationTracker } from '@/components/legislation-tracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gavel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Virginia Blockchain Legislation Tracker',
  description: 'Track blockchain-related bills in the Virginia General Assembly',
};

export default function BillsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-6 w-6" />
            Virginia Blockchain Legislation
          </CardTitle>
          <CardDescription>
            Track blockchain-related bills in the Virginia General Assembly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LegislationTracker />
        </CardContent>
      </Card>
    </div>
  );
}