# Product Requirements Document: Zapier Triggers API

**Version**: 1.0  
**Date**: 2025-01-27  
**Organization**: Zapier  
**Project ID**: K1oUUDeoZrvJkVZafqHL_1761943818847

---

## 1. Executive Summary

The Zapier Triggers API is a new, unified system designed to enable real-time, event-driven automation on the Zapier platform. It will provide a public, reliable, and developer-friendly RESTful interface for any system to send events into Zapier. This innovation will empower users to create agentic workflows, allowing systems to react to events in real time rather than relying solely on scheduled or manual triggers. By implementing the Triggers API, Zapier will lay the groundwork for the next generation of automation and agent frameworks.

## 2. Problem Statement

Currently, triggers in Zapier are defined within individual integrations, limiting flexibility and scalability. The lack of a centralized mechanism to accept and process events from diverse sources restricts the platform's ability to support real-time, event-driven workflows. The introduction of a unified Triggers API will resolve these limitations by providing a standardized method for systems to send and manage events efficiently, thereby enhancing Zapier's automation capabilities.

## 3. Goals & Success Metrics

### Goals
- Develop a working prototype of the Triggers API that can reliably ingest, store, and deliver events
- Enable real-time event processing with low latency
- Provide a developer-friendly API interface
- Establish scalable infrastructure for high-volume event processing

### Success Metrics
- **Reliability**: 99.9% success rate for event ingestion
- **Performance**: < 100ms response time for event ingestion
- **Latency Reduction**: 50% reduction in event processing latency compared to existing integrations
- **Developer Experience**: Positive feedback on ease of use and integration (measured through surveys)
- **Adoption**: 10% of existing Zapier integrations adopt the API within first 6 months

## 4. Target Users & Personas

### Primary Personas

1. **Developers**
   - Need a straightforward, reliable API to integrate their systems with Zapier
   - Require clear documentation and examples
   - Value simplicity and predictability

2. **Automation Specialists**
   - Require tools to build complex workflows that react to external events
   - Need reliable event delivery without manual intervention
   - Value monitoring and debugging capabilities

3. **Business Analysts**
   - Seek insights from real-time data
   - Need access to event data for analysis
   - Value data accessibility and query capabilities

## 5. User Stories

1. **As a Developer**, I want to send events to Zapier via a RESTful API so that I can integrate my application with minimal effort.

2. **As an Automation Specialist**, I want to create workflows that automatically react to incoming events so that I can streamline business processes.

3. **As a Business Analyst**, I want to access real-time event data so that I can analyze trends and optimize operations.

## 6. Functional Requirements

### P0: Must-have (MVP)

#### Event Ingestion Endpoint (`/events`)
- Accept POST requests with JSON payloads
- Validate request structure and content
- Generate unique event IDs (UUID v4)
- Store events with metadata:
  - Event ID
  - Timestamp (ISO 8601)
  - Payload contents
  - Source identifier (optional)
  - Status (pending/delivered/acknowledged)
- Return structured acknowledgment:
  - Event ID
  - Status
  - Timestamp
  - Success message

#### Event Persistence and Delivery
- Store events durably in AWS DynamoDB
- Ensure no data loss on system failures
- Provide `/inbox` endpoint to:
  - List undelivered events (status: pending)
  - Support pagination
  - Filter by source, timestamp range
- Implement acknowledgment flow:
  - Endpoint: `/events/{id}/ack`
  - Update event status to "acknowledged"
  - Optionally remove from active queue
  - Return confirmation

### P1: Should-have

#### Developer Experience Enhancements
- Clear and predictable API routes and responses
- Comprehensive error messages with error codes
- API versioning support
- Basic retry logic or status tracking for event delivery
- Request/response logging for debugging

### P2: Nice-to-have

#### Documentation and Example Client
- Comprehensive API documentation (OpenAPI/Swagger)
- Sample client implementations in multiple languages
- Integration guides and tutorials
- Postman collection or similar

## 7. Non-Functional Requirements

### Performance
- **Response Time**: < 100ms for event ingestion endpoint
- **Throughput**: Support high volume of concurrent requests
- **Availability**: 99.9% uptime target
- **Scalability**: Horizontal scaling capability

### Security
- **Authentication**: API key or token-based authentication
- **Authorization**: Role-based access control
- **Encryption**: TLS 1.2+ in transit, encryption at rest
- **Input Validation**: Strict schema validation
- **Rate Limiting**: Per-client rate limits to prevent abuse

### Compliance
- Adherence to data protection regulations (GDPR, CCPA)
- Data retention policies
- Audit logging for compliance

### Reliability
- Durable event storage (no data loss)
- Idempotent operations where applicable
- Graceful error handling
- Retry mechanisms for transient failures

## 8. User Experience & Design Considerations

### API Design Principles
- **RESTful**: Follow REST conventions
- **Intuitive**: Clear, predictable endpoints
- **Consistent**: Uniform response formats
- **Informative**: Detailed error messages
- **Versioned**: API versioning for future changes

### Developer Experience
- Clear documentation with examples
- Comprehensive error messages
- Easy integration (minimal setup)
- Observable (logging, metrics)

### Accessibility
- Standard HTTP/JSON (no proprietary protocols)
- Language-agnostic (any HTTP client)
- Well-documented (OpenAPI spec)

## 9. Technical Requirements

### System Architecture
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Platform**: AWS
- **API Style**: RESTful
- **Data Format**: JSON

### AWS Services
- **Compute**: AWS Lambda or ECS/Fargate
- **API Gateway**: AWS API Gateway (REST API)
- **Storage**: AWS DynamoDB
- **Monitoring**: CloudWatch Logs and Metrics
- **Security**: IAM, Secrets Manager

### Integrations
- Open-source testing tools (pytest, moto)
- Mock data sources for development
- LocalStack for local AWS service mocking

### Data Requirements
- JSON schema for event data
- Sample payloads for testing
- Schema validation using Pydantic

## 10. Dependencies & Assumptions

### Dependencies
- AWS infrastructure availability
- Python 3.11+ runtime
- FastAPI framework
- DynamoDB service availability

### Assumptions
- Developer familiarity with RESTful APIs and JSON
- AWS account with appropriate permissions
- Network connectivity to AWS services
- Standard HTTP client libraries available

## 11. Out of Scope (MVP)

The following features are explicitly out of scope for the MVP:

- Advanced event filtering and transformation features
- Comprehensive analytics and reporting tools
- Long-term data retention strategies (beyond MVP needs)
- Event replay capabilities
- Event routing and fan-out
- Webhook delivery to external systems
- Advanced authentication (OAuth 2.0, SAML) - API keys only for MVP
- Event batching/bulk operations
- Event versioning and schema evolution

## 12. API Specification

### Endpoints

#### POST `/events`
Ingest a new event.

**Request Body**:
```json
{
  "payload": {
    "key": "value"
  },
  "source": "optional-source-identifier",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "custom": "data"
  }
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

#### GET `/inbox`
Retrieve undelivered events.

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 50, max: 100)
- `offset` (optional): Pagination offset
- `source` (optional): Filter by source
- `since` (optional): ISO 8601 timestamp (return events after this time)

**Response** (200 OK):
```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-01-27T12:00:00Z",
      "payload": {
        "key": "value"
      },
      "source": "source-identifier",
      "status": "pending"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### POST `/events/{id}/ack`
Acknowledge receipt of an event.

**Response** (200 OK):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}
```

### Error Responses

**400 Bad Request**:
```json
{
  "error": "validation_error",
  "message": "Invalid request payload",
  "details": {
    "field": "payload",
    "issue": "Field is required"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": "authentication_error",
  "message": "Invalid or missing API key"
}
```

**404 Not Found**:
```json
{
  "error": "not_found",
  "message": "Event not found"
}
```

**429 Too Many Requests**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please retry after 60 seconds"
}
```

**500 Internal Server Error**:
```json
{
  "error": "internal_error",
  "message": "An internal error occurred"
}
```

## 13. Timeline & Phases

See `ARCHITECTURE.md` and `PHASES.md` for detailed implementation phases.

## 14. Success Criteria

The MVP will be considered successful when:
1. All P0 requirements are implemented and tested
2. API achieves < 100ms response time for event ingestion
3. System demonstrates 99.9% reliability in testing
4. Sample client successfully integrates with API
5. Documentation is complete and clear

---

**Document Status**: Approved for Implementation  
**Next Review**: After MVP completion

