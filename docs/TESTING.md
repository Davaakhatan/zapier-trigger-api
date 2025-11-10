# Testing Guide - Zapier Triggers API

**Complete testing guide for frontend and backend**

---

## 🎯 Quick Test Checklist

- [ ] Backend API is deployed and working
- [ ] Frontend is deployed to Amplify
- [ ] CORS is configured correctly
- [ ] API Gateway is accessible
- [ ] Frontend can fetch events

---

## 1. Test Backend API Directly

### Test Health Check

```bash
curl https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Zapier Triggers API",
  "version": "1.0.0"
}
```

### Test Event Creation (POST /v1/events)

```bash
curl -X POST "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "orderId": "12345",
      "amount": 299.99,
      "customer": "John Doe"
    },
    "source": "payment-system",
    "tags": ["order", "payment"]
  }'
```

**Expected Response:**
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "timestamp": "2025-01-27T12:00:00Z",
  "message": "Event ingested successfully"
}
```

**Save the `event_id` for next tests!**

### Test Event Inbox (GET /v1/events/inbox)

```bash
curl "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/inbox?limit=100"
```

**Expected Response:**
```json
{
  "events": [
    {
      "event_id": "550e8400-e29b-41d4-a716-446655440000",
      "payload": {...},
      "status": "pending",
      "created_at": "2025-01-27T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

### Test Event Acknowledgment (POST /v1/events/{id}/ack)

```bash
# Replace EVENT_ID with the event_id from previous response
curl -X POST "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/550e8400-e29b-41d4-a716-446655440000/ack"
```

**Expected Response:**
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}
```

### Test CORS Headers

```bash
curl -X GET "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/inbox?limit=100" \
  -H "Origin: https://main.dib8qm74qn70a.amplifyapp.com" \
  -v 2>&1 | grep -i "access-control"
```

**Expected Headers:**
```
access-control-allow-origin: https://main.dib8qm74qn70a.amplifyapp.com
access-control-allow-credentials: true
```

---

## 2. Test Frontend (Amplify)

### Get Your Amplify URL

1. Go to: https://console.aws.amazon.com/amplify
2. Select your app: `zapier-triggers-frontend`
3. Copy the app URL (e.g., `https://main.dib8qm74qn70a.amplifyapp.com`)

### Test Frontend Features

1. **Open Frontend URL**
   - Navigate to your Amplify app URL
   - Should load without errors

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Should see no CORS errors
   - Should see API calls being made

3. **Test Event Inbox**
   - Click on "Inbox" tab
   - Should display events (or empty state)
   - Events should auto-refresh every 30 seconds

4. **Test Event Acknowledgment**
   - If events are present, click "Acknowledge" button
   - Event should disappear from the list
   - Check browser console for success messages

5. **Test Event Creation** (via API)
   - Use the curl command above to create an event
   - Refresh the frontend inbox
   - New event should appear

---

## 3. Test Full Workflow

### Complete Test Scenario

1. **Create an Event**
   ```bash
   curl -X POST "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events" \
     -H "Content-Type: application/json" \
     -d '{
       "payload": {
         "test": "frontend-integration",
         "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
       },
       "source": "test-script",
       "tags": ["test", "integration"]
     }'
   ```

2. **Verify in Frontend**
   - Open Amplify frontend
   - Navigate to Inbox
   - New event should appear within 30 seconds (or refresh manually)

3. **Acknowledge Event**
   - Click "Acknowledge" button in frontend
   - Event should disappear
   - Verify with API:
     ```bash
     curl "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/inbox?limit=100"
     ```
   - Event should not appear in inbox (status = "acknowledged")

---

## 4. Troubleshooting Tests

### Backend Not Responding

1. **Check Lambda Function**
   ```bash
   aws lambda get-function --function-name zapier-triggers-api --region us-east-1
   ```

2. **Check Lambda Logs**
   ```bash
   aws logs tail /aws/lambda/zapier-triggers-api --since 10m --region us-east-1
   ```

3. **Check API Gateway**
   - Go to: https://console.aws.amazon.com/apigateway
   - Check if API is deployed
   - Verify routes are configured

### CORS Errors

1. **Check Lambda Environment Variables**
   ```bash
   aws lambda get-function-configuration \
     --function-name zapier-triggers-api \
     --region us-east-1 \
     --query 'Environment.Variables.CORS_ORIGINS' \
     --output text
   ```

2. **Verify CORS Headers**
   ```bash
   curl -X OPTIONS "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/inbox" \
     -H "Origin: https://main.dib8qm74qn70a.amplifyapp.com" \
     -H "Access-Control-Request-Method: GET" \
     -v 2>&1 | grep -i "access-control"
   ```

### Frontend Not Loading

1. **Check Amplify Build Logs**
   - Go to Amplify Console
   - Click on "Build history"
   - Check latest build for errors

2. **Verify Environment Variables**
   - In Amplify Console → App settings → Environment variables
   - Verify `NEXT_PUBLIC_API_URL` is set correctly

3. **Check Browser Network Tab**
   - Open Developer Tools → Network tab
   - Look for failed requests
   - Check response headers

---

## 5. Automated Testing Script

Create a test script `test-api.sh`:

```bash
#!/bin/bash

API_URL="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

echo "🧪 Testing Zapier Triggers API"
echo "================================"

# Test Health
echo ""
echo "1. Testing Health Check..."
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq '.'

# Test Event Creation
echo ""
echo "2. Creating Test Event..."
EVENT_RESPONSE=$(curl -s -X POST "$API_URL/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"test": "automated-test"},
    "source": "test-script",
    "tags": ["test"]
  }')
echo "$EVENT_RESPONSE" | jq '.'
EVENT_ID=$(echo "$EVENT_RESPONSE" | jq -r '.event_id')
echo "Event ID: $EVENT_ID"

# Test Inbox
echo ""
echo "3. Testing Inbox..."
INBOX=$(curl -s "$API_URL/v1/events/inbox?limit=100")
echo "$INBOX" | jq '.'

# Test Acknowledgment
if [ "$EVENT_ID" != "null" ]; then
  echo ""
  echo "4. Acknowledging Event..."
  ACK=$(curl -s -X POST "$API_URL/v1/events/$EVENT_ID/ack")
  echo "$ACK" | jq '.'
fi

# Test CORS
echo ""
echo "5. Testing CORS..."
CORS=$(curl -s -X GET "$API_URL/v1/events/inbox?limit=100" \
  -H "Origin: https://main.dib8qm74qn70a.amplifyapp.com" \
  -v 2>&1 | grep -i "access-control")
echo "$CORS"

echo ""
echo "✅ Testing Complete!"
```

Make it executable:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 6. Expected Results

### ✅ Success Indicators

- **Backend**: All API endpoints return 200/201 status codes
- **Frontend**: Loads without console errors
- **CORS**: No CORS errors in browser console
- **Events**: Can create, view, and acknowledge events
- **Real-time**: Events appear in frontend within 30 seconds

### ❌ Common Issues

- **502 Bad Gateway**: Lambda function error (check logs)
- **CORS Error**: CORS_ORIGINS not set correctly in Lambda
- **404 Not Found**: API Gateway route not configured
- **Empty Inbox**: No events created yet (create one first)

---

## 7. Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Test frontend-backend integration
3. ✅ Verify CORS is working
4. ✅ Test event lifecycle (create → view → acknowledge)
5. ✅ Monitor CloudWatch logs for errors

---

**Your API Endpoint**: `https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod`  
**Your Amplify URL**: `https://main.dib8qm74qn70a.amplifyapp.com`

**Ready to test!** 🚀

