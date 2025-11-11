# Getting Started: Zapier Triggers API Frontend

## 🎯 Overview

This is the **frontend repository** for the Zapier Triggers API - a Next.js dashboard for visualizing and managing events.

- **Frontend**: Next.js dashboard with enhanced analytics
- **Backend**: Separate repository at https://github.com/Davaakhatan/zapier-trigger-api-backend
- **API Endpoint**: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Backend API running (or use deployed API)

### Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure API endpoint** (optional)
   
   Create `.env.local` in project root:
   ```env
   # Use deployed API (recommended for testing UI)
   NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
   
   # OR use local backend (if running locally)
   # NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
   
   **Note**: If no `.env.local` exists, defaults to `http://localhost:8000`

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Access the application**
   - Frontend Dashboard: http://localhost:3000

---

## 🎨 Features

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

---

## 🧪 Testing Locally

### Option 1: Frontend Only (Using Deployed Backend)

Easiest way to test the frontend with real data:

```bash
# Create .env.local pointing to deployed API
echo "NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod" > .env.local

# Start frontend
pnpm dev
```

**Note**: Local development won't show real data unless connected to deployed backend or local backend is running.

### Option 2: Full Stack (Frontend + Backend Locally)

If you want to run both frontend and backend locally:

1. **Start Backend** (in backend repository):
   ```bash
   cd ../zapier-trigger-api-backend
   # Follow backend setup instructions
   # Backend should run on http://localhost:8000
   ```

2. **Start Frontend**:
   ```bash
   # Create .env.local to use local backend
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   
   # Start frontend
   pnpm dev
   ```

### Create Test Events

Create events using the backend API:

```bash
curl -X POST https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": "data",
      "value": 123
    },
    "source": "test-source",
    "tags": ["test", "demo"]
  }'
```

---

## 🔧 Troubleshooting

### Frontend won't start

```bash
# Make sure dependencies are installed
pnpm install

# Clear Next.js cache
rm -rf .next

# Try again
pnpm dev
```

### Can't connect to backend

1. **Check API URL**:
   - Default: `http://localhost:8000` (local)
   - Or: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod` (deployed)

2. **Check `.env.local`**:
   ```bash
   cat .env.local
   # Should show: NEXT_PUBLIC_API_URL=...
   ```

3. **Check browser console** for CORS errors

### No events showing

1. Create some events using the API (see above)
2. Refresh the inbox
3. Check browser console for errors

---

## 📝 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

---

## 🚀 Deployment

See [FRONTEND_DEPLOYMENT.md](FRONTEND_DEPLOYMENT.md) for AWS Amplify deployment guide.

**Quick Steps:**
1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

---

## 📚 Documentation

- **[FRONTEND_DEPLOYMENT.md](FRONTEND_DEPLOYMENT.md)**: AWS Amplify deployment guide
- **[REPOSITORIES.md](REPOSITORIES.md)**: Repository structure and workflow
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture
- **[PRD.md](PRD.md)**: Product Requirements Document

---

## ✅ What's Working

- ✅ Enhanced Dashboard with charts and analytics
- ✅ Event inbox with search, filter, and bulk operations
- ✅ Event timeline view
- ✅ API key management
- ✅ Real-time updates
- ✅ Connected to backend API
- ✅ AWS Amplify deployment ready

---

**Backend Repository**: https://github.com/Davaakhatan/zapier-trigger-api-backend  
**API Endpoint**: https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
