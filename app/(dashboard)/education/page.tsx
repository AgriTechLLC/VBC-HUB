import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, Gavel, Code, Building2, ShieldCheck } from 'lucide-react';

export default function EducationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Blockchain & Legislative Education Hub</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Resources to help you understand blockchain technology and the legislative process in Virginia.
      </p>

      <Tabs defaultValue="legislative">
        <TabsList className="mb-8">
          <TabsTrigger value="legislative"><Gavel className="mr-2 h-4 w-4" />Legislative Process</TabsTrigger>
          <TabsTrigger value="blockchain"><Code className="mr-2 h-4 w-4" />Blockchain Basics</TabsTrigger>
          <TabsTrigger value="policy"><Building2 className="mr-2 h-4 w-4" />Regulatory Landscape</TabsTrigger>
          <TabsTrigger value="guides"><ShieldCheck className="mr-2 h-4 w-4" />Advocacy Guides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="legislative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Understanding the Virginia Legislative Process</CardTitle>
              <CardDescription>A comprehensive guide to how bills become laws in Virginia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        How a Bill Becomes Law
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>From introduction to enactment, follow the journey of legislation through Virginia's General Assembly.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">Read Guide</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Legislative Terminology
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Decode the specialized language used in legislative documents and proceedings.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">View Glossary</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Virginia General Assembly Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Learn about the Senate, House of Delegates, committees, and leadership roles.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">Explore Guide</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Key Legislative Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Important deadlines and dates for Virginia's legislative sessions and interim periods.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">View Calendar</Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Learn From Previous Legislative Sessions</CardTitle>
              <CardDescription>Case studies and success stories from past legislative initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium">Virginia Blockchain Technology Council Formation (2021)</h3>
                  <p className="text-sm text-muted-foreground">How stakeholders successfully advocated for the creation of the Council</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium">Virtual Currency Legislation (2022)</h3>
                  <p className="text-sm text-muted-foreground">Analysis of Virginia's approach to cryptocurrency regulation</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium">Digital Identity Standards (2023)</h3>
                  <p className="text-sm text-muted-foreground">The collaborative process behind Virginia's digital identity framework</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Fundamentals</CardTitle>
              <CardDescription>Core concepts and technologies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        What is Blockchain?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>An introduction to distributed ledger technology and how it maintains secure, transparent records.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">Read Guide</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Smart Contracts Explained
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Understanding self-executing contracts with code that automates agreement terms.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">Learn More</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Blockchain vs. Cryptocurrency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Clarifying the distinction between blockchain technology and cryptocurrencies.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">Read Article</Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        Public vs. Private Blockchains
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Comparing different blockchain models and their appropriate use cases.</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="#" className="text-sm text-blue-600 hover:underline">View Comparison</Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Applications</CardTitle>
              <CardDescription>Real-world use cases beyond cryptocurrency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Government Records</h3>
                  <p className="text-sm">Secure storage of property records, licenses, and certifications</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Supply Chain</h3>
                  <p className="text-sm">Tracking goods from production to delivery with immutable records</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Digital Identity</h3>
                  <p className="text-sm">Self-sovereign identity solutions for citizens and businesses</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Healthcare</h3>
                  <p className="text-sm">Secure medical records and pharmaceutical tracking</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Voting Systems</h3>
                  <p className="text-sm">Transparent and verifiable election processes</p>
                </div>
                
                <div className="rounded-lg border p-3">
                  <h3 className="font-medium mb-1">Financial Services</h3>
                  <p className="text-sm">Streamlined transactions, settlements, and compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Regulatory Landscape</CardTitle>
              <CardDescription>Understanding blockchain regulation at state and federal levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                  <h3 className="font-medium text-lg mb-2">Virginia's Approach to Blockchain</h3>
                  <p className="mb-4">Overview of Virginia's current regulatory framework and initiatives.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Virginia Blockchain Technology Council initiatives</li>
                    <li>Virtual currency and digital asset laws</li>
                    <li>Smart contract recognition and legal status</li>
                    <li>Regulatory sandbox programs</li>
                  </ul>
                </div>
                
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                  <h3 className="font-medium text-lg mb-2">Federal Regulatory Framework</h3>
                  <p className="mb-4">How federal policies impact blockchain implementation in Virginia.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>SEC positions on digital assets</li>
                    <li>FinCEN requirements for virtual currencies</li>
                    <li>Federal legislation affecting blockchain adoption</li>
                    <li>Cross-border considerations</li>
                  </ul>
                </div>
                
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                  <h3 className="font-medium text-lg mb-2">Comparative State Policies</h3>
                  <p className="mb-4">How Virginia's approach compares to other states.</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <h4 className="font-medium">Leading States</h4>
                      <p className="text-sm">Wyoming, Colorado, Texas</p>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <h4 className="font-medium">Emerging Frameworks</h4>
                      <p className="text-sm">New York, California, Florida</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Policy Considerations</CardTitle>
              <CardDescription>Key issues for policymakers and stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Innovation vs. Consumer Protection
                  </h3>
                  <p className="text-sm">Balancing technological advancement with necessary guardrails.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Privacy and Data Security
                  </h3>
                  <p className="text-sm">Addressing personal information protection in blockchain systems.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    Energy and Environmental Impact
                  </h3>
                  <p className="text-sm">Considering sustainability concerns for different consensus mechanisms.</p>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Economic Development
                  </h3>
                  <p className="text-sm">Fostering blockchain industry growth while managing risks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Effective Advocacy Resources</CardTitle>
              <CardDescription>Tools to help you engage with the legislative process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contacting Your Representatives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Best practices for effective communication with legislators.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Email and letter templates</li>
                      <li>Phone call scripts</li>
                      <li>Best times to make contact</li>
                      <li>Following up effectively</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="#" className="text-sm text-blue-600 hover:underline">Access Templates</Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Testifying at Hearings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">How to prepare and deliver testimony at legislative hearings.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Preparing written testimony</li>
                      <li>Delivering effective oral statements</li>
                      <li>Answering questions confidently</li>
                      <li>What to bring and what to expect</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="#" className="text-sm text-blue-600 hover:underline">View Guide</Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Building Coalitions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Strategies for working with allies to amplify your message.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Identifying potential partners</li>
                      <li>Developing shared messaging</li>
                      <li>Coordinating advocacy efforts</li>
                      <li>Maintaining productive relationships</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="#" className="text-sm text-blue-600 hover:underline">Learn More</Link>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Media Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">How to work with media to promote legislative priorities.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Writing effective press releases</li>
                      <li>Op-ed and letter templates</li>
                      <li>Interview preparation</li>
                      <li>Leveraging social media</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="#" className="text-sm text-blue-600 hover:underline">Access Resources</Link>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Making Your Case: Blockchain Policy</CardTitle>
              <CardDescription>Frameworks for discussing blockchain policy with legislators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Key Messaging Points</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-medium">Economic Impact:</span> Data on job creation and economic benefits of blockchain-friendly policies</li>
                    <li><span className="font-medium">Constituent Benefits:</span> How blockchain can improve government services for citizens</li>
                    <li><span className="font-medium">Innovation Leadership:</span> Positioning Virginia as a leader in emerging technology</li>
                    <li><span className="font-medium">Risk Mitigation:</span> Addressing common concerns with evidence-based information</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Educational Resources for Legislators</h3>
                  <p className="mb-3">Concise materials to help legislators understand blockchain technology:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      Blockchain One-Pager
                    </Link>
                    <Link href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      Use Case Examples
                    </Link>
                    <Link href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      Policy Brief Template
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}