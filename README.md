# Zapier Triggers API - Frontend

Next.js frontend dashboard for the Zapier Triggers API.

## Overview

This is the **frontend repository** for visualizing and managing events from the Zapier Triggers API. The backend API is in a separate repository.

**Backend Repository**: https://github.com/Davaakhatan/zapier-trigger-api-backend

## Project Structure

```
.
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/           # React components
│   ├── ui/              # UI components
│   ├── event-inbox.tsx  # Event inbox component
│   ├── api-documentation.tsx
│   └── ...
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── docs/                 # Documentation
│   ├── FRONTEND_DEPLOYMENT.md
│   └── ...
├── amplify.yml          # AWS Amplify build config
└── package.json         # Dependencies
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Backend API running (or use deployed API)

### Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Run development server**
   ```bash
   pnpm dev
   ```

3. **Access the application**
   - Frontend Dashboard: http://localhost:3000

### Configure API Endpoint

The frontend connects to the backend API. By default, it uses:
- Local development: `http://localhost:8000`
- Production: Set via `NEXT_PUBLIC_API_URL` environment variable

To use a different backend URL, create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Or use the deployed API:
```env
NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

## Features

### Dashboard
- **Quick Stats**: Total, Pending, Acknowledged events, API Status
- **Event Trends Chart**: 24-hour timeline visualization
- **Event Sources Breakdown**: Pie chart showing events by source
- **Performance Metrics**: Response time, success rate, events per minute
- **Rate Limiting Indicators**: Real-time API usage monitoring
- **Recent Activity Feed**: Live event activity stream

### Inbox
- View and manage pending events
- Search and filter events
- Bulk operations (select multiple, acknowledge all)
- Export events (JSON/CSV)
- Real-time auto-refresh (every 30 seconds)

### Timeline
- Chronological view of all events
- Visual timeline with time periods
- Event details modal

### API Documentation
- Interactive API reference
- Integration examples
- Endpoint documentation

### Settings
- API Key Management
- Create, view, copy, and revoke API keys
- Rate limit information

## Documentation

- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)**: Quick start guide
- **[docs/FRONTEND_DEPLOYMENT.md](docs/FRONTEND_DEPLOYMENT.md)**: AWS Amplify deployment guide
- **[docs/REPOSITORIES.md](docs/REPOSITORIES.md)**: Repository structure and workflow
- **[docs/PRD.md](docs/PRD.md)**: Product Requirements Document
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture

## Deployment

### AWS Amplify

Deploy to AWS Amplify using the guide:
- **[docs/FRONTEND_DEPLOYMENT.md](docs/FRONTEND_DEPLOYMENT.md)**

**Quick Steps:**
1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

## API Connection

This frontend connects to the backend API:

**API Endpoint:**
```
https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

**Backend Repository:**
```
https://github.com/Davaakhatan/zapier-trigger-api-backend
```

## Development

### Available Scripts

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Project Status

- ✅ Next.js frontend implemented
- ✅ Enhanced dashboard with charts and analytics
- ✅ Event inbox with search, filter, and bulk operations
- ✅ Event timeline view
- ✅ API key management
- ✅ API client integration
- ✅ Real-time updates
- ✅ AWS Amplify deployment ready

## Contributing

1. Read the [memory-bank](memory-bank/) documentation
2. Follow coding standards
3. Update documentation as needed

## License

[To be determined]

## Contact

**Organization**: Zapier  
**Project ID**: K1oUUDeoZrvJkVZafqHL_1761943818847
