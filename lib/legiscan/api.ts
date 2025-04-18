/**
 * LegiScan API Client
 * Based on LegiScan API v1.90 documentation
 */

const API_BASE_URL = 'https://api.legiscan.com';

export interface LegiScanApiOptions {
  apiKey: string;
  baseUrl?: string;
  cacheResults?: boolean;
  cacheSeconds?: number;
}

export class LegiScanApi {
  private apiKey: string;
  private baseUrl: string;
  private cacheResults: boolean;
  private cacheSeconds: number;

  constructor(options: LegiScanApiOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.cacheResults = options.cacheResults ?? true;
    this.cacheSeconds = options.cacheSeconds ?? 3600; // Default: 1 hour cache
  }

  /**
   * Execute an API request to LegiScan
   */
  private async request<T>(operation: string, params: Record<string, string | number> = {}): Promise<T> {
    // Build the query string
    const queryParams = new URLSearchParams({
      key: this.apiKey,
      op: operation,
      ...Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    });

    const url = `${this.baseUrl}/?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`LegiScan API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API error response
      if (data.status === 'ERROR') {
        const message = data.alert?.message || 'Unknown error';
        throw new Error(`LegiScan API returned error: ${message}`);
      }

      return data as T;
    } catch (error) {
      console.error('Error fetching from LegiScan API:', error);
      throw error;
    }
  }

  /**
   * Get list of available sessions for a state
   */
  async getSessionList(state?: string) {
    const params: Record<string, string> = {};
    if (state) {
      params.state = state;
    }
    return this.request<LegiScan.SessionListResponse>('getSessionList', params);
  }

  /**
   * Get master list of bills for a session
   */
  async getMasterList(sessionId: number | string) {
    return this.request<LegiScan.MasterListResponse>('getMasterList', { id: sessionId });
  }

  /**
   * Get master list of bills with minimal information for change detection
   */
  async getMasterListRaw(sessionId: number | string) {
    return this.request<LegiScan.MasterListRawResponse>('getMasterListRaw', { id: sessionId });
  }

  /**
   * Get detailed information for a specific bill
   */
  async getBill(billId: number | string) {
    return this.request<LegiScan.BillResponse>('getBill', { id: billId });
  }

  /**
   * Get bill text document
   */
  async getBillText(docId: number | string) {
    return this.request<LegiScan.BillTextResponse>('getBillText', { id: docId });
  }

  /**
   * Get amendment document
   */
  async getAmendment(amendmentId: number | string) {
    return this.request<LegiScan.AmendmentResponse>('getAmendment', { id: amendmentId });
  }

  /**
   * Get supplemental document
   */
  async getSupplement(supplementId: number | string) {
    return this.request<LegiScan.SupplementResponse>('getSupplement', { id: supplementId });
  }

  /**
   * Get roll call vote information
   */
  async getRollCall(rollCallId: number | string) {
    return this.request<LegiScan.RollCallResponse>('getRollCall', { id: rollCallId });
  }

  /**
   * Get legislator information
   */
  async getPerson(peopleId: number | string) {
    return this.request<LegiScan.PersonResponse>('getPerson', { id: peopleId });
  }

  /**
   * Get search results
   */
  async getSearch(options: { state: string, query: string, year?: number | string, page?: number } | { id: number | string, query: string, page?: number }) {
    return this.request<LegiScan.SearchResponse>('getSearch', options as Record<string, string | number>);
  }

  /**
   * Get search results with minimal information for bulk processing
   */
  async getSearchRaw(options: { state: string, query: string, year?: number | string, page?: number } | { id: number | string, query: string, page?: number }) {
    return this.request<LegiScan.SearchRawResponse>('getSearchRaw', options as Record<string, string | number>);
  }

  /**
   * Get session people list
   */
  async getSessionPeople(sessionId: number | string) {
    return this.request<LegiScan.SessionPeopleResponse>('getSessionPeople', { id: sessionId });
  }

  /**
   * Get list of bills sponsored by a person
   */
  async getSponsoredList(peopleId: number | string) {
    return this.request<LegiScan.SponsoredListResponse>('getSponsoredList', { id: peopleId });
  }

  /**
   * Get dataset list 
   */
  async getDatasetList(options: { state?: string; year?: number | string } = {}) {
    return this.request<LegiScan.DatasetListResponse>('getDatasetList', options as Record<string, string | number>);
  }
  
  /**
   * Get dataset
   */
  async getDataset(sessionId: number | string, accessKey: string, format: 'json' | 'csv' = 'json') {
    return this.request<LegiScan.DatasetResponse>('getDataset', { 
      id: sessionId,
      access_key: accessKey,
      format
    });
  }
  
  /**
   * Get monitor list
   */
  async getMonitorList(record: 'current' | 'archived' | string = 'current') {
    return this.request<LegiScan.MonitorListResponse>('getMonitorList', { record });
  }
  
  /**
   * Get monitor list raw for change detection
   */
  async getMonitorListRaw(record: 'current' | 'archived' | string = 'current') {
    return this.request<LegiScan.MonitorListRawResponse>('getMonitorListRaw', { record });
  }
  
  /**
   * Set monitor status for bills
   */
  async setMonitor(options: { 
    list: string; 
    action: 'monitor' | 'remove' | 'set'; 
    stance?: 'watch' | 'support' | 'oppose'
  }) {
    return this.request<LegiScan.SetMonitorResponse>('setMonitor', options as Record<string, string>);
  }
}

export namespace LegiScan {
  // Common response structure
  export interface ApiResponse {
    status: 'OK' | 'ERROR';
    alert?: {
      message: string;
    };
  }

  // Session response
  export interface SessionListResponse extends ApiResponse {
    sessions: Session[];
  }

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
    dataset_hash: string;
  }

  // Master list response
  export interface MasterListResponse extends ApiResponse {
    masterlist: Record<string, MasterListBill>;
  }

  export interface MasterListBill {
    bill_id: number;
    number: string;
    change_hash: string;
    url: string;
    status_date: string;
    status: string;
    last_action_date: string;
    last_action: string;
    title: string;
    description: string;
  }

  // Master list raw response
  export interface MasterListRawResponse extends ApiResponse {
    masterlist: Record<string, MasterListRawBill>;
  }

  export interface MasterListRawBill {
    bill_id: number;
    number: string;
    change_hash: string;
  }

  // Bill response
  export interface BillResponse extends ApiResponse {
    bill: Bill;
  }

  export interface Bill {
    bill_id: number;
    change_hash: string;
    session_id: number;
    session: Session;
    url: string;
    state_link: string;
    completed: number;
    status: number;
    status_date: string;
    progress: Array<{ date: string; event: number }>;
    state: string;
    state_id: number;
    bill_number: string;
    bill_type: string;
    bill_type_id: string;
    body: string;
    body_id: number;
    current_body: string;
    current_body_id: number;
    title: string;
    description: string;
    pending_committee_id: number;
    committee?: {
      committee_id: number;
      chamber: string;
      chamber_id: number;
      name: string;
    };
    referrals: Array<{
      date: string;
      committee_id: number;
      chamber: string;
      chamber_id: number;
      name: string;
    }>;
    history: Array<{
      date: string;
      action: string;
      chamber: string;
      chamber_id: number;
      importance: number;
    }>;
    sponsors: Array<{
      people_id: number;
      person_hash: string;
      party_id: string;
      party: string;
      role_id: number;
      role: string;
      name: string;
      first_name: string;
      middle_name: string;
      last_name: string;
      suffix: string;
      nickname: string;
      district: string;
      ftm_eid: number | string;
      votesmart_id: number;
      opensecrets_id: string;
      knowwho_pid: number;
      ballotpedia: string;
      sponsor_type_id: number;
      sponsor_order: number;
      committee_sponsor: number;
      committee_id: string | number;
    }>;
    sasts?: Array<{
      type_id: number;
      type: string;
      sast_bill_number: string;
      sast_bill_id: number;
    }>;
    subjects?: Array<{
      subject_id: number;
      subject_name: string;
    }>;
    texts: Array<{
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
    }>;
    votes?: Array<{
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
    }>;
    amendments?: Array<{
      amendment_id: number;
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
    }>;
    supplements?: Array<{
      supplement_id: number;
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
    }>;
    calendar?: Array<{
      type_id: number;
      type: string;
      date: string;
      time: string;
      location: string;
      description: string;
    }>;
  }

  // Bill text response
  export interface BillTextResponse extends ApiResponse {
    text: {
      doc_id: number;
      bill_id: number;
      date: string;
      type: string;
      type_id: string | number;
      mime: string;
      mime_id: number;
      text_size: number;
      text_hash: string;
      doc: string; // Base64 encoded text
    };
  }

  // Amendment response
  export interface AmendmentResponse extends ApiResponse {
    amendment: {
      amendment_id: number;
      chamber: string;
      chamber_id: number;
      bill_id: number;
      adopted: number;
      date: string;
      title: string;
      description: string;
      mime: string;
      mime_id: number;
      amendment_size: number;
      amendment_hash: string;
      doc: string; // Base64 encoded text
    };
  }

  // Supplement response
  export interface SupplementResponse extends ApiResponse {
    supplement: {
      supplement_id: number;
      bill_id: number;
      date: string;
      type_id: number;
      type: string;
      title: string;
      description: string;
      mime: string;
      mime_id: number;
      supplement_size: number;
      supplement_hash: string;
      doc: string; // Base64 encoded text
    };
  }

  // Roll call response
  export interface RollCallResponse extends ApiResponse {
    roll_call: {
      roll_call_id: number;
      bill_id: number;
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
      votes: Array<{
        people_id: number;
        vote_id: number;
        vote_text: string;
      }>;
    };
  }

  // Person response
  export interface PersonResponse extends ApiResponse {
    person: {
      people_id: number;
      person_hash: string;
      state_id: number;
      party_id: string;
      party: string;
      role_id: number;
      role: string;
      name: string;
      first_name: string;
      middle_name: string;
      last_name: string;
      suffix: string;
      nickname: string;
      district: string;
      ftm_eid: number | string;
      votesmart_id: number;
      opensecrets_id: string;
      knowwho_pid: number;
      ballotpedia: string;
      committee_sponsor: number;
      committee_id: number;
    };
  }

  // Search response
  export interface SearchResponse extends ApiResponse {
    searchresult: {
      summary: {
        page: string;
        range: string;
        relevancy: string;
        count: number;
        page_current: number;
        page_total: number;
      };
      [key: string]: any; // Dynamic bill search results
    };
  }

  // Search raw response
  export interface SearchRawResponse extends ApiResponse {
    searchresult: {
      summary: {
        page: string;
        range: string;
        relevancy: string;
        count: number;
        page_current: number;
        page_total: number;
      };
      [key: string]: any; // Dynamic bill search results
    };
  }

  // Session people response
  export interface SessionPeopleResponse extends ApiResponse {
    sessionpeople: {
      session: Session;
      people: Array<{
        people_id: number;
        person_hash: string;
        state_id: number;
        party_id: string;
        party: string;
        role_id: number;
        role: string;
        name: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string;
        nickname: string;
        district: string;
        ftm_eid: string | number;
        votesmart_id: number;
        opensecrets_id: string;
        ballotpedia: string;
        committee_sponsor: number;
        committee_id: number;
      }>;
    };
  }

  // Sponsored list response
  export interface SponsoredListResponse extends ApiResponse {
    sponsoredbills: {
      sponsor: {
        people_id: number;
        person_hash: string;
        state_id: number;
        party_id: string;
        party: string;
        role_id: number;
        role: string;
        name: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string;
        nickname: string;
        district: string;
        ftm_eid: string | number;
        votesmart_id: number;
        opensecrets_id: string;
        knowwho_pid: number;
        ballotpedia: string;
        committee_sponsor: number;
        committee_id: number | string;
      };
      sessions: Array<{
        session_id: number;
        session_name: string;
      }>;
      bills: Array<{
        session_id: number;
        bill_id: number;
        number: string;
      }>;
    };
  }
  
  // Dataset list response
  export interface DatasetListResponse extends ApiResponse {
    datasetlist: Array<{
      state_id: number;
      session_id: number;
      special: number;
      year_start: number;
      year_end: number;
      session_name: string;
      session_title: string;
      dataset_hash: string;
      dataset_date: string;
      dataset_size: number;
      access_key: string;
    }>;
  }
  
  // Dataset response
  export interface DatasetResponse extends ApiResponse {
    dataset: {
      state_id: number;
      session_id: number;
      session_name: string;
      dataset_hash: string;
      dataset_date: string;
      dataset_size: number;
      mime: string;
      zip: string; // Base64 encoded ZIP archive
    };
  }
  
  // Monitor list response
  export interface MonitorListResponse extends ApiResponse {
    monitorlist: Record<string, {
      bill_id: number;
      state: string;
      number: string;
      stance: number;
      change_hash: string;
      url: string;
      status_date: string;
      status: number;
      last_action_date: string;
      last_action: string;
      title: string;
      description: string;
    }>;
  }
  
  // Monitor list raw response
  export interface MonitorListRawResponse extends ApiResponse {
    monitorlist: Record<string, {
      bill_id: number;
      state: string;
      number: string;
      stance: number;
      change_hash: string;
      status: number;
    }>;
  }
  
  // Set monitor response
  export interface SetMonitorResponse extends ApiResponse {
    return: Record<string, string>;
  }
}

// Constants for the static values mentioned in the documentation
export const BillTypes = {
  BILL: 1,
  RESOLUTION: 2,
  CONCURRENT_RESOLUTION: 3,
  JOINT_RESOLUTION: 4,
  JOINT_RESOLUTION_CONST_AMENDMENT: 5,
  EXECUTIVE_ORDER: 6,
  CONSTITUTIONAL_AMENDMENT: 7,
  MEMORIAL: 8,
  CLAIM: 9,
  COMMENDATION: 10,
  COMMITTEE_STUDY_REQUEST: 11,
  JOINT_MEMORIAL: 12,
  PROCLAMATION: 13,
  STUDY_REQUEST: 14,
  ADDRESS: 15,
  CONCURRENT_MEMORIAL: 16,
  INITIATIVE: 17,
  PETITION: 18,
  STUDY_BILL: 19,
  INITIATIVE_PETITION: 20,
  REPEAL_BILL: 21,
  REMONSTRATION: 22,
  COMMITTEE_BILL: 23
};

export const EventTypes = {
  HEARING: 1,
  EXECUTIVE_SESSION: 2,
  MARKUP_SESSION: 3
};

export const MimeTypes = {
  HTML: 1,
  PDF: 2,
  WORDPERFECT: 3,
  MS_WORD: 4,
  RTF: 5,
  MS_WORD_2007: 6
};

export const PoliticalParty = {
  DEMOCRAT: 1,
  REPUBLICAN: 2,
  INDEPENDENT: 3,
  GREEN_PARTY: 4,
  LIBERTARIAN: 5,
  NONPARTISAN: 6
};

export const Roles = {
  REPRESENTATIVE: 1,
  SENATOR: 2,
  JOINT_CONFERENCE: 3
};

export const SastTypes = {
  SAME_AS: 1,
  SIMILAR_TO: 2,
  REPLACED_BY: 3,
  REPLACES: 4,
  CROSS_FILED: 5,
  ENABLING_FOR: 6,
  ENABLED_BY: 7,
  RELATED: 8,
  CARRY_OVER: 9
};

export const SponsorTypes = {
  SPONSOR: 0,
  PRIMARY_SPONSOR: 1,
  CO_SPONSOR: 2,
  JOINT_SPONSOR: 3
};

export const Stance = {
  WATCH: 0,
  SUPPORT: 1,
  OPPOSE: 2
};

export const Status = {
  NA: 0,
  INTRODUCED: 1,
  ENGROSSED: 2,
  ENROLLED: 3,
  PASSED: 4,
  VETOED: 5,
  FAILED: 6,
  OVERRIDE: 7,
  CHAPTERED: 8,
  REFER: 9,
  REPORT_PASS: 10,
  REPORT_DNP: 11,
  DRAFT: 12
};

export const SupplementTypes = {
  FISCAL_NOTE: 1,
  ANALYSIS: 2,
  FISCAL_NOTE_ANALYSIS: 3,
  VOTE_IMAGE: 4,
  LOCAL_MANDATE: 5,
  CORRECTIONS_IMPACT: 6,
  MISCELLANEOUS: 7,
  VETO_LETTER: 8
};

export const TextTypes = {
  INTRODUCED: 1,
  COMMITTEE_SUBSTITUTE: 2,
  AMENDED: 3,
  ENGROSSED: 4,
  ENROLLED: 5,
  CHAPTERED: 6,
  FISCAL_NOTE: 7,
  ANALYSIS: 8,
  DRAFT: 9,
  CONFERENCE_SUBSTITUTE: 10,
  PREFILED: 11,
  VETO_MESSAGE: 12,
  VETO_RESPONSE: 13,
  SUBSTITUTE: 14
};

export const Votes = {
  YEA: 1,
  NAY: 2,
  NOT_VOTING: 3,
  ABSENT: 4
};