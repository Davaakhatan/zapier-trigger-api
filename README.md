# Zapier Triggers API

A unified RESTful API for real-time event-driven automation on the Zapier platform.

## Overview

The Zapier Triggers API enables any external system to send events into Zapier via a standardized RESTful interface. This allows for real-time, event-driven workflows instead of relying solely on scheduled or manual triggers.

## Project Structure

```
.
├── backend/              # Python FastAPI backend (main application)
│   ├── src/             # Source code
│   │   ├── api/         # API routes
│   │   ├── core/        # Core functionality (config, database, exceptions)
│   │   └── models/      # Pydantic models
│   ├── tests/           # Test files
│   ├── main.py          # Application entry point
│   └── requirements.txt # Python dependencies
├── app/                  # Next.js frontend dashboard
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
├── docs/                 # Project documentation
│   ├── PRD.md           # Product Requirements Document
│   ├── ARCHITECTURE.md  # System architecture documentation
│   ├── PHASES.md        # Implementation phases
│   └── TASKS.md         # Detailed task list
├── memory-bank/          # Project context and memory bank
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
└── .cursor/
    └── rules/           # Cursor AI rules for this project
```

## Quick Start

### Prerequisites

- Python 3.9+ (for backend)
- Node.js 18+ and pnpm (for frontend)
- AWS CLI configured
- Docker (for local development)
- Git

### Local Development

#### Backend (Python FastAPI)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Set up virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

4. **Run the backend**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend (Next.js)

1. **Install dependencies** (from project root)
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Run the frontend**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

3. **Access the application**
   - Frontend Dashboard: http://localhost:3000
   - Backend API Docs: http://localhost:8000/docs
   - Backend Health: http://localhost:8000/health

## Documentation

- **[docs/PRD.md](docs/PRD.md)**: Product Requirements Document
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System architecture and design
- **[docs/PHASES.md](docs/PHASES.md)**: Implementation phases and timeline
- **[docs/TASKS.md](docs/TASKS.md)**: Detailed task breakdown
- **[docs/STATUS.md](docs/STATUS.md)**: Quick project status reference
- **[docs/COMPARISON.md](docs/COMPARISON.md)**: Built vs. Requirements comparison
- **[docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)**: Complete AWS deployment guide
- **[docs/API_GATEWAY_SETUP.md](docs/API_GATEWAY_SETUP.md)**: Step-by-step API Gateway setup guide
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**: Quick deployment guide
- **[memory-bank/](memory-bank/)**: Project context and memory bank

## AWS Deployment

### Quick Start

1. **Set up AWS infrastructure:**
   ```bash
   ./scripts/setup-aws.sh
   ```

2. **Deploy backend (Lambda):**
   ```bash
   ./scripts/deploy-lambda.sh
   ```

3. **Set up API Gateway** (see [QUICK_DEPLOY.md](QUICK_DEPLOY.md))

4. **Deploy frontend** (see [QUICK_DEPLOY.md](QUICK_DEPLOY.md))

### Detailed Guides

- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)**: Step-by-step deployment guide
- **[docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)**: Complete AWS deployment documentation with all options

## API Endpoints

All endpoints are prefixed with `/v1`.

### POST /v1/events
Ingest a new event.

**Request**:
```json
{
  "payload": {
    "key": "value"
  },
  "source": "optional-source-identifier",
  "tags": ["tag1", "tag2"]
}
```

**Response** (201 Created):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "timestamp": "2025-01-27T12:00:00Z",
  "message": "Event ingested successfully"
}
```

### GET /v1/events/inbox
Retrieve undelivered events.

**Query Parameters**:
- `limit` (optional): Number of events (default: 50, max: 100)
- `offset` (optional): Pagination offset
- `source` (optional): Filter by source
- `since` (optional): ISO 8601 timestamp

**Response** (200 OK):
```json
{
  "events": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### POST /events/{id}/ack
Acknowledge receipt of an event.

**Response** (200 OK):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}
```

## Development

### Running Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_events.py
```

### Code Quality

```bash
cd backend
source venv/bin/activate

# Format code
black src/ tests/

# Lint code
ruff check src/ tests/

# Type check
mypy src/
```

### Infrastructure

```bash
# Deploy infrastructure (Terraform)
cd infrastructure
terraform init
terraform plan
terraform apply

# Or with CDK
cdk deploy
```

## Project Status

**Current Phase**: Phase 2 - Core API Implementation  
**Progress**: Backend API Complete ✅

- ✅ Python FastAPI backend implemented
- ✅ All 3 core endpoints working
- ✅ DynamoDB integration ready
- ✅ Error handling and validation
- ⏳ AWS infrastructure (Phase 5)
- ⏳ Authentication (Phase 3)
- ⏳ Testing (Phase 4)

See [docs/TASKS.md](docs/TASKS.md) for detailed task status.

## Contributing

1. Read the [memory-bank](memory-bank/) documentation
2. Follow the coding standards in [.cursor/rules](.cursor/rules/)
3. Write tests for new features
4. Update documentation as needed

## License

[To be determined]

## Contact

**Organization**: Zapier  
**Project ID**: K1oUUDeoZrvJkVZafqHL_1761943818847

