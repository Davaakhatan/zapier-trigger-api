# API Gateway Setup Guide

**Step-by-step guide to set up API Gateway for Zapier Triggers API**

---

## Prerequisites

- ✅ AWS Account configured
- ✅ DynamoDB table created (`zapier-triggers-events`)
- ✅ IAM role created (`zapier-triggers-lambda-role`)
- ✅ Lambda function created (`zapier-triggers-api`)

---

## Step 1: Create REST API

1. Go to **AWS Console** → Search for **"API Gateway"**
2. Click **"Create API"**
3. Select **"REST API"** → Click **"Build"**
4. Choose **"REST"** → **"New API"**
5. Configure:
   - **Name**: `zapier-triggers-api`
   - **Endpoint Type**: `Regional`
6. Click **"Create API"**

**Expected Result**: You should see a success message and the API Gateway console with the root `/` resource.

---

## Step 2: Create API Resources

### 2.1 Create `/v1` Resource

1. In the **Resources** section, select the root `/` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `v1`
   - **Resource Path**: `v1`
   - **Enable API Gateway CORS**: Leave unchecked
4. Click **"Create Resource"**

### 2.2 Create `/v1/events` Resource

1. Select the `/v1` resource you just created
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `events`
   - **Resource Path**: `events`
4. Click **"Create Resource"**

### 2.3 Create `/v1/events/inbox` Resource

1. Select the `/v1/events` resource (⚠️ **Important**: Select `/events`, NOT `/{id}`)
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `inbox`
   - **Resource Path**: `inbox`
4. Click **"Create Resource"**

### 2.4 Create `/v1/events/{id}` Resource

1. Select the `/v1/events` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `{id}`
   - **Resource Path**: `{id}`
   - **Enable Proxy Resource**: ✅ **Check this box**
4. Click **"Create Resource"**

### 2.5 Create `/v1/events/{id}/ack` Resource

1. Select the `/v1/events/{id}` resource
2. Click **"Actions"** → **"Create Resource"**
3. Configure:
   - **Resource Name**: `ack`
   - **Resource Path**: `ack`
4. Click **"Create Resource"**

**Expected Structure:**
```
/
└── v1
    └── events
        ├── inbox
        └── {id}
            └── ack
```

---

## Step 3: Create Methods and Connect to Lambda

### 3.1 Create POST Method for `/v1/events`

1. Select the `/v1/events` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **"POST"** from the dropdown
4. Click the **checkmark** ✓
5. Configure Integration:
   - **Integration type**: `Lambda Function`
   - **Use Lambda Proxy integration**: ✅ **Check this box**
   - **Lambda Region**: `us-east-1`
   - **Lambda Function**: Type `zapier-triggers-api` (it should autocomplete)
6. Click **"Save"**
7. When prompted **"Add Permission to Lambda Function?"**, click **"OK"**

**Expected Result**: You should see "POST" method listed with "Integration type: AWS_PROXY" and "Integration: zapier-triggers-api".

### 3.2 Create GET Method for `/v1/events/inbox`

1. Select the `/v1/events/inbox` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **"GET"** from the dropdown
4. Click the **checkmark** ✓
5. Configure Integration:
   - **Integration type**: `Lambda Function`
   - **Use Lambda Proxy integration**: ✅ **Check this box**
   - **Lambda Region**: `us-east-1`
   - **Lambda Function**: `zapier-triggers-api`
6. Click **"Save"** → **"OK"** (when prompted)

### 3.3 Create POST Method for `/v1/events/{id}/ack`

1. Select the `/v1/events/{id}/ack` resource
2. Click **"Actions"** → **"Create Method"**
3. Select **"POST"** from the dropdown
4. Click the **checkmark** ✓
5. Configure Integration:
   - **Integration type**: `Lambda Function`
   - **Use Lambda Proxy integration**: ✅ **Check this box**
   - **Lambda Region**: `us-east-1`
   - **Lambda Function**: `zapier-triggers-api`
6. Click **"Save"** → **"OK"** (when prompted)

**Expected Result**: All three methods should be created:
- ✅ POST `/v1/events`
- ✅ GET `/v1/events/inbox`
- ✅ POST `/v1/events/{id}/ack`

---

## Step 4: Enable CORS

CORS (Cross-Origin Resource Sharing) allows your frontend to call the API from a browser.

### 4.1 Enable CORS for `/v1/events`

1. Select the `/v1/events` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Leave default settings:
   - **Access-Control-Allow-Origin**: `*` (or your specific domain)
   - **Access-Control-Allow-Headers**: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - **Access-Control-Allow-Methods**: `POST,OPTIONS`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"** if prompted

### 4.2 Enable CORS for `/v1/events/inbox`

1. Select the `/v1/events/inbox` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods**: `GET,OPTIONS`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"** if prompted

### 4.3 Enable CORS for `/v1/events/{id}/ack`

1. Select the `/v1/events/{id}/ack` resource
2. Click **"Actions"** → **"Enable CORS"**
3. Configure:
   - **Access-Control-Allow-Methods**: `POST,OPTIONS`
4. Click **"Enable CORS and replace existing CORS headers"**
5. Click **"Yes, replace existing values"** if prompted

**Expected Result**: All three resources should have CORS enabled with OPTIONS methods automatically created.

---

## Step 5: Deploy the API

1. Click **"Actions"** → **"Deploy API"**
2. Configure Deployment:
   - **Deployment stage**: Select **"[New Stage]"**
   - **Stage name**: `prod`
   - **Stage description**: `Production stage`
   - **Deployment description**: `Initial deployment`
3. Click **"Deploy"**

**Expected Result**: You should see a success message and the **Invoke URL** displayed.

**Important**: Copy the **Invoke URL** - you'll need it for the frontend!

Example Invoke URL format:
```
https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

---

## Step 6: Test the API Endpoints

### 6.1 Test POST `/v1/events`

```bash
# Replace YOUR_API_ID with your actual API Gateway ID
API_ENDPOINT="https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod"

curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": "data"
    },
    "source": "test-source"
  }'
```

**Expected Response** (201 Created):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "timestamp": "2025-01-27T12:00:00Z",
  "message": "Event ingested successfully"
}
```

### 6.2 Test GET `/v1/events/inbox`

```bash
curl "$API_ENDPOINT/v1/events/inbox?limit=10"
```

**Expected Response** (200 OK):
```json
{
  "events": [...],
  "total": 0,
  "limit": 10,
  "offset": 0
}
```

### 6.3 Test POST `/v1/events/{id}/ack`

```bash
# Replace EVENT_ID with an actual event ID from previous response
curl -X POST "$API_ENDPOINT/v1/events/EVENT_ID/ack"
```

**Expected Response** (200 OK):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}
```

---

## Step 7: Update Frontend Configuration

Once you have the API endpoint, update your frontend to use it:

1. Create or update `.env.production` in your project root:
   ```bash
   NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
   ```

2. The frontend API client (`lib/api.ts`) already uses this environment variable:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
   ```

3. Rebuild and deploy your frontend (see deployment guide)

---

## Troubleshooting

### Issue: "Method not found" error

**Solution**: Make sure you created the method on the correct resource. Check the resource path in the URL.

### Issue: CORS errors in browser

**Solution**: 
1. Verify CORS is enabled on all resources
2. Check that OPTIONS methods were created automatically
3. Verify the frontend is using the correct API endpoint

### Issue: Lambda function not found

**Solution**: 
1. Verify Lambda function name is exactly `zapier-triggers-api`
2. Check that the function exists in the same region (`us-east-1`)
3. Verify IAM role has proper permissions

### Issue: 500 Internal Server Error

**Solution**:
1. Check CloudWatch logs for the Lambda function:
   ```bash
   aws logs tail /aws/lambda/zapier-triggers-api --follow
   ```
2. Verify DynamoDB table name matches: `zapier-triggers-events`
3. Check Lambda environment variables

### Issue: 403 Forbidden

**Solution**:
1. Verify API Gateway has permission to invoke Lambda
2. Check IAM role permissions
3. Verify Lambda function is in the same region

---

## Quick Reference

### API Endpoints

- **POST** `/v1/events` - Create a new event
- **GET** `/v1/events/inbox` - Get pending events
- **POST** `/v1/events/{id}/ack` - Acknowledge an event

### Get API Endpoint

```bash
# Get your API Gateway ID
aws apigateway get-rest-apis --query 'items[?name==`zapier-triggers-api`].id' --output text

# Construct endpoint
API_ID="YOUR_API_ID"
ENDPOINT="https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod"
echo $ENDPOINT
```

### View API Gateway Resources

```bash
# List all APIs
aws apigateway get-rest-apis

# Get resources for your API
API_ID="YOUR_API_ID"
aws apigateway get-resources --rest-api-id $API_ID
```

---

## Next Steps

After completing this guide:

1. ✅ Test all API endpoints
2. ✅ Deploy frontend (see `QUICK_DEPLOY.md`)
3. ✅ Configure custom domain (optional)
4. ✅ Set up API authentication (API keys)
5. ✅ Configure rate limiting
6. ✅ Set up monitoring and alerts

---

**Deployment Complete! 🎉**

Your API Gateway is now set up and ready to receive requests from your frontend.

