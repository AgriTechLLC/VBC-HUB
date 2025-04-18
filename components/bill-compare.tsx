"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowDownUp, CalendarClock, FileStack, Landmark, Scale, Users, X } from "lucide-react";

// Mock bill options - this would be fetched from the API in a real implementation
const BILL_OPTIONS = [
  { value: "hb1164", label: "HB 1164", title: "Digital Asset Custody", session: "2025" },
  { value: "sb827", label: "SB 827", title: "Blockchain for Government Records", session: "2025" },
  { value: "hb2089", label: "HB 2089", title: "Smart Contract Enforcement", session: "2025" },
  { value: "sb651", label: "SB 651", title: "Cryptocurrency Tax Classification", session: "2025" },
  { value: "hb1342", label: "HB 1342", title: "Digital Identity Standards", session: "2025" },
  { value: "sb938", label: "SB 938", title: "Blockchain Banking", session: "2025" },
];

export function BillCompare() {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState<"differences" | "all">("differences");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Add bill to comparison
  const addBill = (billId: string) => {
    if (selectedBills.length < 3 && !selectedBills.includes(billId)) {
      setSelectedBills([...selectedBills, billId]);
    }
  };
  
  // Remove bill from comparison
  const removeBill = (billId: string) => {
    setSelectedBills(selectedBills.filter(id => id !== billId));
  };
  
  // Fetch bill data - in a real implementation, this would make API calls
  useEffect(() => {
    const fetchData = async () => {
      if (selectedBills.length > 0) {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedBills]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Bill Comparison Tool</h2>
          <p className="text-muted-foreground">Compare up to three blockchain bills side by side</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={compareMode}
            onValueChange={(value) => setCompareMode(value as "differences" | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Compare mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="differences">Show differences</SelectItem>
              <SelectItem value="all">Show all sections</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Bill Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((slot) => (
          <Card key={slot} className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedBills[slot] ? 
                  BILL_OPTIONS.find(b => b.value === selectedBills[slot])?.label :
                  `Bill ${slot + 1}`
                }
              </CardTitle>
              <CardDescription>
                {selectedBills[slot] ? 
                  BILL_OPTIONS.find(b => b.value === selectedBills[slot])?.title :
                  "Select a bill to compare"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {selectedBills[slot] ? (
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex justify-between items-center">
                    <Badge variant="outline" className="flex gap-1.5 items-center">
                      <CalendarClock className="h-3 w-3" />
                      Session {BILL_OPTIONS.find(b => b.value === selectedBills[slot])?.session}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBill(selectedBills[slot])}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 flex items-center justify-center border rounded-md p-4 bg-muted/50">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground text-sm">Loading...</div>
                    ) : (
                      <div className="text-center text-muted-foreground text-sm">
                        Bill details will appear here
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Select onValueChange={addBill}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILL_OPTIONS.filter(option => !selectedBills.includes(option.value)).map((bill) => (
                      <SelectItem key={bill.value} value={bill.value}>
                        {bill.label} - {bill.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Comparison Results */}
      {selectedBills.length >= 2 ? (
        <div className="space-y-6">
          <Separator />
          
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="provisions">Key Provisions</TabsTrigger>
              <TabsTrigger value="stakeholders">Stakeholder Impact</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-6">
              <ComparisonResults selectedBills={selectedBills} />
            </TabsContent>
            <TabsContent value="provisions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileStack className="h-5 w-5" />
                    Key Provisions Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Digital Asset Custody Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedBills.map((bill) => (
                          <div key={bill} className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">{BILL_OPTIONS.find(b => b.value === bill)?.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {bill === "hb1164" ? 
                                "Requires segregation of customer assets and quarterly audits." :
                                bill === "sb827" ? 
                                "No specific custody provisions." :
                                "Requires monthly audits and insurance coverage."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Regulatory Authority</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedBills.map((bill) => (
                          <div key={bill} className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">{BILL_OPTIONS.find(b => b.value === bill)?.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {bill === "hb1164" ? 
                                "Assigns authority to Department of Financial Institutions." :
                                bill === "sb827" ? 
                                "Creates new Digital Asset Commission." :
                                "Splits authority between Treasury and State Corporation Commission."
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stakeholders" className="mt-6">
              <StakeholderImpact selectedBills={selectedBills} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-6">
              <div className="h-60 border rounded-md flex items-center justify-center bg-muted/30">
                Timeline comparison visualization (Coming Soon)
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : selectedBills.length === 1 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select at least one more bill to enable comparison.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function ComparisonResults({ selectedBills }: { selectedBills: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5" />
          Comparative Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Bill Scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedBills.map((bill) => (
                <div key={bill} className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">{BILL_OPTIONS.find(b => b.value === bill)?.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {bill === "hb1164" ? 
                      "Focuses on custodial services for digital assets, including operational requirements." :
                      bill === "sb827" ? 
                      "Addresses government use of blockchain technology for record-keeping and services." :
                      "Establishes legal framework for smart contracts and digital signatures."
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Key Differences</h3>
            <div className="border rounded-md p-4">
              <ul className="space-y-3">
                <li className="text-sm">
                  <span className="font-medium">Regulatory Approach:</span>{" "}
                  {selectedBills.includes("hb1164") && selectedBills.includes("hb2089") ? 
                    "HB 1164 takes a financial services regulation approach while HB 2089 focuses on legal enforcement mechanisms." : 
                    "Bills differ in their fundamental regulatory approach and scope."
                  }
                </li>
                <li className="text-sm">
                  <span className="font-medium">Implementation Timeline:</span>{" "}
                  {selectedBills.includes("sb827") ? 
                    "SB 827 has a phased implementation over 24 months, while other bills have immediate effect after passage." : 
                    "Implementation timelines vary between immediate and phased approaches."
                  }
                </li>
                <li className="text-sm">
                  <span className="font-medium">Industry Impact:</span>{" "}
                  Various compliance requirements and market access provisions differ significantly.
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Common Elements</h3>
            <div className="border rounded-md p-4">
              <ul className="space-y-3">
                <li className="text-sm">
                  <span className="font-medium">Definitions:</span>{" "}
                  All bills include similar definitions of blockchain technology and digital assets.
                </li>
                <li className="text-sm">
                  <span className="font-medium">Consumer Protection:</span>{" "}
                  Each bill includes provisions aimed at protecting consumers or users.
                </li>
                <li className="text-sm">
                  <span className="font-medium">Technology Neutrality:</span>{" "}
                  All legislation attempts to remain neutral regarding specific blockchain implementations.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StakeholderImpact({ selectedBills }: { selectedBills: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Industry Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedBills.map((bill) => (
              <div key={bill} className="border rounded-md p-4">
                <h4 className="font-medium mb-2 flex items-center justify-between">
                  {BILL_OPTIONS.find(b => b.value === bill)?.label}
                  <Badge 
                    variant={
                      bill === "hb1164" ? "default" : 
                      bill === "sb827" ? "secondary" :
                      "outline"
                    }
                  >
                    {bill === "hb1164" ? "Medium Impact" : 
                     bill === "sb827" ? "Low Impact" :
                     "High Impact"}
                  </Badge>
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {bill === "hb1164" ? 
                    "Requires operational changes for custodial services but provides regulatory certainty." :
                    bill === "sb827" ? 
                    "Limited direct impact on private industry; creates new government contracts." :
                    "Significantly changes legal status of smart contracts, affecting multiple sectors."
                  }
                </p>
                <div className="text-sm flex gap-4">
                  <div>
                    <span className="font-medium block mb-1">Compliance Cost</span>
                    <Badge variant="outline" className="bg-primary/10">
                      {bill === "hb1164" ? "Medium" : 
                       bill === "sb827" ? "Low" :
                       "High"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium block mb-1">Growth Potential</span>
                    <Badge variant="outline" className="bg-primary/10">
                      {bill === "hb1164" ? "Medium" : 
                       bill === "sb827" ? "High" :
                       "Medium"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Regulatory Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedBills.map((bill) => (
              <div key={bill} className="border rounded-md p-4">
                <h4 className="font-medium mb-2">{BILL_OPTIONS.find(b => b.value === bill)?.label}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Regulatory Agency</span>
                    <span className="text-sm">
                      {bill === "hb1164" ? "Dept. of Financial Institutions" : 
                       bill === "sb827" ? "Digital Asset Commission" :
                       "State Corporation Commission"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">New Regulations</span>
                    <span className="text-sm">
                      {bill === "hb1164" ? "5-8 new regulations" : 
                       bill === "sb827" ? "10-15 new regulations" :
                       "3-5 new regulations"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Reporting Requirements</span>
                    <span className="text-sm">
                      {bill === "hb1164" ? "Quarterly" : 
                       bill === "sb827" ? "Annual" :
                       "Monthly"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Enforcement</span>
                    <span className="text-sm">
                      {bill === "hb1164" ? "Civil penalties" : 
                       bill === "sb827" ? "Administrative" :
                       "Civil and criminal"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Cross-Bill Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedBills.length >= 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedBills.includes("hb1164") && selectedBills.includes("hb2089") ? 
                  "HB 1164 and HB 2089 have complementary provisions that could work together in a comprehensive regulatory framework." :
                  selectedBills.includes("sb827") && selectedBills.includes("hb1164") ?
                  "SB 827 and HB 1164 have some overlapping jurisdictional issues that could create regulatory conflicts." :
                  "These bills represent different approaches to blockchain regulation that could be harmonized with amendments."
                }
              </p>
              
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-3">Potential Combined Effects</h4>
                <ul className="space-y-2">
                  <li className="text-sm">
                    <span className="font-medium">Regulatory Complexity:</span>{" "}
                    {selectedBills.length === 3 ? 
                      "Implementing all three bills simultaneously would create significant regulatory complexity." :
                      "These bills together would create a moderately complex regulatory environment."
                    }
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Market Impact:</span>{" "}
                    {selectedBills.includes("hb2089") ? 
                      "Legal certainty from HB 2089 combined with other provisions could stimulate market growth." :
                      "The combined regulatory framework would provide stability but increase compliance costs."
                    }
                  </li>
                  <li className="text-sm">
                    <span className="font-medium">Implementation Challenges:</span>{" "}
                    Coordinating implementation timelines would require careful planning by regulatory bodies.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Select at least two bills to see cross-bill analysis
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}