"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BillTimeline from "@/components/bill-timeline";
import VoteDonut from "@/components/vote-donut";
import { BillExplainer } from "@/components/bill-explainer";
import { LegislationImpactCard } from "@/components/legislation-impact-card";
import { ArrowLeft, CalendarDays, Download, Eye, FileText, Share2, Star, Users } from "lucide-react";
import Link from "next/link";

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const [billData, setBillData] = useState({
    id: params.id,
    number: "HB 1164",
    title: "Digital Asset Custody Framework Act",
    description: "Blockchain technology; establishes a regulatory framework for digital asset custody in the Commonwealth of Virginia.",
    status: "In Committee",
    statusColor: "bg-blue-500",
    introduced: "January 10, 2025",
    lastAction: "Referred to Committee on Commerce and Energy",
    lastActionDate: "February 5, 2025",
    sponsor: "Delegate J. Smith",
    coSponsors: ["Sen. A. Johnson", "Del. R. Williams"],
    subject: "Blockchain Technology, Financial Institutions",
    session: "2025 Regular Session",
    chamber: "House",
    committee: "Commerce and Energy",
    summary: "This bill establishes a framework for the custody of digital assets by financial institutions in Virginia. It defines various terms related to digital assets and blockchain technology, and sets forth requirements for businesses that provide custodial services for digital assets. The bill requires such custodians to maintain physical security and cybersecurity measures, undergo annual security audits, and maintain insurance coverage. It also establishes procedures for the segregation of customer assets, disclosure requirements, and regulatory oversight by the State Corporation Commission.",
    text: "https://example.com/bill-text.pdf",
  });

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
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-medium">
                  {billData.chamber}
                </Badge>
                <Badge variant="secondary">
                  {billData.session}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">{billData.number}</h1>
              <p className="text-xl mb-2">{billData.title}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                <div className={`h-2 w-2 rounded-full ${billData.statusColor}`} />
                <span>{billData.status}</span>
              </div>
              <p className="text-muted-foreground">{billData.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-1.5">
                <Star className="h-4 w-4" />
                Track Bill
              </Button>
              <Button variant="outline" className="flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
            <TabsTrigger value="explained">Explained</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="amendments">Amendments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{billData.summary}</p>
                  <div className="mt-4">
                    <Button variant="outline" className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      View Full Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Sponsor</h3>
                      <p className="text-sm">{billData.sponsor}</p>
                    </div>
                    
                    {billData.coSponsors.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Co-Sponsors</h3>
                        <div className="text-sm space-y-1">
                          {billData.coSponsors.map((cosponsor, index) => (
                            <p key={index}>{cosponsor}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Introduced</h3>
                      <p className="text-sm">{billData.introduced}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Action</h3>
                      <p className="text-sm">{billData.lastAction}</p>
                      <p className="text-xs text-muted-foreground">{billData.lastActionDate}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Committee</h3>
                      <p className="text-sm">{billData.committee}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                      <p className="text-sm">{billData.subject}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Timeline Preview */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Progress Timeline
                  </CardTitle>
                  <CardDescription>
                    Track this bill's journey through the legislative process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <BillTimeline bill={billData} className="h-full" />
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="gap-1.5" asChild>
                      <Link href={`/bills/${params.id}?tab=timeline`}>
                        View Full Timeline
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Bill Timeline
                </CardTitle>
                <CardDescription>
                  Complete journey of {billData.number} through the legislative process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <BillTimeline bill={billData} className="h-full" showDetails={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Votes Tab */}
          <TabsContent value="votes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Voting Record
                </CardTitle>
                <CardDescription>
                  How legislators voted on {billData.number}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Committee Vote - {billData.committee}</h3>
                    <div className="h-[300px]">
                      <VoteDonut 
                        billId={params.id} 
                        voteType="committee" 
                        height={300} 
                        showLegend={true} 
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Floor Vote - House</h3>
                    <div className="h-[300px]">
                      <VoteDonut 
                        billId={params.id} 
                        voteType="floor" 
                        height={300} 
                        showLegend={true} 
                      />
                    </div>
                  </div>
                </div>
                <Separator className="my-8" />
                <div>
                  <h3 className="text-lg font-medium mb-4">Vote Breakdown by Party</h3>
                  <div className="h-[400px]">
                    <VoteDonut 
                      billId={params.id} 
                      voteType="partyBreakdown" 
                      height={400} 
                      showLegend={true} 
                      showDetails={true}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Explained Tab */}
          <TabsContent value="explained" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Explained</CardTitle>
                <CardDescription>
                  Understanding {billData.number} in plain language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillExplainer billId={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Impact Tab */}
          <TabsContent value="impact" className="mt-6">
            <LegislationImpactCard billId={params.id} />
          </TabsContent>
          
          {/* Amendments Tab */}
          <TabsContent value="amendments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Amendments</CardTitle>
                <CardDescription>
                  Changes made to {billData.number} during the legislative process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground">
                      No amendments have been proposed for this bill yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}