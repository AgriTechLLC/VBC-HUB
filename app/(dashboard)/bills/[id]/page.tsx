import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, ArrowLeft, FileText, Share2 } from 'lucide-react';
import { formatBillNumber, getStatusColor, getBillStatusDescription } from '@/lib/legiscan';
import BillSummary from '@/components/bill-summary';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const bill = await getBillData(params.id);
  
  if (!bill) {
    return {
      title: 'Bill Not Found',
    };
  }
  
  return {
    title: `${formatBillNumber(bill.bill_number)} - ${bill.title}`,
    description: `Current status: ${bill.status}. ${bill.description}`,
  };
}

// Fetch bill data
async function getBillData(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bills/${id}`, {
      next: { tags: ['va-bills'] }, // Enable revalidation when the 'va-bills' tag is revalidated
    });
    
    if (!res.ok) return null;
    
    return res.json();
  } catch (error) {
    console.error('Error fetching bill:', error);
    return null;
  }
}

// Format date string
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BillDetailPage({ params }: { params: { id: string } }) {
  const bill = await getBillData(params.id);
  
  if (!bill) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" asChild>
        <a href="/bills">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Bills
        </a>
      </Button>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {formatBillNumber(bill.bill_number)}
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(bill.status_id)} text-white`}
                >
                  {bill.status}
                </Badge>
              </CardTitle>
              <CardDescription className="text-lg mt-2">{bill.title}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center" asChild>
                <a href={bill.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Official Page
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BillSummary billId={params.id} />
          
          <div className="mb-6 mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill Progress</h3>
            <Progress value={bill.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Introduced</span>
              <span>Committee</span>
              <span>Passed</span>
              <span>Signed</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Latest Action</h3>
            <p className="mb-1">{bill.last_action}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(bill.last_action_date)}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{bill.description}</p>
          </div>
          
          <div className="border-t pt-6 mt-6">
            <div className="flex gap-3">
              <Button className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Track This Bill
              </Button>
              <Button variant="outline">Contact Your Representative</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}