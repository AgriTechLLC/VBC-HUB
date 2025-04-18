import { OpenAI } from 'openai';
import { kv } from '@vercel/kv';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const billId = params.id;
  const cacheKey = `bill-summary:${billId}`;

  // Check for mock parameter
  const url = new URL(req.url);
  const useMock = url.searchParams.get('mock') === 'true';
  
  if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
    return Response.json({ summary: getMockSummary(billId) });
  }

  // Check cache first
  try {
    const cachedSummary = await kv.get(cacheKey);
    if (cachedSummary) {
      return Response.json({ summary: cachedSummary });
    }
  } catch (error) {
    console.error('Error accessing summary cache:', error);
    // Continue with API fetch
  }

  try {
    // Fetch bill data using the ServerLegiScanApi
    const bill = await ServerLegiScanApi.getBill(billId);
    
    if (!bill || !bill.texts || bill.texts.length === 0) {
      return Response.json(
        { summary: "<p>No bill text available to summarize.</p>" },
        { status: 200 }
      );
    }
    
    // Get the document ID from the bill texts
    const docId = bill.texts[0].doc_id;
    
    // Fetch the full bill text
    const billTextData = await ServerLegiScanApi.getBillText(docId);
    
    if (!billTextData || !billTextData.doc) {
      return Response.json(
        { summary: "<p>No bill text available to summarize.</p>" },
        { status: 200 }
      );
    }
    
    // Extract text from base64
    const billText = Buffer.from(billTextData.doc, 'base64').toString();

    // Generate summary with GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert legislative analyst and attorney who specializes in explaining complex legislation to the public. Your task is to provide a concise, informative, and factual summary of the bill text provided.`
        },
        {
          role: "user",
          content: `Please provide a summary of this bill. Structure your response with HTML paragraphs with these sections:
          1. Executive Summary (1-2 paragraphs)
          2. Key Provisions (3-5 bullet points)
          3. Potential Impact (1 paragraph)
          
          Include only factual information derived from the bill text. Do not include political commentary or opinions. Format your response using HTML tags (<p>, <ul>, <li>, <h3>, etc.) for clean display.
          
          Bill text:
          ${billText}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content || "Summary generation failed.";
    
    // Cache the summary for 1 week (in seconds)
    try {
      await kv.set(cacheKey, summary, { ex: 7 * 24 * 60 * 60 });
    } catch (error) {
      console.error('Error caching summary:', error);
      // Continue despite cache error
    }
    
    return Response.json({ summary });
  } catch (error) {
    console.error('Error generating bill summary:', error);
    return Response.json(
      { summary: "<p>Failed to generate bill summary. Please try again later.</p>" },
      { status: 500 }
    );
  }
}

function getMockSummary(billId: string): string {
  const mockSummaries: Record<string, string> = {
    '1234567': `<h3>Executive Summary</h3>
<p>The Digital Asset Trading Regulation bill establishes a comprehensive framework for regulating platforms that facilitate the exchange of digital currencies and blockchain-based assets in Virginia. It aims to protect consumers while fostering innovation in the blockchain and cryptocurrency sector.</p>

<h3>Key Provisions</h3>
<ul>
<li>Requires digital asset trading platforms to register with the State Corporation Commission and maintain minimum capital requirements</li>
<li>Establishes cybersecurity standards and mandates regular security audits</li>
<li>Requires platforms to implement AML and KYC procedures</li>
<li>Mandates disclosure of risks, fees, and terms of service to consumers</li>
<li>Creates a regulatory sandbox program to foster innovation</li>
</ul>

<h3>Potential Impact</h3>
<p>This legislation could position Virginia as a leader in digital asset regulation, potentially attracting blockchain businesses to the Commonwealth while providing consumer protections in the rapidly evolving cryptocurrency market. It balances the need for oversight with encouraging technological innovation in financial services.</p>`,

    '5678901': `<h3>Executive Summary</h3>
<p>The Blockchain Technology Innovation Act establishes a dedicated fund to provide financial support for blockchain technology companies establishing operations in Virginia. It creates a structured approach to growing the Commonwealth's blockchain ecosystem through grants, tax incentives, and advisory support.</p>

<h3>Key Provisions</h3>
<ul>
<li>Creates the Blockchain Technology Innovation Fund with an initial allocation of $10 million</li>
<li>Establishes a Blockchain Advisory Council to evaluate grant applications and provide policy recommendations</li>
<li>Offers matching grants of up to $500,000 for qualifying blockchain startups and businesses</li>
<li>Provides tax credits for blockchain companies creating jobs in designated opportunity zones</li>
<li>Requires annual reporting on fund performance and economic impact metrics</li>
</ul>

<h3>Potential Impact</h3>
<p>This legislation could significantly accelerate blockchain adoption across Virginia's economy by providing critical early-stage funding for innovative companies. The focus on applications in finance, healthcare, supply chain, and government services could drive efficiency improvements in these sectors while positioning Virginia as a hub for distributed ledger technology talent and investment.</p>`,

    '9012345': `<h3>Executive Summary</h3>
<p>The Cryptocurrency Taxation Standards bill establishes clear guidelines for the taxation of digital asset transactions in Virginia. It addresses capital gains reporting, mining equipment taxation, and staking rewards to create a predictable tax environment for individuals and businesses engaged in cryptocurrency activities.</p>

<h3>Key Provisions</h3>
<ul>
<li>Establishes reporting requirements for capital gains and losses from digital asset investments</li>
<li>Creates a framework for assessing property taxes on cryptocurrency mining equipment</li>
<li>Clarifies the tax treatment of staking and validation rewards from proof-of-stake blockchains</li>
<li>Allows for tax deductions related to electricity costs for home mining operations</li>
<li>Requires annual filing of cryptocurrency holdings exceeding $10,000 in value</li>
</ul>

<h3>Potential Impact</h3>
<p>This legislation would remove significant tax uncertainty for Virginia residents and businesses engaged in cryptocurrency activities. By establishing clear guidelines that acknowledge the unique characteristics of digital assets, it could encourage greater participation in the cryptocurrency economy while ensuring appropriate tax revenue collection for the Commonwealth.</p>`,

    '3456789': `<h3>Executive Summary</h3>
<p>The Digital Identity Verification Act establishes a framework for using blockchain technology to create a secure, user-controlled digital identity system for Virginia residents. It authorizes the development of a state-backed digital identity infrastructure that would allow citizens to selectively share verified credentials with government agencies and approved private entities.</p>

<h3>Key Provisions</h3>
<ul>
<li>Directs the Secretary of Technology to develop a blockchain-based digital identity system</li>
<li>Establishes privacy protections including data minimization and user consent requirements</li>
<li>Creates technical standards for implementation based on W3C Verifiable Credentials</li>
<li>Ensures interoperability with federal and other state identity systems</li>
<li>Includes provisions for identity recovery and revocation in cases of compromise</li>
</ul>

<h3>Potential Impact</h3>
<p>This legislation could significantly reduce identity fraud, streamline interactions with government services, and create new opportunities for secure digital transactions. By implementing a blockchain-based approach, Virginia would position itself at the forefront of government digital identity innovation while giving citizens greater control over their personal information and how it's shared.</p>`
  };
  
  return mockSummaries[billId] || `<p>No summary available for bill ID ${billId}.</p>`;
}