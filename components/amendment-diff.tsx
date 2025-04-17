"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface AmendmentDiffProps {
  billId: string;
  amendmentId: string;
  amendmentTitle: string;
}

export default function AmendmentDiff({ billId, amendmentId, amendmentTitle }: AmendmentDiffProps) {
  const [open, setOpen] = useState(false);
  const { data, error, isLoading } = useSWR(
    open ? `/api/bills/${billId}/diff?amendmentId=${amendmentId}` : null,
    (url: string) => fetch(url).then(r => r.json())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileText className="mr-1 h-4 w-4" />
          View Changes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{amendmentTitle}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto h-full prose max-w-none dark:prose-invert">
          {isLoading && <p>Loading diff...</p>}
          {error && <p className="text-red-500">Failed to load amendment comparison</p>}
          {data?.error && <p className="text-red-500">{data.error}</p>}
          {data?.diff && (
            <div 
              className="whitespace-pre-wrap font-mono text-sm" 
              dangerouslySetInnerHTML={{ __html: data.diff }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}