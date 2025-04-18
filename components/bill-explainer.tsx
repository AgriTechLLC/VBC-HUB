"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, LightbulbIcon, Users, Building, FileClock, Scale, HelpCircle } from 'lucide-react';

export default function BillExplainer() {
  const [selectedSection, setSelectedSection] = useState('glossary');
  const [viewingTerm, setViewingTerm] = useState<string | null>(null);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-primary" />
          Understanding Blockchain Legislation
        </CardTitle>
        <CardDescription>
          A guide to help you understand blockchain bills and the legislative process
        </CardDescription>
      </CardHeader>
      
      <Tabs
        value={selectedSection}
        onValueChange={setSelectedSection}
        className="px-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="glossary">
            <span className="hidden sm:inline">Blockchain</span> Glossary
          </TabsTrigger>
          <TabsTrigger value="process">
            <span className="hidden sm:inline">Legislative</span> Process
          </TabsTrigger>
          <TabsTrigger value="stakeholders">Key Stakeholders</TabsTrigger>
          <TabsTrigger value="faq">
            <span className="hidden sm:inline">Common</span> Questions
          </TabsTrigger>
        </TabsList>
        
        {/* Blockchain Glossary */}
        <TabsContent value="glossary" className="space-y-4 pt-4">
          {viewingTerm ? (
            <TermDetail term={viewingTerm} onBack={() => setViewingTerm(null)} />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Common terms and concepts in blockchain legislation
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {blockchainTerms.map(term => (
                  <Button
                    key={term.title}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => setViewingTerm(term.title)}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">{term.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {term.shortDescription}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Legislative Process */}
        <TabsContent value="process" className="pt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              How a blockchain bill becomes law in Virginia
            </p>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
              
              {/* Timeline steps */}
              <div className="space-y-8 relative pl-12">
                {legislativeSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Timeline node */}
                    <div className="absolute -left-12 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    
                    <h3 className="font-medium text-base">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    
                    {step.insights && (
                      <div className="mt-2 bg-muted/50 rounded-md p-3 text-sm flex items-start gap-2">
                        <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p>{step.insights}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Key Stakeholders */}
        <TabsContent value="stakeholders" className="pt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Important groups and their roles in blockchain policy
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StakeholderCard
                title="Government Entities"
                icon={<Building className="h-5 w-5" />}
                stakeholders={[
                  {
                    name: "Virginia Department of Financial Institutions",
                    role: "Oversees financial regulations affecting blockchain and digital assets"
                  },
                  {
                    name: "Virginia Innovation Partnership Corporation",
                    role: "Promotes technology investment and innovation in Virginia"
                  },
                  {
                    name: "State Corporation Commission",
                    role: "Regulates business entities and certain financial services"
                  },
                  {
                    name: "Attorney General's Office",
                    role: "Provides legal opinions on regulations and enforcement"
                  }
                ]}
              />
              
              <StakeholderCard
                title="Industry & Advocacy"
                icon={<Users className="h-5 w-5" />}
                stakeholders={[
                  {
                    name: "Virginia Blockchain Council",
                    role: "Educates and advocates for responsible blockchain policies"
                  },
                  {
                    name: "Chamber of Digital Commerce",
                    role: "National trade association for the blockchain industry"
                  },
                  {
                    name: "Virginia Financial Innovation Coalition",
                    role: "Promotes policies supporting financial technology growth"
                  },
                  {
                    name: "Consumer Protection Groups",
                    role: "Advocate for safeguards in new technologies"
                  }
                ]}
              />
              
              <StakeholderCard
                title="Legal Framework"
                icon={<Scale className="h-5 w-5" />}
                stakeholders={[
                  {
                    name: "Uniform Law Commission",
                    role: "Develops model legislation like the URVCBA"
                  },
                  {
                    name: "Virginia Bar Association",
                    role: "Provides legal expertise on emerging technology issues"
                  },
                  {
                    name: "Federal Regulators",
                    role: "SEC, FinCEN, and other agencies with overlapping jurisdiction"
                  },
                  {
                    name: "Virginia Court System",
                    role: "Interprets legislation in case of disputes"
                  }
                ]}
              />
              
              <StakeholderCard
                title="Legislative Process"
                icon={<FileClock className="h-5 w-5" />}
                stakeholders={[
                  {
                    name: "Bill Sponsors",
                    role: "Legislators who introduce and champion blockchain bills"
                  },
                  {
                    name: "Committee Chairs",
                    role: "Control hearing schedules and bill amendments"
                  },
                  {
                    name: "Legislative Aides",
                    role: "Staff who research issues and draft bill language"
                  },
                  {
                    name: "Division of Legislative Services",
                    role: "Provides technical assistance in drafting legislation"
                  }
                ]}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Common Questions */}
        <TabsContent value="faq" className="pt-4">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Answers to frequently asked questions about blockchain legislation
            </p>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {item.question}
                  </h3>
                  <p className="text-sm text-muted-foreground pl-6">{item.answer}</p>
                  
                  {index < faqItems.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between items-center border-t mt-6 px-6 py-4 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Explainer provided by Virginia Blockchain Council
        </p>
        <Button variant="ghost" size="sm" asChild>
          <a href="/education" className="text-xs">View Full Education Hub</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Component for detailed term view
function TermDetail({ term, onBack }: { term: string; onBack: () => void }) {
  const termData = blockchainTerms.find(t => t.term === term) || 
                   blockchainTerms.find(t => t.title === term);
  
  if (!termData) return null;
  
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
        ← Back to Glossary
      </Button>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">{termData.title}</h2>
          {termData.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {termData.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        
        <p>{termData.description}</p>
        
        {termData.legislativeContext && (
          <>
            <h3 className="font-medium text-lg mt-4">Legislative Context</h3>
            <p className="text-muted-foreground">{termData.legislativeContext}</p>
          </>
        )}
        
        {termData.examples && (
          <>
            <h3 className="font-medium text-lg mt-4">Examples in Legislation</h3>
            <ul className="list-disc pl-5 space-y-2">
              {termData.examples.map((example, i) => (
                <li key={i} className="text-muted-foreground">{example}</li>
              ))}
            </ul>
          </>
        )}
        
        {termData.relatedTerms && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Related Terms</h3>
            <div className="flex flex-wrap gap-2">
              {termData.relatedTerms.map(relatedTerm => (
                <Button 
                  key={relatedTerm} 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newTerm = blockchainTerms.find(t => 
                      t.title === relatedTerm || t.term === relatedTerm
                    )?.title;
                    if (newTerm) onBack(); // Go back to list first to avoid animation issues
                    setTimeout(() => {
                      if (newTerm) setViewingTerm(newTerm);
                    }, 0);
                  }}
                >
                  {relatedTerm}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component for stakeholder cards
function StakeholderCard({ 
  title, 
  icon, 
  stakeholders 
}: { 
  title: string; 
  icon: React.ReactNode; 
  stakeholders: { name: string; role: string }[] 
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {stakeholders.map(item => (
            <li key={item.name} className="text-sm">
              <span className="font-medium">{item.name}</span>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Legislative process steps
const legislativeSteps = [
  {
    title: "Bill Introduction",
    description: "A legislator introduces a blockchain-related bill, which is assigned to the appropriate committee, usually Commerce & Labor for regulatory matters or Science & Technology for innovation policies.",
    insights: "Blockchain bills are often introduced by legislators with technology backgrounds or those representing districts with technology companies."
  },
  {
    title: "Committee Consideration",
    description: "The committee holds hearings where stakeholders can testify about the bill's potential impact. For blockchain legislation, this often involves expert testimony from industry, regulators, and consumer advocates.",
    insights: "Committee hearings for blockchain bills frequently include explanations of technical concepts for legislators who may be unfamiliar with the technology."
  },
  {
    title: "Amendments and Markup",
    description: "The committee may amend the bill to address concerns or improve its language, particularly important for blockchain bills where terminology precision is crucial.",
    insights: "Many blockchain bills undergo significant amendments to clarify definitions and ensure regulatory clarity without stifling innovation."
  },
  {
    title: "Floor Debate and Vote",
    description: "If approved by committee, the bill moves to the chamber floor (House or Senate) for debate and a vote by all members.",
    insights: "Floor debates on blockchain bills often focus on balancing innovation with consumer protection and financial stability concerns."
  },
  {
    title: "Crossing Over",
    description: "If passed by one chamber, the bill moves to the other chamber and repeats the committee and floor process.",
    insights: "Bills that pass one chamber often face different concerns in the other, which can lead to conflicting versions that must be reconciled."
  },
  {
    title: "Conference Committee (if needed)",
    description: "If the House and Senate pass different versions, a conference committee resolves the differences.",
    insights: "Technical aspects of blockchain bills sometimes need reconciliation when different regulatory approaches are taken by each chamber."
  },
  {
    title: "Governor's Action",
    description: "The governor may sign the bill into law, veto it, or allow it to become law without signature.",
    insights: "Governors often consider the economic development potential of blockchain-friendly legislation against consumer protection concerns."
  },
  {
    title: "Implementation",
    description: "Once enacted, regulatory agencies typically develop specific rules and guidance for implementation.",
    insights: "The implementation phase for blockchain laws often includes stakeholder working groups to ensure regulations are technically feasible and effective."
  }
];

// Common blockchain terms
const blockchainTerms = [
  {
    title: "Blockchain",
    term: "blockchain",
    shortDescription: "A digital ledger recording transactions across multiple computers",
    description: "A blockchain is a distributed digital ledger that records transactions across many computers so that any involved record cannot be altered retroactively without altering all subsequent blocks. This technology enables secure, transparent, and tamper-resistant record-keeping.",
    tags: ["Core Technology", "Infrastructure"],
    legislativeContext: "In legislation, blockchain is often defined technically to distinguish it from other database technologies, emphasizing its distributed nature and cryptographic security features.",
    examples: [
      "Virginia's SB 1326 defined blockchain as 'a distributed ledger technology that uses a distributed, decentralized, shared, and replicated ledger, which may be public or private, permissioned or permissionless'",
      "Bills often specify that blockchain records may serve as legal records if they meet certain requirements"
    ],
    relatedTerms: ["Smart Contracts", "Distributed Ledger", "Consensus Mechanism"]
  },
  {
    title: "Smart Contracts",
    term: "smart_contracts",
    shortDescription: "Self-executing code that automatically implements agreement terms",
    description: "Smart contracts are self-executing programs stored on a blockchain that run when predetermined conditions are met. They automate agreement execution so that all participants can be immediately certain of the outcome without an intermediary's involvement.",
    tags: ["Technology Application", "Legal"],
    legislativeContext: "Legislation often addresses whether smart contracts can satisfy legal requirements for contracts, including provisions for electronic signatures and records.",
    examples: [
      "Virginia Code § 59.1-575 recognizes smart contracts in electronic transactions and specifies that they cannot be denied legal effect solely because they are executed through a blockchain",
      "Regulatory frameworks may address liability issues when smart contracts execute unintended consequences"
    ],
    relatedTerms: ["Blockchain", "Digital Signature", "Tokenization"]
  },
  {
    title: "Digital Asset",
    term: "digital_asset",
    shortDescription: "An electronic record with value, including cryptocurrencies",
    description: "Digital assets are electronic records in which an individual has a right or interest. In blockchain legislation, this term typically encompasses cryptocurrencies, security tokens, utility tokens, and other blockchain-based assets.",
    tags: ["Economic", "Legal Definition"],
    legislativeContext: "How digital assets are defined determines which regulatory frameworks apply to them, including securities laws, money transmission regulations, or commodity rules.",
    examples: [
      "The Uniform Law Commission's model legislation defines digital assets as 'an electronic record that has value'",
      "Some state legislation distinguishes between different types of digital assets based on their function (payment, investment, utility)"
    ],
    relatedTerms: ["Cryptocurrency", "Tokenization", "Securities Token"]
  },
  {
    title: "Cryptocurrency",
    term: "cryptocurrency",
    shortDescription: "Digital currencies using cryptography for security",
    description: "A digital or virtual currency that uses cryptography for security and operates on a blockchain. Unlike traditional currencies, cryptocurrencies generally operate without a central authority, such as a government or bank.",
    tags: ["Financial", "Currency"],
    legislativeContext: "Legislation must determine if cryptocurrencies are treated as currencies, commodities, securities, or some other asset class for regulatory and tax purposes.",
    examples: [
      "Bills may explicitly include or exclude cryptocurrencies from definitions of 'money' or 'legal tender'",
      "State regulations often focus on cryptocurrency exchanges and custody services to protect consumers"
    ],
    relatedTerms: ["Digital Asset", "Virtual Currency", "Stablecoin"]
  },
  {
    title: "Virtual Currency Business Activity",
    term: "vcba",
    shortDescription: "Commercial activities involving virtual currencies",
    description: "Commercial activities related to virtual currencies including exchange, transfer, storage, or issuance services. This term is commonly used in regulatory frameworks to define which businesses need to comply with specific regulations.",
    tags: ["Regulatory", "Business"],
    legislativeContext: "Defines which companies must obtain licenses or register with state authorities to conduct blockchain-related financial activities.",
    examples: [
      "The Uniform Regulation of Virtual-Currency Businesses Act (URVCBA) defines five types of activities that constitute virtual currency business activity",
      "Licensing requirements often include minimum capital reserves, cybersecurity standards, and consumer protection measures"
    ],
    relatedTerms: ["Money Transmission", "Custody", "Exchange"]
  },
  {
    title: "Distributed Ledger",
    term: "distributed_ledger",
    shortDescription: "A consensus of replicated, shared, and synchronized data",
    description: "A consensus of replicated, shared, and synchronized digital data geographically spread across multiple sites, institutions, or countries. Blockchain is one type of distributed ledger technology.",
    tags: ["Core Technology", "Infrastructure"],
    legislativeContext: "Some legislation uses this broader term instead of blockchain to remain technologically neutral and avoid becoming quickly outdated.",
    examples: [
      "Regulatory sandboxes may apply to innovations using distributed ledger technology broadly, not just blockchain specifically",
      "Legislation may reference distributed ledger technology for government record-keeping or identity verification systems"
    ],
    relatedTerms: ["Blockchain", "Consensus Mechanism", "Peer-to-Peer Network"]
  },
  {
    title: "Tokenization",
    term: "tokenization",
    shortDescription: "Converting rights to an asset into a digital token",
    description: "The process of converting rights to an asset into a digital token on a blockchain. This can apply to real estate, artwork, securities, or virtually any asset with value.",
    tags: ["Business Application", "Economic"],
    legislativeContext: "Legislation addresses how ownership records maintained on blockchains relate to traditional property and securities laws.",
    examples: [
      "Some states have passed laws recognizing blockchain-based records for property titles or corporate shares",
      "Securities regulations may specify when tokenized assets are considered investment contracts"
    ],
    relatedTerms: ["Security Token", "Non-Fungible Token (NFT)", "Digital Asset"]
  },
  {
    title: "Regulatory Sandbox",
    term: "regulatory_sandbox",
    shortDescription: "Program allowing limited testing of innovative products",
    description: "A framework set up by a regulator that allows businesses to test innovative products, services, or business models in a controlled environment with regulatory oversight but with temporary exemption from some regulatory requirements.",
    tags: ["Regulatory", "Innovation"],
    legislativeContext: "Legislation establishing regulatory sandboxes aims to foster innovation while maintaining consumer protection and gathering data on new technologies.",
    examples: [
      "Several states have enacted blockchain sandbox legislation modeled after Arizona's first-in-nation approach",
      "Sandbox programs typically include reporting requirements and consumer protection provisions"
    ],
    relatedTerms: ["Innovation Zone", "Limited Regulatory Exemption", "FinTech"]
  },
  {
    title: "Stablecoin",
    term: "stablecoin",
    shortDescription: "Cryptocurrencies designed to minimize price volatility",
    description: "A type of cryptocurrency designed to minimize price volatility, often by pegging its value to a currency or commodity, or through algorithmic mechanisms.",
    tags: ["Financial", "Currency"],
    legislativeContext: "Legislation increasingly focuses on stablecoin issuance, reserves, and redemption guarantees as these tokens gain broader use in payments and commerce.",
    examples: [
      "Recent bills have proposed requirements for stablecoin issuers to maintain 1:1 reserves of high-quality liquid assets",
      "Some regulations differentiate between fiat-backed, crypto-backed, and algorithmic stablecoins"
    ],
    relatedTerms: ["Cryptocurrency", "Digital Dollar", "Reserve Requirements"]
  },
  {
    title: "Digital Identity",
    term: "digital_identity",
    shortDescription: "Electronic verification of an individual's identity",
    description: "Information used by computer systems to represent an external entity (person, organization, application, or device). Blockchain-based digital identity solutions can provide secure, portable, and user-controlled identification.",
    tags: ["Identity", "Privacy", "Security"],
    legislativeContext: "Legislation addresses how blockchain-based identity systems can meet legal requirements for identity verification while protecting privacy.",
    examples: [
      "Some states have initiated blockchain pilots for digital driver's licenses or professional credentials",
      "Legislation may specify standards for self-sovereign identity systems that give users control over their data"
    ],
    relatedTerms: ["Self-Sovereign Identity", "Verifiable Credentials", "Zero-Knowledge Proof"]
  },
  {
    title: "Decentralized Finance (DeFi)",
    term: "defi",
    shortDescription: "Financial services using blockchain without intermediaries",
    description: "Financial services and applications built on blockchain networks that operate without traditional financial intermediaries like banks or brokerages. DeFi applications aim to recreate traditional financial systems (lending, borrowing, trading) in a decentralized architecture.",
    tags: ["Financial", "Innovation"],
    legislativeContext: "Legislation grapples with how existing financial regulations apply when there is no central operator or intermediary to regulate.",
    examples: [
      "Some bills address whether DeFi protocols themselves can be considered money transmitters or exchange operators",
      "Regulatory clarity on smart contract-based lending and interest-bearing accounts is emerging in various states"
    ],
    relatedTerms: ["Peer-to-Peer Lending", "Decentralized Exchange (DEX)", "Yield Farming"]
  },
  {
    title: "Non-Fungible Token (NFT)",
    term: "nft",
    shortDescription: "Unique blockchain token representing ownership of an item",
    description: "A unique digital token on a blockchain that represents ownership of a specific item, such as digital art, collectibles, or real-world assets. Unlike cryptocurrencies, NFTs are not interchangeable with each other.",
    tags: ["Digital Asset", "Collectibles", "Art"],
    legislativeContext: "Legislation addresses intellectual property rights, royalty payments, and consumer protection in NFT markets.",
    examples: [
      "Tax legislation clarifies whether NFT sales are subject to sales tax or capital gains tax",
      "Some states have addressed the application of consumer protection laws to NFT marketplaces"
    ],
    relatedTerms: ["Digital Art", "Intellectual Property", "Tokenization"]
  }
];

// FAQ items
const faqItems = [
  {
    question: "Why do we need specific laws for blockchain?",
    answer: "Blockchain technology creates novel situations that don't fit neatly into existing legal frameworks. For example, when a smart contract automatically executes, who is responsible if something goes wrong? When digital assets cross borders instantly, which jurisdiction's laws apply? Blockchain-specific legislation provides clarity for businesses, consumers, and courts on these new questions."
  },
  {
    question: "What's the difference between federal and state blockchain regulation?",
    answer: "Federal regulations typically focus on securities laws, anti-money laundering, taxation, and consumer protection at a national level. State laws address areas like money transmission, business licensing, digital identity, and creating innovation-friendly environments. Both levels of regulation interact, and sometimes federal law preempts state law when there's a conflict."
  },
  {
    question: "How do blockchain laws affect businesses in Virginia?",
    answer: "Blockchain laws determine whether businesses need specific licenses to operate, what consumer protection measures they must implement, how their activities are taxed, and what records they must maintain. Clear regulations reduce legal uncertainty, making Virginia more attractive for blockchain businesses while protecting consumers and the financial system."
  },
  {
    question: "What is a regulatory sandbox and why is it important?",
    answer: "A regulatory sandbox allows businesses to test innovative blockchain products in a controlled environment with temporary exemptions from certain regulations. This helps companies innovate while giving regulators insight into new technologies. Sandboxes have proven effective in fostering blockchain innovation while maintaining appropriate oversight."
  },
  {
    question: "How can blockchain be used in government applications?",
    answer: "Government applications include secure identity management, transparent record-keeping for property titles and business registrations, supply chain tracking for government purchases, secure voting systems, and efficient distribution of benefits. Legislation often authorizes pilot programs to test these applications before wider implementation."
  },
  {
    question: "What is the 'Uniform Regulation of Virtual-Currency Businesses Act'?",
    answer: "The URVCBA is a model law created by the Uniform Law Commission to provide consistent regulation of businesses engaged in virtual currency activities across different states. It creates a three-tier system based on transaction volume, requirements for licensure, consumer protections, and cybersecurity standards. Several states have used this model as a starting point for their own legislation."
  },
  {
    question: "How do I participate in the legislative process for blockchain bills?",
    answer: "You can participate by contacting your representatives, submitting written comments to committees considering blockchain bills, testifying at public hearings, joining industry or advocacy organizations that engage with legislators, and participating in regulatory comment periods when agencies implement new rules. The Virginia Blockchain Council actively facilitates stakeholder engagement in the legislative process."
  }
];