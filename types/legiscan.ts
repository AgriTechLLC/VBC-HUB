/**
 * Shared TypeScript types for LegiScan API and components
 */

// Bill interface - core type for bill data
export interface Bill {
  bill_id: number;
  bill_number: string;
  title: string;
  description?: string;
  status_id: number;
  progress?: number;
  last_action?: string;
  last_action_date?: string;
  url?: string;
  state_link?: string;
  change_hash?: string;
}

// Detailed Bill with additional fields
export interface DetailedBill extends Bill {
  session_id: number;
  state: string;
  state_id: number;
  bill_type: string;
  bill_type_id: string;
  body: string;
  body_id: number;
  current_body: string;
  current_body_id: number;
  completed: number;
  sponsors?: Sponsor[];
  texts?: BillText[];
  votes?: Vote[];
  amendments?: Amendment[];
  supplements?: Supplement[];
  history?: HistoryEvent[];
  subjects?: Subject[];
  committee?: Committee;
  progress_points?: ProgressPoint[];
}

// Person (legislator) 
export interface Person {
  people_id: number;
  person_hash?: string;
  state_id?: number;
  party_id: string;
  party: string;
  role_id: number;
  role: string;
  name: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  nickname?: string;
  district?: string;
  ftm_eid?: number | string;
  votesmart_id?: number;
  opensecrets_id?: string;
  knowwho_pid?: number;
  ballotpedia?: string;
  committee_sponsor?: number;
  committee_id?: number | string;
}

// Bill Sponsor
export interface Sponsor extends Person {
  sponsor_type_id: number;
  sponsor_order: number;
}

// History Event
export interface HistoryEvent {
  date: string;
  action: string;
  chamber: string;
  chamber_id: number;
  importance: number;
}

// Progress Point
export interface ProgressPoint {
  date: string;
  event: number;
}

// Bill Text
export interface BillText {
  doc_id: number;
  date: string;
  type: string;
  type_id: number | string;
  mime: string;
  mime_id: number;
  url: string;
  state_link: string;
  text_size: number;
  text_hash: string;
  // Base64 encoded document (when applicable)
  doc?: string;
}

// Amendment
export interface Amendment {
  amendment_id: number;
  bill_id?: number;
  adopted: number;
  chamber: string;
  chamber_id: number;
  date: string;
  title: string;
  description: string;
  mime: string;
  mime_id: number;
  url: string;
  state_link: string;
  amendment_size: number;
  amendment_hash: string;
  // Base64 encoded document (when applicable)
  doc?: string;
}

// Supplement
export interface Supplement {
  supplement_id: number;
  bill_id?: number;
  date: string;
  type: string;
  type_id: number;
  title: string;
  description: string;
  mime: string;
  mime_id: number;
  url: string;
  state_link: string;
  supplement_size: number;
  supplement_hash: string;
  // Base64 encoded document (when applicable)
  doc?: string;
}

// Vote
export interface Vote {
  roll_call_id: number;
  date: string;
  desc: string;
  yea: number;
  nay: number;
  nv: number;
  absent: number;
  total: number;
  passed: number;
  chamber: string;
  chamber_id: number;
  url: string;
  state_link: string;
  votes?: VoteDetail[];
}

// Vote Detail
export interface VoteDetail {
  people_id: number;
  vote_id: number;
  vote_text: string;
}

// Subject
export interface Subject {
  subject_id: number;
  subject_name: string;
}

// Committee
export interface Committee {
  committee_id: number;
  chamber: string;
  chamber_id: number;
  name: string;
}

// Session
export interface Session {
  session_id: number;
  state_id: number;
  year_start: number;
  year_end: number;
  prefile: number;
  sine_die: number;
  prior: number;
  special: number;
  session_tag: string;
  session_title: string;
  session_name: string;
  dataset_hash?: string;
}

// Search Result
export interface SearchResult {
  id: number;
  bill_id: number;
  bill_number: string;
  title: string;
  description?: string;
  status_id: number;
  last_action?: string;
  last_action_date?: string;
  url?: string;
  state_link?: string;
  relevance?: number;
}

// Search Response
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  parameters?: {
    state?: string;
    year?: number;
    page?: number;
    sessionId?: number;
  };
}

// Legislative Event
export interface LegislativeEvent {
  event_id: number;
  event_type_id: number;
  event_type: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  bill_id?: number;
  committee_id?: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: boolean;
  message?: string;
  code?: number;
}