# VBC-HUB

Virginia Blockchain Council (VBC) Hub is a centralized platform for blockchain news, legislative updates, and events in Virginia.

## Features

- **News Ticker**: Real-time updates on blockchain news in Virginia
- **Legislation Tracker**: Monitor blockchain-related bills using LegiScan API
- **Events Grid**: Stay informed about upcoming blockchain events and meetups
- **Resources**: Access to white papers, job board, and member portal
- **VBC-GPT**: AI assistant that can answer questions about Virginia blockchain legislation

## LegiScan API Integration

The VBC Hub uses the LegiScan API to track blockchain-related legislation in Virginia. This integration provides up-to-date information on bills, including:

- Current status and progress
- Latest actions and amendments
- Direct links to full bill text

### Implementation Details

- **API Utilities**: `/lib/legiscan.ts` contains utility functions for interacting with the LegiScan API
- **Data Fetching**: API routes in `/app/api/bills` handle fetching and caching bill data
- **Bill Detail Pages**: View detailed information about each bill at `/bills/[id]`
- **Hourly Updates**: Cron job at `/api/refreshBills` handles automatic updates

### Bill Updates

The system checks for bill updates hourly using LegiScan's change hash feature:

1. Retrieve the master list of bills from the current Virginia legislative session
2. Compare change hashes to detect updated bills
3. Fetch detailed information for changed bills
4. Update the UI to highlight recent changes

### Caching & Quota Management

To stay within LegiScan's API quota limits:

- Redis-based caching of API responses with in-memory fallback
- Persistent monthly quota tracking with automatic alerts
- Only fetching details for bills that have changed
- Configurable cache duration with TTL for automatic invalidation

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
| `LEGISCAN_KEY` | LegiScan API key | Yes | - |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Yes (prod) | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | Yes (prod) | - |
| `CRON_SECRET` | Secret for protecting the refresh endpoint | Yes (prod) | - |
| `ALERT_WEBHOOK_URL` | Slack/Discord webhook for quota alerts | No | - |
| `CACHE_TTL` | Cache duration in milliseconds | No | 3600000 (1 hour) |
| `USE_REAL_API` | Use real API in development | No | false |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the application | No | http://localhost:3000 |
| `NEXT_PUBLIC_SHOW_API_STATUS` | Show API status badge in UI | No | false |
| `OPENAI_API_KEY` | OpenAI API key for VBC-GPT | Yes (for AI) | - |
| `OPENAI_MODEL` | OpenAI model to use | No | gpt-4o-mini |
| `EMBED_CHUNK_TOKENS` | Token size for text chunks | No | 900 |

## Deployment

For production deployment on Vercel:

1. Add all environment variables to your Vercel project
2. Set up Redis from the Vercel marketplace (Upstash)
3. Configure a Vercel Cron job to hit `/api/refreshBills` hourly with the authorization header:
   ```
   vercel cron add "0 * * * *" api/refreshBills -H "authorization=Bearer $CRON_SECRET"
   ```
4. For the VBC-GPT functionality:
   - Ensure OPENAI_API_KEY is set in Vercel environment variables
   - Verify Redis has vector search capabilities enabled (Upstash Redis Vector)

## Testing

Run the test suite:

```
npm test
```

The CI pipeline runs automatically on push and pull requests via GitHub Actions, testing:
- Linting
- Type checking
- Unit and integration tests

## License

This project is proprietary to the Virginia Blockchain Council.