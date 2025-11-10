# Quick Deployment Guide

**Fastest way to deploy your fullstack app to AWS**

---

## Prerequisites Checklist

- [ ] AWS Account with admin access
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ and pnpm installed

---

## Step-by-Step Deployment

### 1. Install AWS CLI (if needed)

```bash
# macOS
brew install awscli

# Verify
aws --version
aws configure  # Enter your AWS credentials
```

### 2. Set Up AWS Infrastructure

```bash
# Run the automated setup script
./scripts/setup-aws.sh
```

This will create:
- ✅ DynamoDB table (`zapier-triggers-events`)
- ✅ IAM role for Lambda
- ✅ Lambda function (if deployment package exists)
- ✅ CloudWatch log group

### 3. Deploy Backend (Lambda)

```bash
# Create and deploy Lambda function
./scripts/deploy-lambda.sh
```

This will:
- ✅ Package your FastAPI app
- ✅ Upload to AWS Lambda
- ✅ Update the function code

### 4. Set Up API Gateway

**Option A: Using AWS Console (Easier)**

1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Click **Create API** → **REST API** → **Build**
3. Choose **REST** → **New API**
4. Name: `zapier-triggers-api`
5. Click **Create API**

**Create Resources:**
1. Click **Actions** → **Create Resource**
   - Resource Name: `v1`
   - Resource Path: `v1`
   - Click **Create Resource**
2. Select `/v1` → **Actions** → **Create Resource**
   - Resource Name: `events`
   - Resource Path: `events`
   - Click **Create Resource**
3. Select `/v1/events` → **Actions** → **Create Resource**
   - Resource Name: `inbox`
   - Resource Path: `inbox`
   - Click **Create Resource**
4. Select `/v1/events` → **Actions** → **Create Resource**
   - Resource Name: `{id}`
   - Resource Path: `{id}`
   - Enable **Configure as proxy resource**
   - Click **Create Resource**
5. Select `/v1/events/{id}` → **Actions** → **Create Resource**
   - Resource Name: `ack`
   - Resource Path: `ack`
   - Click **Create Resource**

**Create Methods:**
1. Select `/v1/events` → **Actions** → **Create Method** → **POST**
   - Integration type: **Lambda Function**
   - Lambda Region: `us-east-1`
   - Lambda Function: `zapier-triggers-api`
   - Click **Save** → **OK**
2. Select `/v1/events/inbox` → **Actions** → **Create Method** → **GET**
   - Integration type: **Lambda Function**
   - Lambda Function: `zapier-triggers-api`
   - Click **Save** → **OK**
3. Select `/v1/events/{id}/ack` → **Actions** → **Create Method** → **POST**
   - Integration type: **Lambda Function**
   - Lambda Function: `zapier-triggers-api`
   - Click **Save** → **OK**

**Enable CORS:**
1. Select `/v1/events` → **Actions** → **Enable CORS**
   - Access-Control-Allow-Origin: `*`
   - Click **Enable CORS and replace existing CORS headers**
2. Repeat for `/v1/events/inbox` and `/v1/events/{id}/ack`

**Deploy API:**
1. Click **Actions** → **Deploy API**
2. Deployment stage: **New Stage**
3. Stage name: `prod`
4. Click **Deploy**
5. **Copy the Invoke URL** (you'll need this!)

**Option B: Using AWS CLI (Advanced)**

See `docs/AWS_DEPLOYMENT.md` for detailed CLI commands.

### 5. Deploy Frontend (Amplify)

**Option A: Using Amplify Console (Recommended)**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **New App** → **Host web app**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize and select your repository
5. Configure build settings:
   ```
   Build command: pnpm build
   Output directory: .next
   ```
6. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod`
   (Replace `YOUR_API_ID` with your actual API Gateway ID)
7. Click **Save and deploy**

**Option B: Using Amplify CLI**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 6. Update Lambda Environment Variables

```bash
# Get your Amplify app URL (from Amplify Console)
AMPLIFY_URL="https://your-app.amplifyapp.com"

# Update Lambda environment
aws lambda update-function-configuration \
  --function-name zapier-triggers-api \
  --environment "Variables={
    AWS_REGION=us-east-1,
    DYNAMODB_TABLE_NAME=zapier-triggers-events,
    DEBUG=false,
    CORS_ORIGINS=$AMPLIFY_URL
  }" \
  --region us-east-1
```

### 7. Test Your Deployment

```bash
# Get your API endpoint
API_ENDPOINT="https://$(aws apigateway get-rest-apis --query 'items[?name==`zapier-triggers-api`].id' --output text).execute-api.us-east-1.amazonaws.com/prod"

# Test health check
curl "$API_ENDPOINT/health"

# Test create event
curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"test":"data"},"source":"test"}'

# Test get inbox
curl "$API_ENDPOINT/v1/events/inbox?limit=10"
```

---

## Troubleshooting

### Lambda Function Not Found
```bash
# List all functions
aws lambda list-functions --query 'Functions[].FunctionName'
```

### API Gateway 500 Error
```bash
# Check Lambda logs
aws logs tail /aws/lambda/zapier-triggers-api --follow
```

### DynamoDB Table Not Found
```bash
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name zapier-triggers-events
```

### Frontend Can't Connect to API
1. Check `NEXT_PUBLIC_API_URL` environment variable in Amplify
2. Verify CORS is enabled in API Gateway
3. Check Lambda environment variable `CORS_ORIGINS`

---

## Quick Reference

```bash
# Deploy Lambda
./scripts/deploy-lambda.sh

# View logs
aws logs tail /aws/lambda/zapier-triggers-api --follow

# Get API endpoint
aws apigateway get-rest-apis --query 'items[?name==`zapier-triggers-api`].id' --output text
```

---

## Next Steps

1. ✅ Set up custom domain for API Gateway
2. ✅ Set up custom domain for Amplify
3. ✅ Configure API authentication (API keys)
4. ✅ Set up monitoring and alerts
5. ✅ Configure CI/CD pipeline

---

**Need more details?** See `docs/AWS_DEPLOYMENT.md` for the complete guide.

