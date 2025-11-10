# System Patterns: Zapier Triggers API

## Architecture Overview

The system follows a microservices architecture pattern with clear separation of concerns:

```
External Systems → API Gateway → Event Ingestion Service → Event Store → Event Delivery Service → Consumers
```

## Key Components

### 1. API Layer
- **RESTful API**: Python-based API service handling HTTP requests
- **Authentication**: API key or token-based authentication
- **Validation**: Request validation and schema enforcement
- **Rate Limiting**: Protection against abuse

### 2. Event Ingestion Service
- **Endpoint**: `/events` (POST)
- **Responsibilities**:
  - Accept JSON payloads
  - Generate unique event IDs
  - Add metadata (timestamp, source, etc.)
  - Store events durably
  - Return acknowledgment

### 3. Event Store
- **Storage**: AWS service (DynamoDB or RDS based on requirements)
- **Schema**: 
  - Event ID (primary key)
  - Timestamp
  - Payload (JSON)
  - Status (pending, delivered, acknowledged)
  - Metadata (source, tags, etc.)

### 4. Event Delivery Service
- **Endpoint**: `/inbox` (GET)
- **Responsibilities**:
  - Retrieve undelivered events
  - Support filtering and pagination
  - Track delivery status
  - Handle acknowledgment

### 5. Acknowledgment System
- **Endpoint**: `/events/{id}/ack` (POST/DELETE)
- **Responsibilities**:
  - Mark events as delivered/acknowledged
  - Clean up acknowledged events (optional)
  - Update event status

## Design Patterns

### Event-Driven Architecture
- Events are the primary data structure
- Asynchronous processing where possible
- Decoupled components communicating via events

### RESTful Design
- Resource-based URLs
- Standard HTTP methods (GET, POST, DELETE)
- Stateless operations
- Clear status codes

### Idempotency
- Event IDs prevent duplicate processing
- Idempotent operations where applicable

### Durable Storage
- All events persisted before acknowledgment
- No data loss on system failures

## Data Flow Patterns

### Event Ingestion Flow
1. Client sends POST to `/events` with JSON payload
2. API validates request and authenticates
3. Service generates unique event ID
4. Event stored with status "pending"
5. Return 201 Created with event ID and metadata

### Event Retrieval Flow
1. Client sends GET to `/inbox`
2. Service queries for events with status "pending"
3. Returns paginated list of events
4. Client processes events
5. Client acknowledges via `/events/{id}/ack`

### Acknowledgment Flow
1. Client sends POST/DELETE to `/events/{id}/ack`
2. Service updates event status to "acknowledged"
3. Optionally removes event from active queue
4. Returns 200 OK

## Error Handling Patterns

- **400 Bad Request**: Invalid payload or missing required fields
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Event ID not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors

## Scalability Patterns

- **Horizontal Scaling**: Stateless API services can scale horizontally
- **Database Sharding**: Event store can be partitioned by event ID or timestamp
- **Caching**: Frequently accessed data cached where appropriate
- **Async Processing**: Background jobs for non-critical operations

## Security Patterns

- **Authentication**: API keys or OAuth tokens
- **Authorization**: Role-based access control
- **Encryption**: TLS in transit, encryption at rest
- **Input Validation**: Strict schema validation
- **Rate Limiting**: Prevent abuse and ensure fair usage

