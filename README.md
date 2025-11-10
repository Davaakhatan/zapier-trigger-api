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

- **Dashboard**: Overview with stats
- **Inbox**: View and manage pending events
- **API Docs**: Integration documentation
- **Real-time**: Auto-refreshes every 30 seconds

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
- ✅ Event inbox component
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
