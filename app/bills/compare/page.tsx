import { BillCompare } from "@/components/bill-compare";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
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
            <h1 className="text-3xl font-bold tracking-tight">Bill Comparison</h1>
            <p className="text-muted-foreground">
              Compare and analyze different blockchain-related bills side by side
            </p>
          </div>
        </div>
        
        {/* Bill Compare Component */}
        <BillCompare />
        
        {/* Helpful Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparison Resources</CardTitle>
            <CardDescription>
              Tools and information to help you understand bill comparisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Understanding the Legislative Process</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn how bills progress through the Virginia General Assembly and where these 
                  bills stand in the process.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Guide
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Blockchain Legislation Glossary</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Definitions of key terms used in blockchain legislation to help you understand 
                  technical language.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Open Glossary
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Expert Analysis</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Read analysis from legal and blockchain experts on the implications of 
                  different legislative approaches.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}