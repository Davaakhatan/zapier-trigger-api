# Active Context: Zapier Triggers API

## Current Focus

**Phase**: Project Initialization  
**Status**: Setting up project structure and documentation

## Recent Changes

- Created memory bank structure
- Defined project brief and requirements
- Established architecture patterns
- Documented technical stack

## Next Steps

1. **Project Setup**
   - Initialize Python project structure
   - Set up development environment
   - Create initial FastAPI application skeleton
   - Configure AWS infrastructure (Terraform/CDK)

2. **Core Implementation**
   - Implement `/events` POST endpoint
   - Set up event storage (DynamoDB)
   - Implement `/inbox` GET endpoint
   - Implement acknowledgment flow

3. **Testing & Validation**
   - Write unit tests
   - Create integration tests
   - Set up local development environment
   - Test with sample client

## Active Decisions

### Pending Decisions
1. **Storage Choice**: DynamoDB vs RDS PostgreSQL
   - Recommendation: DynamoDB for scalability and serverless compatibility
   
2. **Compute Platform**: Lambda vs ECS vs EC2
   - Recommendation: Lambda for MVP (serverless, cost-effective)
   
3. **Authentication Method**: API keys vs OAuth 2.0
   - Recommendation: API keys for MVP, OAuth 2.0 for future

4. **Event Retention**: How long to keep acknowledged events
   - Recommendation: 7 days for MVP, configurable later

### Made Decisions
- **Framework**: FastAPI (modern, async, auto-docs)
- **Language**: Python 3.11+
- **Platform**: AWS
- **API Style**: RESTful

## Current Considerations

### Technical Considerations
- Event ID generation strategy (UUID v4)
- Pagination strategy for `/inbox` endpoint
- Rate limiting implementation
- Error handling and retry logic

### Design Considerations
- API versioning strategy
- Event payload size limits
- Concurrent request handling
- Idempotency guarantees

## Blockers & Risks

### Current Blockers
- None identified yet

### Potential Risks
1. **Scalability**: Need to validate DynamoDB partition key strategy
2. **Latency**: Ensure < 100ms target is achievable
3. **Cost**: Monitor AWS costs as volume scales
4. **Security**: Ensure proper authentication/authorization

## Immediate Actions

1. Create project structure
2. Set up development environment
3. Implement basic FastAPI application
4. Create initial API endpoints
5. Set up local testing environment

