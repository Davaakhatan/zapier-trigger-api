# AWS Deployment Guide: Zapier Triggers API

**Complete Step-by-Step Guide to Deploy Fullstack App on AWS**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Step 1: Create DynamoDB Table](#step-1-create-dynamodb-table)
4. [Step 2: Deploy Backend API (Lambda)](#step-2-deploy-backend-api-lambda)
5. [Step 3: Set Up API Gateway](#step-3-set-up-api-gateway)
6. [Step 4: Deploy Frontend (Amplify)](#step-4-deploy-frontend-amplify)
7. [Step 5: Configure Environment Variables](#step-5-configure-environment-variables)
8. [Step 6: Set Up Monitoring](#step-6-set-up-monitoring)
9. [Step 7: Test the Deployment](#step-7-test-the-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Cost Estimation](#cost-estimation)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with admin access
- ✅ AWS CLI installed and configured (`aws --version`)
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ and pnpm installed
- ✅ Git installed
- ✅ Basic knowledge of AWS services

### Install AWS CLI (if not installed)

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### Configure AWS CLI

```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

---

## AWS Account Setup

### 1. Create IAM User for Deployment (Recommended)

1. Go to **IAM Console** → **Users** → **Create User**
2. Name: `zapier-triggers-deployer`
3. Select: **Programmatic access**
4. Attach policies:
   - `AWSLambda_FullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `AWSAmplifyFullAccess`
   - `CloudWatchFullAccess`
   - `IAMFullAccess` (for creating roles)
5. Save the **Access Key ID** and **Secret Access Key**

### 2. Set Up AWS Credentials

```bash
aws configure --profile zapier-triggers
# Use the credentials from the IAM user you just created
```

---

## Step 1: Create DynamoDB Table

### Option A: Using AWS Console

1. Go to **DynamoDB Console** → **Tables** → **Create Table**
2. **Table name**: `zapier-triggers-events`
3. **Partition key**: `event_id` (String)
4. **Table settings**: Use default settings
5. Click **Create Table**

### Option B: Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name zapier-triggers-events \
  --attribute-definitions \
    AttributeName=event_id,AttributeType=S \
    AttributeName=status,AttributeType=S \
    AttributeName=created_at,AttributeType=N \
  --key-schema \
    AttributeName=event_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    'IndexName=status-created_at-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL}' \
  --region us-east-1
```

### Create Global Secondary Index (GSI)

The table should automatically create the GSI. Verify it exists:

```bash
aws dynamodb describe-table \
  --table-name zapier-triggers-events \
  --query 'Table.GlobalSecondaryIndexes'
```

**Expected Output**: Should show `status-created_at-index` with partition key `status` and sort key `created_at`.

---

## Step 2: Deploy Backend API (Lambda)

### 2.1 Prepare Lambda Deployment Package

```bash
cd backend

# Create deployment directory
mkdir -p lambda-package
cd lambda-package

# Copy source code
cp -r ../src .
cp ../requirements.txt .

# Install dependencies
pip install -r requirements.txt -t .

# Create deployment zip
zip -r ../lambda-deployment.zip . -x "*.pyc" "__pycache__/*" "*.dist-info/*"
cd ..
```

### 2.2 Create IAM Role for Lambda

```bash
# Create trust policy
cat > lambda-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name zapier-triggers-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name zapier-triggers-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name zapier-triggers-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Get role ARN (save this for later)
aws iam get-role --role-name zapier-triggers-lambda-role --query 'Role.Arn' --output text
```

### 2.3 Create Lambda Function

```bash
# Replace YOUR_ROLE_ARN with the ARN from previous step
ROLE_ARN=$(aws iam get-role --role-name zapier-triggers-lambda-role --query 'Role.Arn' --output text)

aws lambda create-function \
  --function-name zapier-triggers-api \
  --runtime python3.9 \
  --role $ROLE_ARN \
  --handler src.main.handler \
  --zip-file fileb://lambda-deployment.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    DYNAMODB_TABLE_NAME=zapier-triggers-events
  }" \
  --region us-east-1
```

### 2.4 Update Lambda Handler

We need to create a Lambda-compatible handler. Create `backend/src/main.py`:

```python
"""Lambda handler entry point."""
from mangum import Mangum
from src.main import app

handler = Mangum(app)
```

Install `mangum` for Lambda:

```bash
cd backend
pip install mangum
# Add to requirements.txt
echo "mangum>=0.17.0" >> requirements.txt
```

Recreate the deployment package:

```bash
cd backend
rm -rf lambda-package lambda-deployment.zip
mkdir -p lambda-package
cd lambda-package
cp -r ../src .
cp ../requirements.txt .
pip install -r requirements.txt -t .
zip -r ../lambda-deployment.zip . -x "*.pyc" "__pycache__/*" "*.dist-info/*"
cd ..
```

Update Lambda function:

```bash
aws lambda update-function-code \
  --function-name zapier-triggers-api \
  --zip-file fileb://lambda-deployment.zip \
  --region us-east-1
```

---

## Step 3: Set Up API Gateway

### 3.1 Create REST API

```bash
# Create API
API_ID=$(aws apigateway create-rest-api \
  --name zapier-triggers-api \
  --description "Zapier Triggers API" \
  --endpoint-configuration types=REGIONAL \
  --query 'id' \
  --output text)

echo "API ID: $API_ID"
```

### 3.2 Get Root Resource ID

```bash
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' \
  --output text)

echo "Root Resource ID: $ROOT_RESOURCE_ID"
```

### 3.3 Create API Resources

```bash
# Create /v1 resource
V1_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part v1 \
  --query 'id' \
  --output text)

# Create /v1/events resource
EVENTS_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $V1_RESOURCE_ID \
  --path-part events \
  --query 'id' \
  --output text)

# Create /v1/events/inbox resource
INBOX_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $EVENTS_RESOURCE_ID \
  --path-part inbox \
  --query 'id' \
  --output text)

# Create /v1/events/{id} resource
EVENT_ID_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $EVENTS_RESOURCE_ID \
  --path-part '{id}' \
  --query 'id' \
  --output text)

# Create /v1/events/{id}/ack resource
ACK_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $EVENT_ID_RESOURCE_ID \
  --path-part ack \
  --query 'id' \
  --output text)
```

### 3.4 Create Methods

```bash
# POST /v1/events
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $EVENTS_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE

# GET /v1/events/inbox
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $INBOX_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# POST /v1/events/{id}/ack
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ACK_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE
```

### 3.5 Set Up Lambda Integration

```bash
LAMBDA_ARN=$(aws lambda get-function \
  --function-name zapier-triggers-api \
  --query 'Configuration.FunctionArn' \
  --output text)

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name zapier-triggers-api \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*"

# Set up integration for POST /v1/events
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $EVENTS_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Set up integration for GET /v1/events/inbox
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $INBOX_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Set up integration for POST /v1/events/{id}/ack
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ACK_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"
```

### 3.6 Deploy API

```bash
# Create deployment
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --description "Production deployment"

# Get API endpoint
API_ENDPOINT="https://$API_ID.execute-api.us-east-1.amazonaws.com/prod"
echo "API Endpoint: $API_ENDPOINT"
```

**Save this endpoint URL** - you'll need it for the frontend!

---

## Step 4: Deploy Frontend (Amplify)

### 4.1 Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify --version
```

### 4.2 Initialize Amplify Project

```bash
cd /Users/davaakhatanzorigtbaatar/Downloads/Private/2024/2025/CLassboxes/Gauntlet AI/Projects/Silver/Zapier

amplify init
# Follow prompts:
# - Enter a name for the project: zapier-triggers-frontend
# - Initialize the project with the above settings? Yes
# - Select authentication method: AWS profile
# - Choose your default profile: default (or zapier-triggers)
# - Select the type of app: javascript
# - What javascript framework: react
# - Source directory path: ./
# - Distribution directory path: .next
# - Build command: pnpm build
# - Start command: pnpm start
# - Do you want to use an AWS profile? Yes
```

### 4.3 Add Hosting

```bash
amplify add hosting
# Select: Hosting with Amplify Console
# Select: Manual deployment
```

### 4.4 Configure Environment Variables

Create `.env.production` in the root directory:

```bash
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
EOF
```

Replace `YOUR_API_ID` with your actual API Gateway ID.

### 4.5 Update Frontend API Client

Update `lib/api.ts` to use the environment variable:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### 4.6 Build and Deploy

```bash
# Build the app
pnpm build

# Publish to Amplify
amplify publish
```

### Alternative: Manual Deployment via Amplify Console

1. Go to **AWS Amplify Console**
2. Click **New App** → **Host web app**
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Build command**: `pnpm build`
   - **Output directory**: `.next`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod`
6. Click **Save and deploy**

---

## Step 5: Configure Environment Variables

### 5.1 Update Lambda Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name zapier-triggers-api \
  --environment "Variables={
    AWS_REGION=us-east-1,
    DYNAMODB_TABLE_NAME=zapier-triggers-events,
    DEBUG=false,
    CORS_ORIGINS=https://your-amplify-domain.amplifyapp.com
  }" \
  --region us-east-1
```

### 5.2 Update CORS in Backend

Update `backend/src/core/config.py` to read CORS origins from environment:

```python
cors_origins: List[str] = ["*"]  # Will be overridden by env var
```

The Lambda will use the environment variable you set above.

---

## Step 6: Set Up Monitoring

### 6.1 Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /aws/lambda/zapier-triggers-api \
  --region us-east-1
```

### 6.2 Set Up CloudWatch Alarms

```bash
# Create alarm for errors
aws cloudwatch put-metric-alarm \
  --alarm-name zapier-triggers-api-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=zapier-triggers-api \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:alerts-topic
```

### 6.3 View Logs

```bash
# View recent logs
aws logs tail /aws/lambda/zapier-triggers-api --follow
```

---

## Step 7: Test the Deployment

### 7.1 Test API Endpoints

```bash
# Get your API endpoint
API_ENDPOINT="https://$(aws apigateway get-rest-apis --query 'items[?name==`zapier-triggers-api`].id' --output text).execute-api.us-east-1.amazonaws.com/prod"

# Test POST /v1/events
curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": "data"
    },
    "source": "test-source"
  }'

# Test GET /v1/events/inbox
curl "$API_ENDPOINT/v1/events/inbox?limit=10"

# Test POST /v1/events/{id}/ack
# (Use event_id from previous response)
curl -X POST "$API_ENDPOINT/v1/events/EVENT_ID/ack"
```

### 7.2 Test Frontend

1. Open your Amplify app URL
2. Navigate to the Event Inbox
3. Create a test event
4. Verify it appears in the inbox
5. Acknowledge the event

---

## Troubleshooting

### Lambda Function Not Found

```bash
# List all Lambda functions
aws lambda list-functions --query 'Functions[].FunctionName'
```

### API Gateway 500 Error

1. Check Lambda logs:
```bash
aws logs tail /aws/lambda/zapier-triggers-api --follow
```

2. Test Lambda directly:
```bash
aws lambda invoke \
  --function-name zapier-triggers-api \
  --payload '{"httpMethod":"GET","path":"/v1/events/inbox"}' \
  response.json
cat response.json
```

### DynamoDB Table Not Found

```bash
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name zapier-triggers-events
```

### CORS Issues

1. Ensure CORS is enabled in API Gateway
2. Check Lambda environment variable `CORS_ORIGINS`
3. Verify frontend is using correct API URL

### Frontend Build Fails

1. Check build logs in Amplify Console
2. Verify `package.json` has correct build script
3. Ensure all dependencies are installed

---

## Cost Estimation

### Monthly Costs (Estimated for MVP)

- **DynamoDB**: ~$0.25 per million requests (on-demand)
- **Lambda**: ~$0.20 per million requests + $0.0000166667 per GB-second
- **API Gateway**: ~$3.50 per million requests
- **Amplify Hosting**: Free tier (5GB storage, 15GB bandwidth)
- **CloudWatch**: ~$0.50 per GB of logs ingested

**Total for 1M requests/month**: ~$4-5/month

### Cost Optimization Tips

1. Use DynamoDB on-demand billing (no capacity planning)
2. Enable Lambda provisioned concurrency only if needed
3. Set up CloudWatch log retention (7 days for dev, 30 days for prod)
4. Use API Gateway caching for GET requests

---

## Next Steps

1. ✅ Set up authentication (API keys in Secrets Manager)
2. ✅ Configure rate limiting in API Gateway
3. ✅ Set up CI/CD pipeline
4. ✅ Add custom domain for API Gateway
5. ✅ Set up custom domain for Amplify
6. ✅ Enable CloudWatch dashboards
7. ✅ Set up automated backups for DynamoDB

---

## Quick Reference Commands

```bash
# Get API endpoint
aws apigateway get-rest-apis --query 'items[?name==`zapier-triggers-api`].id' --output text

# View Lambda logs
aws logs tail /aws/lambda/zapier-triggers-api --follow

# Update Lambda code
cd backend && zip -r lambda-deployment.zip . && aws lambda update-function-code --function-name zapier-triggers-api --zip-file fileb://lambda-deployment.zip

# Test API
curl -X POST "https://API_ID.execute-api.us-east-1.amazonaws.com/prod/v1/events" -H "Content-Type: application/json" -d '{"payload":{"test":"data"}}'
```

---

**Deployment Complete! 🎉**

Your fullstack app is now running on AWS. Access your frontend via the Amplify URL and test the API endpoints.

