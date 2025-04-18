# VBC-HUB

Virginia Blockchain Council (VBC) Hub is a centralized platform for blockchain news, legislative updates, and events in Virginia.

## Features

- **News Ticker**: Real-time updates on blockchain news in Virginia
- **Legislation Tracker**: Monitor blockchain-related bills using LegiScan API
- **Events Grid**: Stay informed about upcoming blockchain events and meetups
- **Bill Timeline Visualization**: Track the progress of bills through the legislative process
- **Vote Visualization**: See how legislators voted on blockchain bills with party breakdowns
- **Bill Comparison**: Compare different versions of bills and see amendments
- **AI Bill Summaries**: Get easy-to-understand summaries of complex legislation
- **VBC-GPT**: AI assistant that can answer questions about Virginia blockchain legislation

## LegiScan API Integration

The VBC Hub uses the LegiScan API to track blockchain-related legislation in Virginia. This integration provides up-to-date information on bills, including:

- Current status and progress
- Latest actions and amendments
- Full bill text and document access
- Roll call votes with detailed breakdowns
- Calendar events and hearing schedules

### Implementation Details

- **API Client**: `/lib/legiscan/api.ts` provides a comprehensive TypeScript client for the LegiScan API v1.90
- **Server Wrapper**: `/lib/legiscan/server.ts` adds server-side caching and Virginia-specific utilities
- **Client Utilities**: `/lib/legiscan/client.ts` contains presentation helpers for bill data
- **API Routes**: Enhanced routes in `/app/api/*` provide formatted data for the frontend
- **Bill Detail Pages**: Comprehensive bill information at `/bills/[id]` with timeline and vote visualizations
- **Bill Search**: Full text search capabilities for finding relevant legislation
- **Events Integration**: Legislative calendar events combined with VBC events

### Bill Updates

The system checks for bill updates using LegiScan's change hash feature:

1. Retrieve the master list of bills from the current Virginia legislative session
2. Compare change hashes to detect updated bills
3. Fetch detailed information for changed bills
4. Update the UI to highlight recent changes
5. Generate AI-powered summaries for updated bills

### Caching & Quota Management

To stay within LegiScan's API quota limits:

- Vercel KV-based caching with tiered TTLs based on data type:
  - Session data: 1 day
  - Master bill lists: 1 hour
  - Bill details: 12 hours
  - Bill text: 30 days (static content)
  - Roll call votes: 7 days (static content)
- In-memory fallback cache for development
- Only fetching details for bills that have changed
- Parallel processing of searches and bill fetching

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
4. Add your LegiScan API key to `.env.local`
5. Run the development server:
   ```
   npm run dev
   ```

## Configuration

The following environment variables can be configured:

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| `LEGISCAN_API_KEY` | LegiScan API key | Yes | - |
| `CACHE_ENABLED` | Enable KV caching | No | true |
| `CACHE_TTL` | Base cache duration in seconds | No | 3600 (1 hour) |
| `VERCEL_KV_URL` | Vercel KV URL | Yes (prod) | - |
| `VERCEL_KV_TOKEN` | Vercel KV auth token | Yes (prod) | - |
| `USE_REAL_API` | Use real API in development | No | false |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the application | No | http://localhost:3000 |
| `OPENAI_API_KEY` | OpenAI API key for bill summaries and VBC-GPT | Yes (for AI) | - |
| `OPENAI_MODEL` | OpenAI model to use | No | gpt-4o-mini |

## API Endpoints

The VBC Hub provides the following API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/bills` | List all blockchain-related bills |
| `/api/bills/[id]` | Get detailed information for a bill |
| `/api/bills/[id]/votes` | Get voting data with party breakdown |
| `/api/bills/[id]/summary` | Get AI-generated summary of bill text |
| `/api/bills/[id]/diff` | Get HTML diff between bill versions |
| `/api/bills/search` | Search for bills by keyword |
| `/api/events` | Get combined legislative and VBC events |

## Deployment

For production deployment on Vercel:

1. Add all environment variables to your Vercel project
2. Set up Vercel KV for Redis caching
3. For the AI bill summaries and VBC-GPT functionality:
   - Ensure OPENAI_API_KEY is set in Vercel environment variables

## Testing

Run the test suite:

```
npm test
```

Run typechecking:

```
npm run typecheck
```

## License

This project is proprietary to the Virginia Blockchain Council.