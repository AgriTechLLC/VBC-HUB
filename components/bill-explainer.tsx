"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Landmark, Users, Scale, FileText, ExternalLink } from "lucide-react";

interface BillExplainerProps {
  billId: string;
}

export function BillExplainer({ billId }: BillExplainerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="overview" className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="context" className="flex items-center gap-1.5">
          <Landmark className="h-4 w-4" />
          Context
        </TabsTrigger>
        <TabsTrigger value="glossary" className="flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4" />
          Glossary
        </TabsTrigger>
        <TabsTrigger value="stakeholders" className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          Stakeholders
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">In Plain Language</CardTitle>
              <CardDescription>
                What this bill is about, without the legal jargon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                This bill creates rules for companies that hold digital assets (like cryptocurrencies) 
                for their customers in Virginia. It says these companies must:
              </p>
              <ul className="space-y-2 text-sm ml-6 list-disc">
                <li>Get a license from the state to operate</li>
                <li>Have strong security systems to protect customer assets</li>
                <li>Keep customer assets separate from company funds</li>
                <li>Have insurance to cover potential losses</li>
                <li>Undergo regular security audits</li>
                <li>Clearly disclose risks and fees to customers</li>
              </ul>
              <Separator className="my-4" />
              <p className="text-sm">
                The goal is to create a safe environment for digital asset businesses to operate 
                in Virginia while protecting consumers from fraud and security breaches.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Provisions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-medium">
                      Licensing Requirements
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      <p>
                        Establishes a new licensing category for digital asset businesses. 
                        Companies must apply through the State Corporation Commission and 
                        demonstrate financial solvency, security protocols, and compliance plans.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm font-medium">
                      Security Standards
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      <p>
                        Requires implementation of industry-standard security measures including 
                        multi-signature authentication, cold storage for majority of assets, and 
                        encryption. Annual security audits by independent third parties are mandated.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm font-medium">
                      Asset Segregation
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      <p>
                        Customer assets must be held separate from operational funds of the company. 
                        This ensures customer assets are not at risk if the company faces financial 
                        difficulties.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-sm font-medium">
                      Insurance Requirements
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      <p>
                        Requires custodians to maintain insurance coverage for theft and security 
                        breaches. The coverage must be proportional to the value of assets under 
                        custody, with minimum coverage of $250,000.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-sm font-medium">
                      Disclosure Requirements
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      <p>
                        Mandatory disclosures to customers about risks, fees, and the regulatory 
                        status of digital assets. The bill prescribes specific language that must 
                        be included in customer agreements.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why It Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Regulatory Clarity</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Creates clear rules for blockchain businesses, allowing them to operate with 
                      certainty in Virginia rather than in a legal gray area.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Consumer Protection</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Establishes safeguards for consumers using digital asset services, which 
                      have historically lacked the protections found in traditional finance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Landmark className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Economic Development</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Could position Virginia as a hub for blockchain innovation and attract 
                      technology companies to the state.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="context" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legislative Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  This bill follows several years of blockchain policy development in Virginia:
                </p>
                
                <div className="relative border-l border-muted pl-6 ml-3">
                  <div className="mb-8 relative">
                    <div className="absolute -left-[27px] h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">1</span>
                    </div>
                    <h3 className="text-sm font-medium">2018: Joint Commission Study</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The Virginia Joint Commission on Technology and Science conducted a study on 
                      blockchain technology and its potential applications in government.
                    </p>
                  </div>
                  
                  <div className="mb-8 relative">
                    <div className="absolute -left-[27px] h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">2</span>
                    </div>
                    <h3 className="text-sm font-medium">2020: HB 1062 - Electronic Records</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Amended the Uniform Electronic Transactions Act to include blockchain technology 
                      as a valid means of record-keeping for electronic records and signatures.
                    </p>
                  </div>
                  
                  <div className="mb-8 relative">
                    <div className="absolute -left-[27px] h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">3</span>
                    </div>
                    <h3 className="text-sm font-medium">2022: Blockchain Advisory Workgroup</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Governor established a workgroup of industry experts and policymakers to develop 
                      recommendations for blockchain policy in Virginia.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[27px] h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">4</span>
                    </div>
                    <h3 className="text-sm font-medium">2023: SB II42 - Digital Asset Study</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Directed the State Corporation Commission to conduct a study on the status of 
                      digital asset regulation in Virginia and potential frameworks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">National Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm mb-2">
                  This bill is part of a broader trend of state-level blockchain regulation in the absence 
                  of comprehensive federal frameworks:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Wyoming's Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      Wyoming has led with the most comprehensive blockchain legislation in the U.S., 
                      including special purpose depository institutions (SPDIs) for digital assets.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">New York's BitLicense</h3>
                    <p className="text-sm text-muted-foreground">
                      New York implemented the BitLicense in 2015, a strict regulatory regime that 
                      has been criticized by some for limiting innovation.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Texas Guidance</h3>
                    <p className="text-sm text-muted-foreground">
                      Texas has provided regulatory guidance allowing banks to custody digital assets 
                      while maintaining a generally business-friendly approach.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Federal Uncertainty</h3>
                    <p className="text-sm text-muted-foreground">
                      Congress has yet to pass comprehensive crypto legislation, leaving states 
                      to fill the regulatory gap while federal agencies like the SEC and CFTC 
                      compete for jurisdiction.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  Virginia's approach with this bill appears to navigate a middle path between the 
                  strict regulatory approach of New York and the more permissive environment of Wyoming.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="glossary" className="mt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Blockchain Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Blockchain</h3>
                      <p className="text-sm text-muted-foreground">
                        A digital ledger of transactions maintained by a network of computers that is 
                        transparent, secure, and resistant to modification.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Digital Asset</h3>
                      <p className="text-sm text-muted-foreground">
                        A digital representation of value that functions as a medium of exchange, 
                        unit of account, or store of value, but does not have legal tender status.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Cryptocurrency</h3>
                      <p className="text-sm text-muted-foreground">
                        A type of digital asset that uses cryptography for security and operates on 
                        a decentralized network, typically a blockchain.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Smart Contract</h3>
                      <p className="text-sm text-muted-foreground">
                        Self-executing code deployed on a blockchain that automatically enforces the 
                        terms of an agreement when predetermined conditions are met.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Custody</h3>
                      <p className="text-sm text-muted-foreground">
                        In the context of digital assets, the secure storage and management of 
                        private keys that control access to the assets.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Technical & Regulatory Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Cold Storage</h3>
                      <p className="text-sm text-muted-foreground">
                        Keeping digital assets offline in hardware wallets or other physical media 
                        to protect them from online threats.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Multi-signature Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        A security feature requiring multiple private keys to authorize a transaction, 
                        similar to requiring multiple signatures on a check.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Private Key</h3>
                      <p className="text-sm text-muted-foreground">
                        A secret alphanumeric code that allows access to digital assets. Whoever 
                        has the private key effectively controls the assets.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Asset Segregation</h3>
                      <p className="text-sm text-muted-foreground">
                        Keeping customer digital assets separate from a company's operational funds, 
                        similar to how a bank must segregate customer deposits.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Security Audit</h3>
                      <p className="text-sm text-muted-foreground">
                        An assessment of a company's security measures by an independent third party 
                        to identify vulnerabilities and ensure compliance with standards.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" className="flex items-center gap-1.5">
              <ExternalLink className="h-4 w-4" />
              View Complete Blockchain Glossary
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="stakeholders" className="mt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StakeholderCard
              name="Digital Asset Businesses"
              role="Primary Regulated Entity"
              impact="High"
              avatar="/blockchain-company.png"
              description="Companies offering custody, exchange, or other digital asset services will need to obtain licenses and comply with new requirements."
            />
            
            <StakeholderCard
              name="Financial Institutions"
              role="Potential Market Entrant"
              impact="Medium"
              avatar="/bank.png"
              description="Traditional banks may enter the digital asset space under the new regulatory framework if they choose to expand their offerings."
            />
            
            <StakeholderCard
              name="State Corporation Commission"
              role="Regulatory Authority"
              impact="High"
              avatar="/government.png"
              description="Will be responsible for issuing licenses, conducting examinations, and enforcing compliance with the new regulations."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StakeholderCard
              name="Consumers"
              role="End Users"
              impact="Medium"
              avatar="/consumer.png"
              description="Will benefit from increased protections when using digital asset services in Virginia, but may see some services become unavailable if providers cannot meet requirements."
            />
            
            <StakeholderCard
              name="Technology Companies"
              role="Service Provider"
              impact="Medium"
              avatar="/tech-company.png"
              description="Firms providing security, compliance, and technical infrastructure to digital asset businesses may see increased demand for their services."
            />
            
            <StakeholderCard
              name="Legal & Compliance Professionals"
              role="Advisory Services"
              impact="Medium"
              avatar="/lawyer.png"
              description="Will advise businesses on compliance with the new framework and help navigate the licensing process."
            />
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Points of Contention</CardTitle>
              <CardDescription>Areas where stakeholders may disagree</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    Balance of Innovation vs. Regulation
                    <Badge variant="outline">Contested</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Industry advocates argue some requirements may be too burdensome for startups, 
                    while consumer protection groups contend the safeguards are necessary to prevent 
                    fraud and protect users.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    Insurance Requirements
                    <Badge variant="outline">Contested</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Some argue the insurance requirements are difficult to meet given the limited 
                    availability of digital asset insurance products in the current market.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                    State vs. Federal Regulation
                    <Badge variant="outline">Contested</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Some stakeholders prefer waiting for a federal framework to avoid a patchwork 
                    of state regulations, while others support state action in the absence of 
                    federal clarity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface StakeholderCardProps {
  name: string;
  role: string;
  impact: string;
  avatar: string;
  description: string;
}

function StakeholderCard({ name, role, impact, avatar, description }: StakeholderCardProps) {
  // Use a fallback for the avatar
  const initials = name.split(' ').map(n => n[0]).join('');
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="h-16 w-16 mb-2">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
          <Badge 
            variant="outline" 
            className={`mt-1 ${
              impact === 'High' ? 'bg-primary/10' : 
              impact === 'Medium' ? 'bg-amber-500/10' : 
              'bg-blue-500/10'
            }`}
          >
            {impact} Impact
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}