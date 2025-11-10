# Getting Started: Frontend Application

## 🎯 Overview

This is the **frontend repository** for the Zapier Triggers API.

- **Frontend**: Next.js dashboard for visualizing and managing events
- **Backend**: Separate repository at https://github.com/Davaakhatan/zapier-trigger-api-backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Backend API running (or use deployed API)

### Run Frontend Locally

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

**Frontend will be available at:**
- Dashboard: http://localhost:3000

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

## 📝 Testing the Application

### 1. View Events in Frontend

1. Open http://localhost:3000
2. Click on "Inbox" tab
3. View pending events from the backend API

### 2. Acknowledge an Event

- Click on an event in the inbox
- Click "Acknowledge" button
- The event will be removed from the pending list

### 3. Create Events

Use the backend API to create events (see backend repository documentation).

## 🎨 Frontend Features

- **Dashboard**: Overview with stats
- **Inbox**: View and manage pending events (connected to backend API)
- **API Docs**: Integration documentation
- **Real-time**: Auto-refreshes every 30 seconds

## 🔍 Important Notes

- **Backend is PRD-compliant**: The Python FastAPI backend matches all PRD requirements
- **Frontend is optional**: The PRD doesn't require a frontend, but it's useful for visualization
- **Frontend connects to backend**: All data comes from the Python FastAPI API

## 🎨 Frontend Features

- **Dashboard**: Overview with stats
- **Inbox**: View and manage pending events (connected to backend API)
- **API Docs**: Integration documentation
- **Real-time**: Auto-refreshes every 30 seconds

## 🔗 Backend Connection

This frontend connects to the backend API. The backend is in a separate repository:
- **Backend Repo**: https://github.com/Davaakhatan/zapier-trigger-api-backend
- **API Endpoint**: https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod

## ✅ What's Working

- ✅ Frontend Dashboard (Next.js)
- ✅ Event retrieval and acknowledgment
- ✅ Real-time updates
- ✅ Connected to backend API

## 🚀 Deployment

See [FRONTEND_DEPLOYMENT.md](FRONTEND_DEPLOYMENT.md) for deployment to AWS Amplify.

## 🎉 You're All Set!

Your frontend is ready to use!

