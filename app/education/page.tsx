import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Lightbulb, Scale, FileCode, Download, BookOpen, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function EducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blockchain Education</h1>
          <p className="text-muted-foreground mt-1">
            Learn about blockchain technology and its regulatory landscape in Virginia
          </p>
        </div>

        <Tabs defaultValue="blockchain" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="blockchain" className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              Blockchain Basics
            </TabsTrigger>
            <TabsTrigger value="process" className="flex items-center gap-1.5">
              <Landmark className="h-4 w-4" />
              Legislative Process
            </TabsTrigger>
            <TabsTrigger value="landscape" className="flex items-center gap-1.5">
              <Scale className="h-4 w-4" />
              Regulatory Landscape
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blockchain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is Blockchain Technology?</CardTitle>
                <CardDescription>
                  The fundamentals of distributed ledger technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>
                  Blockchain is a type of distributed ledger technology (DLT) that stores information 
                  across a network of computers. This decentralized approach creates a secure, 
                  tamper-resistant record of transactions without requiring a central authority.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlossaryCard 
                    term="Blockchain" 
                    description="A digital ledger of transactions maintained across multiple computers in a peer-to-peer network."
                  />
                  <GlossaryCard 
                    term="Decentralization" 
                    description="The distribution of power away from a central authority to a broader network of participants."
                  />
                  <GlossaryCard 
                    term="Consensus" 
                    description="The process by which a network of nodes comes to agreement on the state of the ledger."
                  />
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    View Full Blockchain Glossary
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types of Blockchain Networks</CardTitle>
                <CardDescription>
                  Public, private, and consortium blockchains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p>
                    Blockchain networks can be configured in different ways depending on their intended use
                    and required level of access control. The three main types are public, private, and 
                    consortium blockchains.
                  </p>

                  {/* Content would continue... */}
                  <div className="flex justify-center">
                    <Button variant="secondary">Continue Reading</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How a Bill Becomes Law in Virginia</CardTitle>
                <CardDescription>
                  Understanding the legislative process for blockchain-related bills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p>
                    The Virginia legislative process follows a structured path from introduction to 
                    enactment. Understanding this process is crucial for tracking and influencing 
                    blockchain legislation.
                  </p>
                  
                  <div className="rounded-md border p-6">
                    <h3 className="text-lg font-medium mb-4">Legislative Process Timeline</h3>
                    {/* Timeline visualization would go here */}
                    <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                      Legislative Process Timeline Visualization
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="secondary">Learn More</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landscape" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Regulatory Landscape</CardTitle>
                <CardDescription>
                  The evolving regulatory environment for blockchain in Virginia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p>
                    Virginia has been progressively developing its regulatory approach to blockchain 
                    technology, digital assets, and cryptocurrencies. This section provides an 
                    overview of key legislation and regulatory developments.
                  </p>
                  
                  <div className="grid gap-4">
                    <RegulationCard 
                      title="HB 2106 (2019)" 
                      description="Established a blockchain technology workgroup to explore applications for state recordkeeping and service delivery."
                    />
                    <RegulationCard 
                      title="SB 271 (2023)" 
                      description="Created a regulatory framework for virtual currency and digital asset businesses operating in Virginia."
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline" className="flex items-center gap-1.5">
                      <Download className="h-4 w-4" />
                      Download Regulatory Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Resources
              </CardTitle>
              <CardDescription>
                Research papers, guides, and educational materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ResourceLink 
                  title="Introduction to Blockchain Technology" 
                  type="White Paper" 
                />
                <ResourceLink 
                  title="Virginia's Blockchain Regulatory Framework" 
                  type="Research Report" 
                />
                <ResourceLink 
                  title="Blockchain in Government Services" 
                  type="Case Study" 
                />
                <Button variant="outline" className="w-full mt-2">
                  View All Resources
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                Upcoming educational content and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  We're continuously developing new educational resources. Join our mailing list to 
                  be notified when we release:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Interactive Blockchain Technology Explainers</li>
                  <li>Regulatory Comparison Tool</li>
                  <li>Blockchain Developer Workshops</li>
                  <li>Policy Education Webinar Series</li>
                </ul>
                <Button className="w-full mt-2">
                  Subscribe for Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function GlossaryCard({ term, description }: { term: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-medium mb-1.5">{term}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RegulationCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-md border">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <Scale className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function ResourceLink({ title, type }: { title: string; type: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div>
        <a href="#" className="text-sm font-medium hover:underline flex items-center gap-1">
          {title}
          <ExternalLink className="h-3 w-3" />
        </a>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Download className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}