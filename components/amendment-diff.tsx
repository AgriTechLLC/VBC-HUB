"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, FileText, FileDown, FileUp } from "lucide-react";

interface AmendmentDiffProps {
  billId: string;
}

export function AmendmentDiff({ billId }: AmendmentDiffProps) {
  const [selectedVersion, setSelectedVersion] = useState("committee");
  const [displayMode, setDisplayMode] = useState("sideBySide");
  
  // Mock data for demonstration
  const amendments = [
    { id: "original", label: "Original Bill", date: "Jan 15, 2025" },
    { id: "committee", label: "Committee Amendment", date: "Feb 10, 2025" },
    { id: "floor", label: "Floor Amendment", date: "Feb 28, 2025" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Amendment Comparison</h2>
          <p className="text-muted-foreground">
            See how the bill has changed through the legislative process
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={selectedVersion}
            onValueChange={setSelectedVersion}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent>
              {amendments.map((amendment) => (
                <SelectItem key={amendment.id} value={amendment.id}>
                  {amendment.label} ({amendment.date})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs value={displayMode} onValueChange={setDisplayMode} className="w-full">
        <TabsList>
          <TabsTrigger value="sideBySide" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Side by Side
          </TabsTrigger>
          <TabsTrigger value="unified" className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            Unified View
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Summary of Changes
          </TabsTrigger>
        </TabsList>
        
        {/* Side by Side Comparison */}
        <TabsContent value="sideBySide" className="mt-6">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Badge variant="outline" className="mr-2">Original</Badge>
                      Original Bill (Jan 15, 2025)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderSection("Definitions", diffContent.original.definitions)}
                    {renderSection("Licensing Requirements", diffContent.original.licensing)}
                    {renderSection("Security Requirements", diffContent.original.security)}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <Badge variant="outline" className="mr-2 bg-primary/10">Amended</Badge>
                      Committee Amendment (Feb 10, 2025)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderSection("Definitions", diffContent.committee.definitions, diffContent.original.definitions)}
                    {renderSection("Licensing Requirements", diffContent.committee.licensing, diffContent.original.licensing)}
                    {renderSection("Security Requirements", diffContent.committee.security, diffContent.original.security)}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Unified View */}
        <TabsContent value="unified" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unified Comparison View</CardTitle>
              <CardDescription>
                Shows changes between original and committee amendment in a single document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Legend</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/20" />
                      <span className="text-xs text-muted-foreground">Deleted Text</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-green-500/20" />
                      <span className="text-xs text-muted-foreground">Added Text</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-blue-500/20" />
                      <span className="text-xs text-muted-foreground">Changed Section</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Section 1. Definitions
                    <Badge variant="outline" className="bg-blue-500/10">Changed</Badge>
                  </h3>
                  <div className="text-sm leading-relaxed border rounded-md p-4">
                    <p className="mb-2">
                      As used in this chapter, unless the context requires a different meaning:
                    </p>
                    <p className="mb-2">
                      "Blockchain technology" means a <span className="bg-red-500/20 line-through">shared</span><span className="bg-green-500/20"> mathematically verified, chronological, and decentralized</span> digital ledger 
                      or database <span className="bg-red-500/20 line-through">which is maintained by multiple participants on a peer-to-peer network and validated by 
                      a consensus mechanism</span><span className="bg-green-500/20"> in which transactions are recorded in blocks that are linked and secured using cryptographic techniques</span>.
                    </p>
                    <p className="mb-2">
                      "Custody" means the safekeeping and management of <span className="bg-green-500/20">customer </span>digital assets <span className="bg-red-500/20 line-through">on behalf of others</span>.
                    </p>
                    <p>
                      "Digital asset" means an electronic record in which an individual has a right or interest. 
                      The term "digital asset" includes <span className="bg-red-500/20 line-through">a virtual currency, digital security, and digital consumer asset</span><span className="bg-green-500/20"> cryptocurrency, virtual currency, and digital tokens</span>.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Section 2. Licensing Requirements
                    <Badge variant="outline" className="bg-blue-500/10">Changed</Badge>
                  </h3>
                  <div className="text-sm leading-relaxed border rounded-md p-4">
                    <p className="mb-2">
                      A. No person shall engage in digital asset custody business activity in the Commonwealth 
                      without first obtaining a license from the <span className="bg-red-500/20 line-through">Commission</span><span className="bg-green-500/20">State Corporation Commission</span> pursuant to this chapter.
                    </p>
                    <p className="mb-2">
                      B. To qualify for a license, an applicant shall <span className="bg-red-500/20 line-through">submit an application in the form prescribed by the Commission</span><span className="bg-green-500/20">submit an application, accompanied by a nonrefundable application fee of $10,000, in the form prescribed by the Commission</span>.
                    </p>
                    <p className="mb-2">
                      C. <span className="bg-green-500/20">The Commission shall issue a license to an applicant that:</span>
                    </p>
                    <p className="pl-6 mb-2">
                      <span className="bg-green-500/20">1. Has a net worth of at least $500,000, or such larger amount as the Commission may require by regulation based on the nature and volume of the applicant's business;</span>
                    </p>
                    <p className="pl-6 mb-2">
                      <span className="bg-green-500/20">2. Has established adequate security protocols for the custody of digital assets as determined by the Commission;</span>
                    </p>
                    <p className="pl-6 mb-2">
                      <span className="bg-green-500/20">3. Has obtained insurance coverage for theft and security breaches; and</span>
                    </p>
                    <p className="pl-6">
                      <span className="bg-green-500/20">4. Has submitted a comprehensive compliance plan for anti-money laundering procedures, cybersecurity, privacy, and data protection.</span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Section 3. Security Requirements
                    <Badge variant="outline" className="bg-blue-500/10">Changed</Badge>
                  </h3>
                  <div className="text-sm leading-relaxed border rounded-md p-4">
                    <p className="mb-2">
                      A. A licensee shall establish and maintain <span className="bg-red-500/20 line-through">a comprehensive security program to ensure the safety of customer digital assets</span><span className="bg-green-500/20">appropriate administrative, technical, and physical measures to protect the confidentiality, integrity, and accessibility of customer digital assets</span>.
                    </p>
                    <p className="mb-2">
                      B. The security program shall include, at a minimum:
                    </p>
                    <p className="pl-6 mb-2">
                      1. <span className="bg-red-500/20 line-through">Storage of assets using strong encryption;</span><span className="bg-green-500/20">Secure storage of private keys with strong encryption and in cold storage for at least 90% of customer digital assets when not actively being transferred;</span>
                    </p>
                    <p className="pl-6 mb-2">
                      2. Multi-signature authentication procedures;
                    </p>
                    <p className="pl-6 mb-2">
                      3. <span className="bg-red-500/20 line-through">Regular security assessments; and</span><span className="bg-green-500/20">Annual security audits by an independent, qualified third party; and</span>
                    </p>
                    <p className="pl-6">
                      4. Business continuity and disaster recovery planning.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Summary of Changes */}
        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary of Changes</CardTitle>
              <CardDescription>
                Key modifications between versions of the bill
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileUp className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">Added Requirements</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <span>
                          More specific definition of blockchain technology, emphasizing
                          mathematical verification and cryptographic techniques
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <span>
                          $10,000 application fee for license applicants
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <span>
                          Specific net worth requirement of at least $500,000 for applicants
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <span>
                          Requirement for 90% of customer assets to be held in cold storage
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileDown className="h-5 w-5 text-red-600" />
                      <h3 className="font-medium">Removed or Modified</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Minus className="h-3 w-3 text-red-600" />
                        </div>
                        <span>
                          Simplified the definition of "custody" by removing "on behalf of others"
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Minus className="h-3 w-3 text-red-600" />
                        </div>
                        <span>
                          Changed types of digital assets from "virtual currency, digital security, and 
                          digital consumer asset" to "cryptocurrency, virtual currency, and digital tokens"
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                          <Minus className="h-3 w-3 text-red-600" />
                        </div>
                        <span>
                          Changed "regular security assessments" to more specific "annual security 
                          audits by an independent, qualified third party"
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Overall Impact of Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      The committee amendments significantly increase regulatory oversight and specificity
                      in the digital asset custody framework. The changes establish more precise definitions, 
                      add specific financial and operational requirements, and strengthen security standards. 
                      While these changes may increase compliance costs for businesses, they also provide more 
                      regulatory certainty and stronger consumer protections.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" className="gap-1.5">
          <Copy className="h-4 w-4" />
          Copy Comparison
        </Button>
      </div>
    </div>
  );
}

function renderSection(title: string, content: string, compareContent?: string) {
  const unchanged = compareContent === content;
  
  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        {title}
        {compareContent && !unchanged && (
          <Badge variant="outline" className="bg-blue-500/10">Changed</Badge>
        )}
      </h3>
      <div className={`text-sm leading-relaxed border rounded-md p-4 ${
        compareContent && !unchanged ? 'bg-muted/30' : ''
      }`}>
        {content}
      </div>
    </div>
  );
}

// Mock diff content
const diffContent = {
  original: {
    definitions: `"Blockchain technology" means a shared digital ledger or database which is maintained by multiple participants on a peer-to-peer network and validated by a consensus mechanism.

"Custody" means the safekeeping and management of digital assets on behalf of others.

"Digital asset" means an electronic record in which an individual has a right or interest. The term "digital asset" includes a virtual currency, digital security, and digital consumer asset.`,
    
    licensing: `A. No person shall engage in digital asset custody business activity in the Commonwealth without first obtaining a license from the Commission pursuant to this chapter.

B. To qualify for a license, an applicant shall submit an application in the form prescribed by the Commission.`,
    
    security: `A. A licensee shall establish and maintain a comprehensive security program to ensure the safety of customer digital assets.

B. The security program shall include, at a minimum:
  1. Storage of assets using strong encryption;
  2. Multi-signature authentication procedures;
  3. Regular security assessments; and
  4. Business continuity and disaster recovery planning.`
  },
  
  committee: {
    definitions: `"Blockchain technology" means a mathematically verified, chronological, and decentralized digital ledger or database in which transactions are recorded in blocks that are linked and secured using cryptographic techniques.

"Custody" means the safekeeping and management of customer digital assets.

"Digital asset" means an electronic record in which an individual has a right or interest. The term "digital asset" includes cryptocurrency, virtual currency, and digital tokens.`,
    
    licensing: `A. No person shall engage in digital asset custody business activity in the Commonwealth without first obtaining a license from the State Corporation Commission pursuant to this chapter.

B. To qualify for a license, an applicant shall submit an application, accompanied by a nonrefundable application fee of $10,000, in the form prescribed by the Commission.

C. The Commission shall issue a license to an applicant that:
  1. Has a net worth of at least $500,000, or such larger amount as the Commission may require by regulation based on the nature and volume of the applicant's business;
  2. Has established adequate security protocols for the custody of digital assets as determined by the Commission;
  3. Has obtained insurance coverage for theft and security breaches; and
  4. Has submitted a comprehensive compliance plan for anti-money laundering procedures, cybersecurity, privacy, and data protection.`,
    
    security: `A. A licensee shall establish and maintain appropriate administrative, technical, and physical measures to protect the confidentiality, integrity, and accessibility of customer digital assets.

B. The security program shall include, at a minimum:
  1. Secure storage of private keys with strong encryption and in cold storage for at least 90% of customer digital assets when not actively being transferred;
  2. Multi-signature authentication procedures;
  3. Annual security audits by an independent, qualified third party; and
  4. Business continuity and disaster recovery planning.`
  }
};

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function Minus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}