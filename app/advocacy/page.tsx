import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MessageSquare, Users, ExternalLink, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AdvocacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advocacy Center</h1>
          <p className="text-muted-foreground mt-1">
            Take action to support blockchain innovation in Virginia
          </p>
        </div>

        {/* Call to Action Banner */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Current Priority: Support Digital Asset Framework Bill
                </h2>
                <p>
                  Contact your representatives to support the Digital Asset Framework bill 
                  (HB 1452) before the upcoming committee vote on May 8th.
                </p>
              </div>
              <Button size="lg" variant="secondary">
                Take Action Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="actions">Action Center</TabsTrigger>
            <TabsTrigger value="contact">Contact Officials</TabsTrigger>
            <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Action Items */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Priority Actions
                </h2>

                <ActionCard
                  title="Support Digital Asset Framework Bill"
                  description="Contact your representatives about HB 1452, which would establish a comprehensive framework for digital assets in Virginia."
                  urgency="high"
                  deadline="May 8, 2025"
                  supporters={145}
                />

                <ActionCard
                  title="Register for Blockchain Advocacy Day"
                  description="Join us at the Virginia State Capitol on May 20th to meet with legislators and discuss blockchain policy priorities."
                  urgency="medium"
                  deadline="May 15, 2025"
                  supporters={68}
                />

                <ActionCard
                  title="Submit Public Comment on Proposed Regulations"
                  description="The Virginia Department of Financial Institutions is seeking public input on proposed digital asset business regulations."
                  urgency="medium"
                  deadline="June 1, 2025"
                  supporters={37}
                />
              </div>

              {/* Resources */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Resources</h2>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Advocacy Toolkit</CardTitle>
                    <CardDescription>
                      Resources to help you effectively communicate with legislators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ResourceLink 
                      title="Legislator Communication Templates" 
                      description="Sample emails and call scripts for contacting representatives" 
                    />
                    <ResourceLink 
                      title="Blockchain Policy Talking Points" 
                      description="Key arguments and data supporting blockchain-friendly policies" 
                    />
                    <ResourceLink 
                      title="Digital Asset Legislation Guide" 
                      description="Overview of proposed digital asset legislation in Virginia" 
                    />
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Resources
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Policy Newsletter</CardTitle>
                    <CardDescription>
                      Stay informed about blockchain policy developments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Receive weekly updates on blockchain legislation, regulatory changes, 
                      and advocacy opportunities in Virginia.
                    </p>
                    <Button className="w-full">Subscribe</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Find Your Representatives</CardTitle>
                  <CardDescription>
                    Contact your state legislators about blockchain policy issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Enter your address to find your Virginia state delegates and senators.
                  </p>
                  <div className="h-40 bg-muted/30 rounded flex items-center justify-center">
                    Representative Finder Tool (Coming Soon)
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Committees</CardTitle>
                    <CardDescription>
                      Legislative committees that handle blockchain-related bills
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CommitteeLink 
                      name="House Commerce and Energy Committee" 
                      members={22}
                      bills={4}
                    />
                    <CommitteeLink 
                      name="Senate Commerce and Labor Committee" 
                      members={15}
                      bills={3}
                    />
                    <CommitteeLink 
                      name="House Finance Committee" 
                      members={18}
                      bills={2}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Blockchain Caucus</CardTitle>
                    <CardDescription>
                      Legislators focused on blockchain policy
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Virginia Blockchain Caucus is a bipartisan group of state legislators 
                      interested in blockchain technology and its applications.
                    </p>
                    <Button className="w-full">View Caucus Members</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Legislative Impact Analysis</CardTitle>
                  <CardDescription>
                    How proposed legislation could affect Virginia's blockchain industry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">HB 1452: Digital Asset Framework Act</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ImpactCard 
                          title="Industry Growth" 
                          impact="positive"
                          description="Provides regulatory clarity that could attract blockchain businesses to Virginia" 
                        />
                        <ImpactCard 
                          title="Consumer Protection" 
                          impact="positive"
                          description="Establishes safeguards for digital asset customers" 
                        />
                        <ImpactCard 
                          title="Compliance Costs" 
                          impact="mixed"
                          description="May increase initial regulatory burden but provides long-term certainty" 
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">SB 823: Digital Asset Taxation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ImpactCard 
                          title="Tax Clarity" 
                          impact="positive"
                          description="Provides clear guidance on digital asset tax treatment" 
                        />
                        <ImpactCard 
                          title="Industry Competitiveness" 
                          impact="negative"
                          description="Higher tax rates than neighboring states could impact competitiveness" 
                        />
                        <ImpactCard 
                          title="State Revenue" 
                          impact="positive"
                          description="Would generate new tax revenue from digital asset activities" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Economic Impact
                    </CardTitle>
                    <CardDescription>
                      Potential economic effects of blockchain-friendly policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Job Creation Potential</span>
                          <span className="text-sm">High</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">New Business Formation</span>
                          <span className="text-sm">Medium-High</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Tax Revenue Impact</span>
                          <span className="text-sm">Medium</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Comparison</CardTitle>
                    <CardDescription>
                      How Virginia's blockchain policies compare to neighboring states
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60 bg-muted/30 rounded flex items-center justify-center">
                      Regional Policy Comparison Chart (Coming Soon)
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  deadline: string;
  supporters: number;
}

function ActionCard({ title, description, urgency, deadline, supporters }: ActionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge 
            variant={urgency === 'high' ? "destructive" : urgency === 'medium' ? "default" : "outline"}
          >
            {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Important' : 'Ongoing'}
          </Badge>
          <span className="text-sm text-muted-foreground">Deadline: {deadline}</span>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{supporters} supporters</span>
        </div>
        <Button>Take Action</Button>
      </CardFooter>
    </Card>
  );
}

interface ResourceLinkProps {
  title: string;
  description: string;
}

function ResourceLink({ title, description }: ResourceLinkProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <ExternalLink className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

interface CommitteeLinkProps {
  name: string;
  members: number;
  bills: number;
}

function CommitteeLink({ name, members, bills }: CommitteeLinkProps) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div>
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-xs text-muted-foreground">
          {members} members · {bills} blockchain bills
        </p>
      </div>
      <Button variant="ghost" size="sm" className="flex items-center gap-1">
        <MessageSquare className="h-3.5 w-3.5" />
        Contact
      </Button>
    </div>
  );
}

interface ImpactCardProps {
  title: string;
  impact: 'positive' | 'negative' | 'mixed';
  description: string;
}

function ImpactCard({ title, impact, description }: ImpactCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-2 w-2 rounded-full ${
          impact === 'positive' ? 'bg-green-500' : 
          impact === 'negative' ? 'bg-red-500' : 
          'bg-amber-500'
        }`} />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}