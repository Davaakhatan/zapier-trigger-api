# Local Testing Guide

## 🚀 Quick Start

### Option 1: Frontend Only (Using Deployed Backend)

This is the easiest way to test the frontend locally with the deployed backend API.

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Create `.env.local` file** (optional - defaults to deployed API):
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod" > .env.local
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open in browser**:
   - Frontend: http://localhost:3000

### Option 2: Full Stack (Frontend + Backend Locally)

If you want to run both frontend and backend locally:

1. **Start Backend** (in backend repository):
   ```bash
   cd ../zapier-trigger-api-backend
   # Follow backend setup instructions
   # Backend should run on http://localhost:8000
   ```

2. **Start Frontend** (in this repository):
   ```bash
   # Create .env.local to use local backend
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   
   # Start frontend
   pnpm dev
   ```

3. **Open in browser**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🧪 Testing New Features

### 1. Test Bulk Operations

1. Go to **Inbox** tab
2. You'll see checkboxes on pending events
3. Select multiple events by clicking checkboxes
4. A bulk actions bar will appear at the top
5. Click **"Acknowledge All"** to acknowledge all selected events
6. Use **"Select All Pending"** button to select all pending events at once

### 2. Test Event Export

1. Go to **Inbox** tab
2. You'll see **"Export JSON"** and **"Export CSV"** buttons
3. Click either button to download events
4. Files will be named: `events-YYYY-MM-DD.json` or `events-YYYY-MM-DD.csv`
5. Export respects current filters/search

### 3. Test Event Creation

Create events using the backend API to see them in the frontend:

**Using curl:**
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

**Or use the test script** (in backend repo):
```bash
cd ../zapier-trigger-api-backend
./test-api.sh
```

### 4. Test Search and Filtering

1. Go to **Inbox** tab
2. Use the search box to search by source or payload content
3. Click **"Pending"** filter to show only pending events
4. Click **"All"** to show all events

### 5. Test Individual Event Actions

1. Click on any event card to expand it
2. View event details (payload, ID, status)
3. Click **"Copy"** to copy payload to clipboard
4. For pending events, click **"Acknowledge Event"** to acknowledge

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

1. Create some events using the API (see "Test Event Creation" above)
2. Refresh the inbox
3. Check browser console for errors

## 📝 Environment Variables

Create `.env.local` in the project root:

```env
# Use deployed API (default)
NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod

# OR use local backend
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 What to Test

- ✅ Dashboard stats update correctly
- ✅ Inbox shows events
- ✅ Search works
- ✅ Filtering works
- ✅ Individual event acknowledgment
- ✅ Bulk selection (checkboxes)
- ✅ Bulk acknowledgment
- ✅ Export JSON
- ✅ Export CSV
- ✅ Event details expansion
- ✅ Copy to clipboard
- ✅ Auto-refresh (every 30 seconds)

## 🚀 Development Commands

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

## 📚 More Information

- **Backend Repository**: https://github.com/Davaakhatan/zapier-trigger-api-backend
- **Getting Started**: [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- **API Documentation**: See "API Docs" tab in the dashboard

