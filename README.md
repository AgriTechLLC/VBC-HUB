# VBC-HUB

Virginia Blockchain Council (VBC) Hub is a centralized platform for blockchain news, legislative updates, and events in Virginia.

## Features

- **News Ticker**: Real-time updates on blockchain news in Virginia
- **Legislation Tracker**: Monitor blockchain-related bills using LegiScan API
- **Events Grid**: Stay informed about upcoming blockchain events and meetups
- **Resources**: Access to white papers, job board, and member portal

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

- In-memory caching of API responses (can be replaced with Redis in production)
- Tracking of monthly API usage
- Only fetching details for bills that have changed
- Environment variables for configuring cache duration

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

- `LEGISCAN_KEY`: Your LegiScan API key (required)
- `CACHE_TTL`: Cache duration in milliseconds (default: 3600000 - 1 hour)
- `VA_SESSION_ID`: Override for Virginia legislative session ID (optional)
- `USE_REAL_API`: Set to 'true' to use real API in development (default: false)
- `CRON_SECRET`: Secret token for securing the refresh endpoint (production only)

## Deployment

For production deployment on Vercel:

1. Add all environment variables to your Vercel project
2. Configure a Vercel Cron job to hit `/api/refreshBills` hourly:
   ```
   vercel cron add "0 * * * *" api/refreshBills
   ```

## Testing

Run the test suite:

```
npm test
```

## License

This project is proprietary to the Virginia Blockchain Council.