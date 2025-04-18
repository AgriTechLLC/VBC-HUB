/**
 * Zod schemas for LegiScan API data validation
 */
import { z } from 'zod';

// Basic bill schema
export const billSchema = z.object({
  bill_id: z.number(),
  bill_number: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status_id: z.number(),
  progress: z.number().optional(),
  last_action: z.string().optional(),
  last_action_date: z.string().optional(),
  url: z.string().url().optional(),
  state_link: z.string().url().optional(),
  change_hash: z.string().optional(),
});

// Progress point schema
export const progressPointSchema = z.object({
  date: z.string(),
  event: z.number(),
});

// History event schema
export const historyEventSchema = z.object({
  date: z.string(),
  action: z.string(),
  chamber: z.string(),
  chamber_id: z.number(),
  importance: z.number(),
});

// Committee schema
export const committeeSchema = z.object({
  committee_id: z.number(),
  chamber: z.string(),
  chamber_id: z.number(),
  name: z.string(),
});

// Subject schema
export const subjectSchema = z.object({
  subject_id: z.number(),
  subject_name: z.string(),
});

// Vote detail schema
export const voteDetailSchema = z.object({
  people_id: z.number(),
  vote_id: z.number(),
  vote_text: z.string(),
});

// Vote schema
export const voteSchema = z.object({
  roll_call_id: z.number(),
  date: z.string(),
  desc: z.string(),
  yea: z.number(),
  nay: z.number(),
  nv: z.number(),
  absent: z.number(),
  total: z.number(),
  passed: z.number(),
  chamber: z.string(),
  chamber_id: z.number(),
  url: z.string(),
  state_link: z.string(),
  votes: z.array(voteDetailSchema).optional(),
});

// Sponsor schema
export const sponsorSchema = z.object({
  people_id: z.number(),
  person_hash: z.string().optional(),
  state_id: z.number().optional(),
  party_id: z.string(),
  party: z.string(),
  role_id: z.number(),
  role: z.string(),
  name: z.string(),
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
  suffix: z.string().optional(),
  nickname: z.string().optional(),
  district: z.string().optional(),
  sponsor_type_id: z.number(),
  sponsor_order: z.number(),
});

// Bill text schema
export const billTextSchema = z.object({
  doc_id: z.number(),
  date: z.string(),
  type: z.string(),
  type_id: z.union([z.number(), z.string()]),
  mime: z.string(),
  mime_id: z.number(),
  url: z.string(),
  state_link: z.string(),
  text_size: z.number(),
  text_hash: z.string(),
  doc: z.string().optional(), // Base64 encoded document
});

// Amendment schema
export const amendmentSchema = z.object({
  amendment_id: z.number(),
  bill_id: z.number().optional(),
  adopted: z.number(),
  chamber: z.string(),
  chamber_id: z.number(),
  date: z.string(),
  title: z.string(),
  description: z.string(),
  mime: z.string(),
  mime_id: z.number(),
  url: z.string(),
  state_link: z.string(),
  amendment_size: z.number(),
  amendment_hash: z.string(),
  doc: z.string().optional(), // Base64 encoded document
});

// Supplement schema
export const supplementSchema = z.object({
  supplement_id: z.number(),
  bill_id: z.number().optional(),
  date: z.string(),
  type: z.string(),
  type_id: z.number(),
  title: z.string(),
  description: z.string(),
  mime: z.string(),
  mime_id: z.number(),
  url: z.string(),
  state_link: z.string(),
  supplement_size: z.number(),
  supplement_hash: z.string(),
  doc: z.string().optional(), // Base64 encoded document
});

// Detailed bill schema
export const detailedBillSchema = billSchema.extend({
  session_id: z.number(),
  state: z.string(),
  state_id: z.number(),
  bill_type: z.string(),
  bill_type_id: z.string(),
  body: z.string(),
  body_id: z.number(),
  current_body: z.string(),
  current_body_id: z.number(),
  completed: z.number(),
  sponsors: z.array(sponsorSchema).optional(),
  texts: z.array(billTextSchema).optional(),
  votes: z.array(voteSchema).optional(),
  amendments: z.array(amendmentSchema).optional(),
  supplements: z.array(supplementSchema).optional(),
  history: z.array(historyEventSchema).optional(),
  subjects: z.array(subjectSchema).optional(),
  committee: committeeSchema.optional(),
  progress_points: z.array(progressPointSchema).optional(),
});

// Person schema
export const personSchema = z.object({
  people_id: z.number(),
  person_hash: z.string().optional(),
  state_id: z.number().optional(),
  party_id: z.string(),
  party: z.string(),
  role_id: z.number(),
  role: z.string(),
  name: z.string(),
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
  suffix: z.string().optional(),
  nickname: z.string().optional(),
  district: z.string().optional(),
  ftm_eid: z.union([z.number(), z.string()]).optional(),
  votesmart_id: z.number().optional(),
  opensecrets_id: z.string().optional(),
  knowwho_pid: z.number().optional(),
  ballotpedia: z.string().optional(),
  committee_sponsor: z.number().optional(),
  committee_id: z.union([z.number(), z.string()]).optional(),
});

// Session schema
export const sessionSchema = z.object({
  session_id: z.number(),
  state_id: z.number(),
  year_start: z.number(),
  year_end: z.number(),
  prefile: z.number(),
  sine_die: z.number(),
  prior: z.number(),
  special: z.number(),
  session_tag: z.string(),
  session_title: z.string(),
  session_name: z.string(),
  dataset_hash: z.string().optional(),
});

// Search result schema
export const searchResultSchema = z.object({
  id: z.number(),
  bill_id: z.number(),
  bill_number: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status_id: z.number(),
  last_action: z.string().optional(),
  last_action_date: z.string().optional(),
  url: z.string().optional(),
  state_link: z.string().optional(),
  relevance: z.number().optional(),
});

// Search response schema
export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  query: z.string(),
  parameters: z.object({
    state: z.string().optional(),
    year: z.number().optional(),
    page: z.number().optional(),
    sessionId: z.number().optional(),
  }).optional(),
});

// Legislative event schema
export const legislativeEventSchema = z.object({
  event_id: z.number(),
  event_type_id: z.number(),
  event_type: z.string(),
  date: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string(),
  bill_id: z.number().optional(),
  committee_id: z.number().optional(),
});

// API response schema (generic)
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.boolean().optional(),
    message: z.string().optional(),
    code: z.number().optional(),
  });

// Main response schemas for API endpoints
export const billsResponseSchema = apiResponseSchema(z.array(billSchema));
export const billDetailResponseSchema = apiResponseSchema(detailedBillSchema);
export const peopleResponseSchema = apiResponseSchema(z.array(personSchema));
export const personResponseSchema = apiResponseSchema(personSchema);
export const sponsorsResponseSchema = apiResponseSchema(z.array(sponsorSchema));
export const eventsResponseSchema = apiResponseSchema(z.array(legislativeEventSchema));
export const searchResponseSchemaWrapper = apiResponseSchema(searchResponseSchema);
export const supplementsResponseSchema = apiResponseSchema(z.array(supplementSchema));
export const votesResponseSchema = apiResponseSchema(z.array(voteSchema));