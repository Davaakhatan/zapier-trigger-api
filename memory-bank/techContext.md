# Technical Context: Zapier Triggers API

## Technology Stack

### Core Technologies
- **Language**: Python 3.11+
- **Framework**: FastAPI (recommended) or Flask
- **Platform**: AWS
- **API Style**: RESTful
- **Data Format**: JSON

### AWS Services

#### Primary Services
- **Compute**: 
  - AWS Lambda (serverless) OR
  - ECS/Fargate (containerized) OR
  - EC2 (traditional)
  
- **API Gateway**: 
  - AWS API Gateway (REST API)
  - Request routing and rate limiting
  
- **Storage**:
  - **DynamoDB**: For event storage (NoSQL, scalable)
    - OR **RDS PostgreSQL**: For relational needs
    - OR **S3**: For large payloads (with metadata in DB)
  
- **Monitoring & Logging**:
  - CloudWatch Logs
  - CloudWatch Metrics
  - X-Ray (optional, for tracing)

#### Secondary Services
- **IAM**: Authentication and authorization
- **Secrets Manager**: API keys and credentials
- **SQS**: Optional queue for async processing
- **EventBridge**: Optional for event routing

### Development Tools

- **Testing**: 
  - pytest (unit tests)
  - pytest-asyncio (async tests)
  - moto (AWS mocking)
  
- **Code Quality**:
  - black (code formatting)
  - flake8 or ruff (linting)
  - mypy (type checking)
  
- **API Documentation**:
  - OpenAPI/Swagger (auto-generated from FastAPI)
  
- **Local Development**:
  - Docker & Docker Compose
  - LocalStack (AWS service mocking)

### Dependencies

#### Core Python Packages
```
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.0.0
boto3>=1.28.0
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
```

#### Development Packages
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0
moto>=4.2.0
black>=23.0.0
ruff>=0.1.0
mypy>=1.6.0
```

## Development Setup

### Prerequisites
- Python 3.11+
- AWS CLI configured
- Docker (for local development)
- Git

### Local Development Environment
1. Virtual environment: `python -m venv venv`
2. Install dependencies: `pip install -r requirements.txt`
3. Environment variables: `.env` file with AWS credentials
4. Local AWS services: Docker Compose with LocalStack
5. Run server: `uvicorn main:app --reload`

### AWS Deployment

#### Infrastructure as Code
- **Terraform** OR **AWS CDK** OR **CloudFormation**
- Define: API Gateway, Lambda/ECS, DynamoDB, IAM roles

#### CI/CD Pipeline
- **GitHub Actions** OR **GitLab CI** OR **AWS CodePipeline**
- Steps: Test → Build → Deploy → Verify

## Technical Constraints

### Performance Requirements
- **Response Time**: < 100ms for event ingestion
- **Throughput**: Support high volume (define specific targets)
- **Availability**: 99.9% uptime target

### Security Requirements
- **Authentication**: API keys or OAuth 2.0
- **Encryption**: TLS 1.2+ in transit
- **Data Protection**: Encryption at rest
- **Compliance**: GDPR, CCPA considerations

### Scalability Requirements
- **Horizontal Scaling**: Stateless design enables auto-scaling
- **Database Scaling**: Partitioning strategy for event store
- **Rate Limiting**: Per-client rate limits

## Data Schema

### Event Schema
```json
{
  "id": "string (UUID)",
  "timestamp": "ISO 8601 datetime",
  "payload": "object (arbitrary JSON)",
  "status": "pending | delivered | acknowledged",
  "source": "string (optional)",
  "metadata": {
    "tags": ["string"],
    "priority": "low | normal | high"
  }
}
```

### API Request Schema
```json
{
  "payload": "object (required)",
  "source": "string (optional)",
  "tags": ["string"] (optional),
  "metadata": "object (optional)"
}
```

### API Response Schema
```json
{
  "event_id": "string (UUID)",
  "status": "created",
  "timestamp": "ISO 8601 datetime",
  "message": "string"
}
```

## Integration Points

### External Systems
- REST API clients (any language)
- Webhook endpoints
- SDK libraries (future)

### Internal Systems
- Zapier workflow engine
- Event processing pipeline
- Analytics systems

## Development Workflow

1. **Local Development**: Write code, test locally
2. **Unit Tests**: Run pytest suite
3. **Integration Tests**: Test against LocalStack
4. **Code Review**: Submit PR with tests
5. **Deploy to Staging**: Automated deployment
6. **E2E Testing**: Full system tests
7. **Deploy to Production**: After approval

## Monitoring & Observability

- **Logging**: Structured JSON logs to CloudWatch
- **Metrics**: Custom metrics for event counts, latency, errors
- **Alerts**: CloudWatch alarms for error rates, latency
- **Tracing**: X-Ray for request tracing (optional)

