"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, BarChart, Users, Briefcase, Scale, Globe } from "lucide-react";

interface LegislationImpactCardProps {
  billId: string;
}

export function LegislationImpactCard({ billId }: LegislationImpactCardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Analysis</CardTitle>
        <CardDescription>
          Understanding the potential effects of this legislation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="industry" className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              Industry
            </TabsTrigger>
            <TabsTrigger value="consumers" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Consumers
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              State Comparison
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImpactCard 
                title="Regulatory Clarity" 
                impact="positive"
                description="Provides clear guidelines for blockchain businesses operating in Virginia" 
                icon={<Scale className="h-5 w-5 text-green-500" />}
              />
              <ImpactCard 
                title="Compliance Costs" 
                impact="mixed"
                description="Initial costs for businesses, but long-term regulatory certainty" 
                icon={<Briefcase className="h-5 w-5 text-amber-500" />}
              />
              <ImpactCard 
                title="Innovation" 
                impact="positive"
                description="Creates framework that encourages technological development" 
                icon={<BarChart className="h-5 w-5 text-green-500" />}
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Key Stakeholders</h3>
              
              <div className="space-y-6">
                <StakeholderImpact 
                  name="Financial Technology Companies"
                  impact={85}
                  description="High impact due to new operational requirements and market opportunities"
                />
                <StakeholderImpact 
                  name="Traditional Financial Institutions"
                  impact={60}
                  description="Medium impact as they adapt to compete with blockchain-based services"
                />
                <StakeholderImpact 
                  name="Consumers"
                  impact={45}
                  description="Improved protections and expanded access to digital asset services"
                />
                <StakeholderImpact 
                  name="Regulators"
                  impact={75}
                  description="New oversight responsibilities and enforcement mechanisms"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="industry" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Market Effects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">New Business Formation</span>
                        <span className="text-sm font-medium text-green-600">High</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Job Creation</span>
                        <span className="text-sm font-medium text-green-600">Medium-High</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Market Competitiveness</span>
                        <span className="text-sm font-medium text-amber-600">Medium</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Regulatory Burden</span>
                        <span className="text-sm font-medium text-amber-600">Medium</span>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Industry Sectors Affected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 border-b pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Digital Asset Exchanges</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Will require state licensing and compliance with custody requirements.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 border-b pb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Custody Service Providers</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Will need to implement new security standards and regular auditing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Financial Institutions</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Creates pathway for banks to offer digital asset services to clients.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="consumers" className="space-y-6">
            <div className="space-y-5">
              <div className="border rounded-md p-5">
                <h3 className="text-lg font-medium mb-3">Consumer Protections</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">Enhanced Security Requirements</span>
                      <p className="text-muted-foreground mt-0.5">
                        Custody providers must implement industry-standard security measures
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">Transparent Disclosures</span>
                      <p className="text-muted-foreground mt-0.5">
                        Companies must clearly disclose risks and fees to customers
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium">Asset Segregation</span>
                      <p className="text-muted-foreground mt-0.5">
                        Customer assets must be kept separate from company operating funds
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                    </div>
                    <div>
                      <span className="font-medium">No Deposit Insurance</span>
                      <p className="text-muted-foreground mt-0.5">
                        Digital assets still not covered by FDIC or similar insurance
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="border rounded-md p-5">
                <h3 className="text-lg font-medium mb-3">Access and Inclusivity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This legislation may affect different consumer groups in various ways:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium text-sm mb-2">Urban Consumers</h4>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Improved access</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Urban consumers will likely see expanded service offerings from both new and traditional providers.
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium text-sm mb-2">Rural Consumers</h4>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs text-muted-foreground">Mixed impact</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Regulatory clarity may help digital services reach rural areas, but physical presence requirements could limit this.
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium text-sm mb-2">Underbanked Populations</h4>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Positive impact</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      May open alternative financial services to those underserved by traditional banking.
                    </p>
                  </div>
                  <div className="border rounded-md p-3">
                    <h4 className="font-medium text-sm mb-2">Small Businesses</h4>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">Positive impact</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Creates clearer path for small businesses to utilize blockchain for payments and record-keeping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6">
            <div className="border rounded-md p-5">
              <h3 className="text-lg font-medium mb-3">Virginia vs. Other States</h3>
              <p className="text-sm text-muted-foreground mb-4">
                How Virginia's approach compares to nearby and leading blockchain states:
              </p>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium py-2 border-b">
                  <div>State</div>
                  <div>Licensing</div>
                  <div>Consumer Protections</div>
                  <div>Innovation Support</div>
                  <div>Overall Approach</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                  <div className="font-medium">Virginia (proposed)</div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Strong</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Strong</span>
                  </div>
                  <div className="text-primary font-medium">Balanced</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                  <div className="font-medium">New York</div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Strict</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Strong</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div>Regulatory-focused</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                  <div className="font-medium">Wyoming</div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Supportive</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Strong</span>
                  </div>
                  <div>Industry-friendly</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2 border-b">
                  <div className="font-medium">Maryland</div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div>Developing</div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-sm py-2">
                  <div className="font-medium">North Carolina</div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Strong</span>
                  </div>
                  <div>Innovation-focused</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface ImpactCardProps {
  title: string;
  impact: 'positive' | 'negative' | 'mixed';
  description: string;
  icon: React.ReactNode;
}

function ImpactCard({ title, impact, description, icon }: ImpactCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`h-2 w-2 rounded-full ${
          impact === 'positive' ? 'bg-green-500' : 
          impact === 'negative' ? 'bg-red-500' : 
          'bg-amber-500'
        }`} />
        <span className="text-sm text-muted-foreground">
          {impact === 'positive' ? 'Positive Impact' : 
           impact === 'negative' ? 'Negative Impact' : 
           'Mixed Impact'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface StakeholderImpactProps {
  name: string;
  impact: number;
  description: string;
}

function StakeholderImpact({ name, impact, description }: StakeholderImpactProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm">
          {impact > 75 ? 'High' : impact > 40 ? 'Medium' : 'Low'} Impact
        </span>
      </div>
      <Progress value={impact} className="h-2 mb-1" />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function Check(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}