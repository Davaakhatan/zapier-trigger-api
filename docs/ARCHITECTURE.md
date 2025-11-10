# Architecture: Zapier Triggers API

## System Architecture Overview

```
┌─────────────────┐
│  External       │
│  Systems        │
└────────┬────────┘
         │ HTTP/HTTPS
         │
┌────────▼─────────────────────────────────────┐
│         AWS API Gateway                       │
│  - Request Routing                            │
│  - Authentication                             │
│  - Rate Limiting                              │
└────────┬──────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────┐
│      Event Ingestion Service                  │
│  (Lambda/ECS/Fargate)                         │
│  - POST /events                               │
│  - Request Validation                         │
│  - Event ID Generation                        │
│  - Event Storage                              │
└────────┬──────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────┐
│         DynamoDB                              │
│  - Event Storage                              │
│  - Status Tracking                            │
│  - Query Support                              │
└──────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────┐
│      Event Delivery Service                   │
│  (Lambda/ECS/Fargate)                         │
│  - GET /inbox                                 │
│  - Query Pending Events                       │
│  - Pagination                                 │
│  - POST /events/{id}/ack                      │
│  - Status Updates                             │
└──────────────────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────┐
│      CloudWatch                               │
│  - Logging                                    │
│  - Metrics                                    │
│  - Alarms                                     │
└──────────────────────────────────────────────┘
```

## Component Details

### 1. API Gateway Layer

**Purpose**: Entry point for all API requests

**Responsibilities**:
- Request routing to appropriate services
- Authentication/authorization
- Rate limiting
- Request/response transformation
- CORS handling

**Technology**: AWS API Gateway (REST API)

**Configuration**:
- API versioning: `/v1/events`
- CORS: Enabled for cross-origin requests
- Throttling: Per-client rate limits
- Authentication: API key validation

### 2. Event Ingestion Service

**Purpose**: Handle event ingestion requests

**Responsibilities**:
- Validate incoming requests
- Generate unique event IDs (UUID v4)
- Add metadata (timestamp, source, etc.)
- Store events in DynamoDB
- Return acknowledgment response

**Technology**: 
- **Option A**: AWS Lambda (serverless, recommended for MVP)
- **Option B**: ECS/Fargate (containerized, for more control)
- **Framework**: FastAPI

**Endpoints**:
- `POST /events`: Ingest new event

**Key Functions**:
```python
async def ingest_event(event_data: EventRequest) -> EventResponse:
    # Validate request
    # Generate event ID
    # Add metadata
    # Store in DynamoDB
    # Return response
```

### 3. Event Store (DynamoDB)

**Purpose**: Durable storage for events

**Table Schema**:

**Table Name**: `zapier-triggers-events`

**Primary Key**:
- Partition Key: `event_id` (String, UUID)

**Attributes**:
- `event_id` (String, UUID): Unique event identifier
- `timestamp` (String, ISO 8601): Event creation time
- `payload` (Map/JSON): Event payload data
- `status` (String): Event status (pending, delivered, acknowledged)
- `source` (String, optional): Source identifier
- `tags` (List of Strings, optional): Event tags
- `metadata` (Map, optional): Additional metadata
- `created_at` (Number): Unix timestamp for sorting
- `acknowledged_at` (Number, optional): Acknowledgment timestamp

**Global Secondary Indexes (GSI)**:

1. **GSI: status-created_at-index**
   - Partition Key: `status`
   - Sort Key: `created_at`
   - Purpose: Query pending events efficiently

2. **GSI: source-timestamp-index** (optional, for P1)
   - Partition Key: `source`
   - Sort Key: `timestamp`
   - Purpose: Filter events by source

**Table Configuration**:
- Billing Mode: On-demand (for MVP, switch to provisioned if needed)
- Point-in-time recovery: Enabled
- Encryption: AWS managed keys

### 4. Event Delivery Service

**Purpose**: Retrieve and acknowledge events

**Responsibilities**:
- Query pending events from DynamoDB
- Support pagination
- Filter by source, timestamp
- Update event status on acknowledgment
- Handle event cleanup

**Technology**: Same as Event Ingestion Service

**Endpoints**:
- `GET /inbox`: Retrieve pending events
- `POST /events/{id}/ack`: Acknowledge event

**Key Functions**:
```python
async def get_inbox(
    limit: int = 50,
    offset: int = 0,
    source: Optional[str] = None,
    since: Optional[datetime] = None
) -> InboxResponse:
    # Query DynamoDB GSI for pending events
    # Apply filters
    # Paginate results
    # Return events

async def acknowledge_event(event_id: str) -> AcknowledgeResponse:
    # Update event status in DynamoDB
    # Return confirmation
```

### 5. Monitoring & Observability

**Purpose**: Track system health and performance

**Components**:
- **CloudWatch Logs**: Application logs
- **CloudWatch Metrics**: Custom metrics
- **CloudWatch Alarms**: Alerting

**Key Metrics**:
- Event ingestion rate
- Event ingestion latency (p50, p95, p99)
- Error rate
- Pending events count
- Acknowledgment rate

**Logging**:
- Structured JSON logs
- Request/response logging
- Error logging with stack traces
- Audit logging for security events

## Data Flow

### Event Ingestion Flow

1. **Client Request**: POST to `/events` with JSON payload
2. **API Gateway**: 
   - Validates API key
   - Checks rate limits
   - Routes to ingestion service
3. **Ingestion Service**:
   - Validates request schema
   - Generates UUID v4 event ID
   - Creates event record with:
     - `event_id`: Generated UUID
     - `timestamp`: Current ISO 8601 time
     - `payload`: Request payload
     - `status`: "pending"
     - `source`: From request (if provided)
     - `tags`: From request (if provided)
     - `metadata`: From request (if provided)
     - `created_at`: Unix timestamp
   - Stores in DynamoDB
   - Logs event creation
4. **Response**: Returns 201 Created with event details

### Event Retrieval Flow

1. **Client Request**: GET to `/inbox` with optional query params
2. **API Gateway**: Routes to delivery service
3. **Delivery Service**:
   - Queries DynamoDB GSI (`status-created_at-index`)
   - Filters by `status = "pending"`
   - Applies source filter if provided
   - Applies timestamp filter if provided
   - Paginates results
   - Returns events
4. **Response**: Returns 200 OK with event list

### Acknowledgment Flow

1. **Client Request**: POST to `/events/{id}/ack`
2. **API Gateway**: Routes to delivery service
3. **Delivery Service**:
   - Retrieves event by ID
   - Validates event exists and is pending
   - Updates event:
     - `status`: "acknowledged"
     - `acknowledged_at`: Current Unix timestamp
   - Stores update in DynamoDB
   - Logs acknowledgment
4. **Response**: Returns 200 OK with confirmation

## Security Architecture

### Authentication
- **Method**: API key in header (`X-API-Key`)
- **Storage**: AWS Secrets Manager
- **Validation**: API Gateway custom authorizer or Lambda authorizer

### Authorization
- **Scope**: Per-API-key permissions (future enhancement)
- **Rate Limiting**: Per-API-key limits

### Encryption
- **In Transit**: TLS 1.2+ (handled by API Gateway)
- **At Rest**: DynamoDB encryption with AWS managed keys

### Input Validation
- **Schema Validation**: Pydantic models
- **Size Limits**: Max payload size (e.g., 256 KB)
- **Sanitization**: Prevent injection attacks

## Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services are stateless, enabling horizontal scaling
- **Auto-scaling**: Lambda auto-scales, ECS can use auto-scaling groups
- **Load Balancing**: API Gateway handles load distribution

### Database Scaling
- **DynamoDB**: Auto-scales based on traffic
- **Partitioning**: Event ID as partition key ensures even distribution
- **GSI**: Separate GSI for query patterns to avoid hot partitions

### Caching Strategy
- **API Gateway**: Response caching for GET requests (optional)
- **Application Cache**: Cache frequently accessed data (future)

## Disaster Recovery

### Backup Strategy
- **DynamoDB**: Point-in-time recovery enabled
- **Infrastructure**: Infrastructure as Code (Terraform/CDK) for quick recovery

### High Availability
- **Multi-AZ**: DynamoDB and Lambda run across multiple availability zones
- **Retry Logic**: Client-side retry for transient failures

## Cost Optimization

### MVP Cost Considerations
- **Lambda**: Pay per request (cost-effective for MVP)
- **DynamoDB**: On-demand billing (no capacity planning needed)
- **API Gateway**: Pay per API call

### Future Optimizations
- **Provisioned Capacity**: Switch to provisioned DynamoDB if predictable traffic
- **Reserved Capacity**: Reserved Lambda concurrency if needed
- **Data Lifecycle**: Archive old events to S3

## Technology Decisions

### Why FastAPI?
- Modern async Python framework
- Automatic OpenAPI documentation
- Built-in validation with Pydantic
- High performance

### Why DynamoDB?
- Serverless, auto-scaling
- Low latency (< 10ms reads)
- NoSQL flexibility for event payloads
- Cost-effective for variable workloads

### Why Lambda?
- Serverless, no infrastructure management
- Auto-scaling
- Pay per use
- Easy deployment

### Why API Gateway?
- Managed service, no infrastructure
- Built-in authentication
- Rate limiting
- Request/response transformation

## Deployment Architecture

### Infrastructure as Code
- **Tool**: Terraform or AWS CDK
- **Components**:
  - API Gateway
  - Lambda functions
  - DynamoDB table
  - IAM roles and policies
  - CloudWatch log groups
  - Secrets Manager secrets

### CI/CD Pipeline
- **Source**: GitHub/GitLab
- **Build**: Docker container or Lambda package
- **Test**: Automated test suite
- **Deploy**: Terraform/CDK apply
- **Verify**: Smoke tests

### Environments
- **Development**: Local with LocalStack
- **Staging**: AWS staging environment
- **Production**: AWS production environment

