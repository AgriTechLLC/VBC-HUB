import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { ServerLegiScanApi } from '@/lib/legiscan/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const useMock = searchParams.get('mock') === 'true';
  
  try {
    // Check for mock parameter
    if (useMock || (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API)) {
      return generateMockEvents();
    }
    
    // Try to get from cache first
    try {
      const cachedEvents = await kv.get('events:all');
      if (cachedEvents) {
        return NextResponse.json(cachedEvents);
      }
    } catch (error) {
      console.error('Error accessing events cache:', error);
      // Continue with API fetch
    }
    
    // Fetch blockchain-related bills to extract calendar events
    const blockchainBills = await ServerLegiScanApi.getBlockchainBills();
    
    // Collect all events from bill calendars
    const legislativeEvents = [];
    
    for (const bill of blockchainBills) {
      if (bill.calendar && bill.calendar.length > 0) {
        for (const event of bill.calendar) {
          legislativeEvents.push({
            id: `${bill.bill_id}-${event.date}-${event.time}`,
            title: `${bill.bill_number} - ${event.type}`,
            date: event.date,
            time: event.time,
            location: event.location,
            type: 'Hearing',
            description: event.description || `${event.type} for ${bill.bill_number}: ${bill.title}`,
            billId: bill.bill_id,
            billNumber: bill.bill_number,
            isLegislative: true,
          });
        }
      }
    }
    
    // Add VBC events to the mix
    const vbcEvents = generateVBCEvents();
    
    // Combine and sort all events
    const allEvents = [...legislativeEvents, ...vbcEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const response = { events: allEvents };
    
    // Cache for 1 hour (in seconds)
    try {
      await kv.set('events:all', response, { ex: 60 * 60 });
    } catch (error) {
      console.error('Error caching events:', error);
      // Continue despite cache error
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: "Failed to fetch events. Please try again later." },
      { status: 500 }
    );
  }
}

function generateMockEvents() {
  // Current date for generating upcoming dates
  const now = new Date();
  
  // Mock legislative events
  const legislativeEvents = [
    {
      id: 'leg-1',
      title: 'HB1234 - Committee Hearing',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'House Commerce Committee Room, Virginia State Capitol',
      type: 'Hearing',
      description: 'House Commerce Committee hearing on Digital Asset Trading Regulation bill',
      billId: 1234567,
      billNumber: 'HB1234',
      isLegislative: true,
    },
    {
      id: 'leg-2',
      title: 'SB7890 - Floor Vote',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '2:00 PM',
      location: 'Senate Chamber, Virginia State Capitol',
      type: 'Vote',
      description: 'Senate floor vote on Digital Identity Verification Act',
      billId: 3456789,
      billNumber: 'SB7890',
      isLegislative: true,
    },
    {
      id: 'leg-3',
      title: 'HB4567 - Finance Subcommittee',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '9:30 AM',
      location: 'Subcommittee Room A, Pocahontas Building',
      type: 'Hearing',
      description: 'House Finance Subcommittee hearing on Cryptocurrency Taxation Standards',
      billId: 9012345,
      billNumber: 'HB4567',
      isLegislative: true,
    }
  ];
  
  // VBC events
  const vbcEvents = generateVBCEvents();
  
  // Combine and sort all events
  const allEvents = [...legislativeEvents, ...vbcEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return NextResponse.json({ events: allEvents });
}

function generateVBCEvents() {
  // Current date for generating upcoming dates
  const now = new Date();
  
  // VBC event locations
  const locations = [
    "Richmond Convention Center",
    "Virginia Tech Research Center, Arlington",
    "University of Virginia, Charlottesville",
    "George Mason University, Fairfax",
    "Capital One Labs, Tysons Corner",
    "Virtual Meeting",
    "Dominion Energy Innovation Center, Richmond",
    "McGuireWoods LLP, Richmond",
    "1776 Startup Hub, Arlington"
  ];
  
  // Event types
  const eventTypes = [
    "Conference",
    "Meetup",
    "Workshop",
    "Panel",
    "Roundtable",
    "Webinar",
    "Hackathon",
    "Networking",
    "Training"
  ];
  
  // Event titles based on type
  const titlesByType: Record<string, string[]> = {
    "Conference": [
      "Virginia Blockchain Summit",
      "Blockchain Innovation Conference",
      "Digital Asset Policy Conference",
      "Future of Finance VA"
    ],
    "Meetup": [
      "Richmond Blockchain Meetup",
      "NoVA Web3 Group",
      "DeFi Developers Meetup",
      "Crypto Investors Group"
    ],
    "Workshop": [
      "Smart Contract Programming Workshop",
      "Blockchain Security Workshop",
      "Web3 Development Workshop",
      "Tokenomics Workshop"
    ],
    "Panel": [
      "Blockchain in Government Panel",
      "Crypto Regulation Expert Panel",
      "Blockchain for Enterprise Panel",
      "Digital Identity Discussion"
    ],
    "Roundtable": [
      "Blockchain Policy Roundtable",
      "Virginia Crypto Roundtable",
      "Regulatory Roundtable",
      "Blockchain Entrepreneurs Roundtable"
    ],
    "Webinar": [
      "Blockchain 101 Webinar",
      "DeFi Explained",
      "Understanding NFTs",
      "Crypto Taxes Webinar"
    ],
    "Hackathon": [
      "Virginia Blockchain Hackathon",
      "Build on Blockchain Challenge",
      "Web3 App Development Hack",
      "Blockchain for Social Good Hackathon"
    ],
    "Networking": [
      "Blockchain Professionals Mixer",
      "Web3 Careers Networking",
      "Crypto Industry Networking",
      "Virginia Tech Blockchain Social"
    ],
    "Training": [
      "Solidity Developer Training",
      "Blockchain Business Training",
      "Web3 for Enterprises Training",
      "DeFi Protocol Training"
    ]
  };
  
  // Generate VBC events
  return Array.from({ length: 9 }).map((_, index) => {
    // Generate a date between now and next 3 months
    const eventDate = new Date();
    eventDate.setDate(now.getDate() + Math.floor(Math.random() * 90) + index);
    
    // Format date as YYYY-MM-DD
    const date = eventDate.toISOString().split('T')[0];
    
    // Random event duration (1-4 hours)
    const durationHours = Math.floor(Math.random() * 3) + 1;
    
    // Format time string
    const startHour = 9 + Math.floor(Math.random() * 9); // 9 AM to 6 PM
    const endHour = Math.min(21, startHour + durationHours);
    const startTime = `${startHour}:00 ${startHour >= 12 ? 'PM' : 'AM'}`;
    const endTime = `${endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`;
    
    // Random location
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Random type
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Random attendee count
    const attendees = Math.floor(Math.random() * 200) + 20;
    
    // Select a random title for the type
    const titles = titlesByType[type] || ["Blockchain Event"];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    return {
      id: `vbc-${index + 1}`,
      title,
      date,
      time: `${startTime} - ${endTime}`,
      location,
      type,
      attendees,
      isVBC: true,
      description: `Join us for this ${type.toLowerCase()} focused on blockchain technology in Virginia. Organized by the Virginia Blockchain Council.`
    };
  });
}