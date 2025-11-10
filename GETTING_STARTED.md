# Getting Started: Full Stack Application

## 🎯 Overview

This project consists of:
- **Backend**: Python FastAPI REST API (required by PRD)
- **Frontend**: Next.js dashboard (optional, for visualization)

## 🚀 Quick Start

### Terminal 1: Backend (Python FastAPI)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

### Terminal 2: Frontend (Next.js)

```bash
# From project root
pnpm install
pnpm dev
```

**Frontend will be available at:**
- Dashboard: http://localhost:3000

## 📝 Testing the Integration

### 1. Create an Event (via API)

```bash
curl -X POST "http://localhost:8000/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "orderId": "12345",
      "amount": 299.99,
      "customer": "John Doe"
    },
    "source": "payment-system",
    "tags": ["order", "payment"]
  }'
```

### 2. View Events in Frontend

1. Open http://localhost:3000
2. Click on "Inbox" tab
3. You should see the event you just created!

### 3. Acknowledge an Event

- Click on an event in the inbox
- Click "Acknowledge" button
- The event will be removed from the pending list

## 🎨 Frontend Features

- **Dashboard**: Overview with stats
- **Inbox**: View and manage pending events (connected to backend API)
- **API Docs**: Integration documentation
- **Real-time**: Auto-refreshes every 30 seconds

## 🔍 Important Notes

- **Backend is PRD-compliant**: The Python FastAPI backend matches all PRD requirements
- **Frontend is optional**: The PRD doesn't require a frontend, but it's useful for visualization
- **Frontend connects to backend**: All data comes from the Python FastAPI API

## 🔧 Configuration

### Backend

Create `backend/.env` (optional):
```env
DEBUG=true
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=zapier-triggers-events
```

### Frontend

The frontend automatically connects to `http://localhost:8000` by default.

To use a different backend URL, create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ✅ What's Working

- ✅ Backend API (Python FastAPI) - PRD compliant
- ✅ Frontend Dashboard (Next.js) - Connected to backend
- ✅ Event ingestion, retrieval, and acknowledgment
- ✅ Real-time updates

## 🎉 You're All Set!

Both frontend and backend are now working together!

