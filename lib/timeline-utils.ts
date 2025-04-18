import { format, parseISO, isValid, compareAsc } from 'date-fns';
import { getBillStatusDescription } from './legiscan-redis';

// Timeline event type for bills
export interface BillTimelineEvent {
  date: Date;
  title: string;
  description: string;
  statusId?: number;
  type: 'introduction' | 'committee' | 'amendment' | 'vote' | 'passage' | 'signed' | 'other';
  completed: boolean;
}

// Timeline data structure for Recharts
export interface TimelineChartData {
  date: number; // timestamp for sorting
  formattedDate: string; // formatted date for display
  eventTitle: string;
  eventDescription: string;
  statusId?: number;
  type: string;
  completed: boolean;
}

/**
 * Extract timeline events from bill data
 * 
 * @param bill - The bill data object
 * @returns Array of timeline events ordered by date
 */
export function extractBillTimelineEvents(bill: any): BillTimelineEvent[] {
  const events: BillTimelineEvent[] = [];
  
  // Add introduction date
  if (bill.date_introduced) {
    events.push({
      date: parseISO(bill.date_introduced),
      title: 'Introduced',
      description: `Bill ${bill.bill_number} introduced`,
      statusId: 1,
      type: 'introduction',
      completed: true
    });
  }
  
  // Add committee referrals
  if (bill.committee && bill.committee.date_referred) {
    events.push({
      date: parseISO(bill.committee.date_referred),
      title: 'Referred to Committee',
      description: `Referred to ${bill.committee.name}`,
      statusId: 8,
      type: 'committee',
      completed: true
    });
  }
  
  // Add committee hearings if available
  if (bill.committee && bill.committee.hearings && bill.committee.hearings.length > 0) {
    bill.committee.hearings.forEach((hearing: any) => {
      if (hearing.date) {
        events.push({
          date: parseISO(hearing.date),
          title: 'Committee Hearing',
          description: hearing.description || `Hearing in ${bill.committee.name}`,
          statusId: 11,
          type: 'committee',
          completed: new Date(hearing.date) <= new Date()
        });
      }
    });
  }
  
  // Add amendments
  if (bill.amendments && bill.amendments.length > 0) {
    bill.amendments.forEach((amendment: any) => {
      if (amendment.date) {
        events.push({
          date: parseISO(amendment.date),
          title: `Amendment ${amendment.amendment_label}`,
          description: amendment.description || 'Bill amended',
          statusId: 10,
          type: 'amendment',
          completed: true
        });
      }
    });
  }
  
  // Add votes
  if (bill.votes && bill.votes.length > 0) {
    bill.votes.forEach((vote: any) => {
      if (vote.date) {
        events.push({
          date: parseISO(vote.date),
          title: `Vote: ${vote.chamber}`,
          description: `Result: ${vote.passed ? 'Passed' : 'Failed'} (${vote.yea}-${vote.nay})`,
          statusId: vote.passed ? 4 : 6,
          type: 'vote',
          completed: true
        });
      }
    });
  }
  
  // Add passage date if available
  if (bill.date_passed) {
    events.push({
      date: parseISO(bill.date_passed),
      title: 'Passed Legislature',
      description: 'Bill passed both chambers',
      statusId: 4,
      type: 'passage',
      completed: true
    });
  }
  
  // Add governor action
  if (bill.date_signed) {
    events.push({
      date: parseISO(bill.date_signed),
      title: 'Signed Into Law',
      description: bill.governor_action || 'Bill signed by governor',
      type: 'signed',
      completed: true
    });
  }
  
  // Add latest action if it doesn't match any of the above events
  if (bill.last_action && bill.last_action_date) {
    const lastActionDate = parseISO(bill.last_action_date);
    const eventExists = events.some(event => 
      event.date.getTime() === lastActionDate.getTime() && 
      event.description === bill.last_action
    );
    
    if (!eventExists) {
      events.push({
        date: lastActionDate,
        title: getBillStatusDescription(bill.status_id) || 'Action',
        description: bill.last_action,
        statusId: bill.status_id,
        type: 'other',
        completed: true
      });
    }
  }
  
  // Sort events chronologically
  return events
    .filter(event => isValid(event.date))
    .sort((a, b) => compareAsc(a.date, b.date));
}

/**
 * Format timeline events for use with Recharts
 * 
 * @param events - Array of timeline events
 * @returns Formatted data for Recharts timeline visualization
 */
export function formatForRechartsTimeline(events: BillTimelineEvent[]): TimelineChartData[] {
  return events.map(event => ({
    date: event.date.getTime(),
    formattedDate: format(event.date, 'MMM d, yyyy'),
    eventTitle: event.title,
    eventDescription: event.description,
    statusId: event.statusId,
    type: event.type,
    completed: event.completed
  }));
}

/**
 * Get a color for the timeline event based on event type and status
 * 
 * @param event - Timeline event data
 * @returns Tailwind color class or hex color code
 */
export function getTimelineEventColor(event: BillTimelineEvent | TimelineChartData): string {
  if (!event.completed) {
    return '#9CA3AF'; // gray-400
  }
  
  const colorMap: Record<string, string> = {
    introduction: '#3B82F6', // blue-500
    committee: '#F59E0B',    // amber-500
    amendment: '#8B5CF6',    // violet-500
    vote: '#10B981',         // emerald-500
    passage: '#059669',      // green-600
    signed: '#047857',       // green-700
    other: '#6B7280'         // gray-500
  };
  
  return colorMap[event.type] || '#6B7280';
}

/**
 * Generate future milestone dates based on bill status and introduction date
 * 
 * @param bill - The bill data
 * @returns Array including past and predicted future timeline events
 */
export function generatePredictedTimeline(bill: any): BillTimelineEvent[] {
  const events = extractBillTimelineEvents(bill);
  
  // Skip prediction if bill is already passed or dead
  if (bill.status_id === 4 || bill.status_id === 5 || bill.status_id === 6) {
    return events;
  }
  
  // Get current status and introduction date
  const currentStatusId = bill.status_id;
  const introDate = bill.date_introduced ? parseISO(bill.date_introduced) : new Date();
  const today = new Date();
  
  // Add predicted committee hearing if in committee and no hearing yet
  if (currentStatusId <= 7 && !events.some(e => e.type === 'committee' && e.title.includes('Hearing'))) {
    // Predict hearing 2 weeks from introduction or 1 week from today, whichever is later
    const predictedHearingDate = new Date(Math.max(
      introDate.getTime() + 14 * 24 * 60 * 60 * 1000,
      today.getTime() + 7 * 24 * 60 * 60 * 1000
    ));
    
    events.push({
      date: predictedHearingDate,
      title: 'Predicted Committee Hearing',
      description: 'Based on typical legislative timeline',
      statusId: 11,
      type: 'committee',
      completed: false
    });
  }
  
  // Add predicted floor vote if not yet voted and past committee stage
  if (currentStatusId >= 7 && currentStatusId < 13 && !events.some(e => e.type === 'vote')) {
    // Predict floor vote 4 weeks from introduction or 2 weeks from today, whichever is later
    const predictedVoteDate = new Date(Math.max(
      introDate.getTime() + 28 * 24 * 60 * 60 * 1000,
      today.getTime() + 14 * 24 * 60 * 60 * 1000
    ));
    
    events.push({
      date: predictedVoteDate,
      title: 'Predicted Floor Vote',
      description: 'Based on typical legislative timeline',
      statusId: 13,
      type: 'vote',
      completed: false
    });
  }
  
  // Add predicted passage date if not yet passed
  if (currentStatusId < 4 && !events.some(e => e.type === 'passage')) {
    // Predict passage 6 weeks from introduction or 3 weeks from today, whichever is later
    const predictedPassageDate = new Date(Math.max(
      introDate.getTime() + 42 * 24 * 60 * 60 * 1000,
      today.getTime() + 21 * 24 * 60 * 60 * 1000
    ));
    
    events.push({
      date: predictedPassageDate,
      title: 'Predicted Passage',
      description: 'Based on typical legislative timeline',
      statusId: 4,
      type: 'passage',
      completed: false
    });
  }
  
  // Add predicted signing if not yet signed
  if (!events.some(e => e.type === 'signed')) {
    // Find latest event date
    const latestEvent = events.reduce((latest, event) => 
      event.completed && event.date > latest.date ? event : latest, 
      { date: introDate } as BillTimelineEvent
    );
    
    // Predict signing 2 weeks after latest event or 1 week from today, whichever is later
    const predictedSigningDate = new Date(Math.max(
      latestEvent.date.getTime() + 14 * 24 * 60 * 60 * 1000,
      today.getTime() + 7 * 24 * 60 * 60 * 1000
    ));
    
    events.push({
      date: predictedSigningDate,
      title: 'Predicted Signing',
      description: 'Based on typical legislative timeline',
      type: 'signed',
      completed: false
    });
  }
  
  // Sort all events chronologically
  return events
    .filter(event => isValid(event.date))
    .sort((a, b) => compareAsc(a.date, b.date));
}

/**
 * Calculate days remaining until next milestone
 * 
 * @param events - Array of timeline events
 * @returns Number of days until next milestone or null if no future events
 */
export function getDaysUntilNextMilestone(events: BillTimelineEvent[]): number | null {
  const today = new Date();
  
  // Find the next uncompleted event
  const nextEvent = events.find(event => !event.completed && event.date > today);
  
  if (!nextEvent) {
    return null;
  }
  
  // Calculate days difference
  const diffTime = Math.abs(nextEvent.date.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}