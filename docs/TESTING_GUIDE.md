# Testing Guide - Zapier Triggers API

**Complete guide for testing your deployed API**

---

## Quick Test

### 1. Test API Endpoints

```bash
# Set your API endpoint
API_ENDPOINT="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

# Test 1: Create an event
curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": "data",
      "message": "Hello from API!"
    },
    "source": "test-source"
  }'

# Test 2: Get inbox (should show the event you just created)
curl "$API_ENDPOINT/v1/events/inbox?limit=10"

# Test 3: Acknowledge an event (use event_id from Test 2)
curl -X POST "$API_ENDPOINT/v1/events/EVENT_ID/ack"

# Test 4: Verify event was acknowledged (should be empty)
curl "$API_ENDPOINT/v1/events/inbox?limit=10"
```

---

## Automated Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash
API_ENDPOINT="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

echo "🧪 Testing Zapier Triggers API..."
echo ""

# Test 1: Create event
echo "1️⃣  Creating event..."
RESPONSE=$(curl -s -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "test": "data",
      "message": "Automated test"
    },
    "source": "test-script"
  }')

EVENT_ID=$(echo $RESPONSE | jq -r '.event_id')
echo "✅ Event created: $EVENT_ID"
echo ""

# Test 2: Get inbox
echo "2️⃣  Getting inbox..."
INBOX=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
TOTAL=$(echo $INBOX | jq -r '.total')
echo "✅ Found $TOTAL events in inbox"
echo ""

# Test 3: Acknowledge event
echo "3️⃣  Acknowledging event..."
ACK_RESPONSE=$(curl -s -X POST "$API_ENDPOINT/v1/events/$EVENT_ID/ack")
STATUS=$(echo $ACK_RESPONSE | jq -r '.status')
echo "✅ Event status: $STATUS"
echo ""

# Test 4: Verify acknowledged
echo "4️⃣  Verifying event was acknowledged..."
INBOX_AFTER=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
TOTAL_AFTER=$(echo $INBOX_AFTER | jq -r '.total')
if [ "$TOTAL_AFTER" -eq 0 ]; then
    echo "✅ Event successfully removed from inbox"
else
    echo "⚠️  Warning: Event still in inbox"
fi

echo ""
echo "🎉 All tests completed!"
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Test from Frontend

### 1. Update Frontend Environment

Create `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

### 2. Run Frontend Locally

```bash
# Install dependencies (if not already done)
pnpm install

# Run development server
pnpm dev
```

### 3. Test in Browser

1. Open http://localhost:3000
2. Navigate to Event Inbox
3. Create a test event
4. Verify it appears in the inbox
5. Acknowledge the event
6. Verify it disappears

---

## Test Lambda Function Directly

### Test via AWS CLI

```bash
# Test Lambda function directly
aws lambda invoke \
  --function-name zapier-triggers-api \
  --payload '{
    "httpMethod": "POST",
    "path": "/v1/events",
    "headers": {"Content-Type": "application/json"},
    "body": "{\"payload\":{\"test\":\"data\"},\"source\":\"cli-test\"}"
  }' \
  /tmp/lambda-response.json

cat /tmp/lambda-response.json
```

### View Lambda Logs

```bash
# View recent logs
aws logs tail /aws/lambda/zapier-triggers-api --follow

# View last 50 lines
aws logs tail /aws/lambda/zapier-triggers-api --since 1h | tail -50
```

---

## Test DynamoDB

### Check Events in DynamoDB

```bash
# Scan table (for testing only - use query in production)
aws dynamodb scan \
  --table-name zapier-triggers-events \
  --limit 5 \
  --region us-east-1

# Get specific event
aws dynamodb get-item \
  --table-name zapier-triggers-events \
  --key '{"event_id": {"S": "YOUR_EVENT_ID"}}' \
  --region us-east-1
```

---

## Integration Test Flow

### Complete End-to-End Test

```bash
#!/bin/bash
API_ENDPOINT="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

echo "🔄 End-to-End Integration Test"
echo "================================"
echo ""

# Step 1: Create multiple events
echo "Step 1: Creating 3 test events..."
for i in {1..3}; do
  curl -s -X POST "$API_ENDPOINT/v1/events" \
    -H "Content-Type: application/json" \
    -d "{\"payload\":{\"number\":$i},\"source\":\"e2e-test\"}" > /dev/null
done
echo "✅ Created 3 events"
echo ""

# Step 2: Verify all in inbox
echo "Step 2: Checking inbox..."
INBOX=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
TOTAL=$(echo $INBOX | jq -r '.total')
echo "✅ Found $TOTAL events"
echo ""

# Step 3: Acknowledge all
echo "Step 3: Acknowledging all events..."
EVENT_IDS=$(echo $INBOX | jq -r '.events[].id')
for EVENT_ID in $EVENT_IDS; do
  curl -s -X POST "$API_ENDPOINT/v1/events/$EVENT_ID/ack" > /dev/null
done
echo "✅ Acknowledged all events"
echo ""

# Step 4: Verify inbox is empty
echo "Step 4: Verifying inbox is empty..."
FINAL_INBOX=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
FINAL_TOTAL=$(echo $FINAL_INBOX | jq -r '.total')
if [ "$FINAL_TOTAL" -eq 0 ]; then
  echo "✅ Inbox is empty - all events acknowledged"
else
  echo "❌ Inbox still has $FINAL_TOTAL events"
fi

echo ""
echo "🎉 Integration test complete!"
```

---

## Performance Testing

### Load Test (Simple)

```bash
# Create 10 events quickly
for i in {1..10}; do
  curl -X POST "$API_ENDPOINT/v1/events" \
    -H "Content-Type: application/json" \
    -d "{\"payload\":{\"load_test\":$i}}" &
done
wait
echo "✅ Created 10 events concurrently"
```

### Response Time Test

```bash
# Measure response time
time curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{"payload":{"test":"data"}}'
```

---

## Error Testing

### Test Invalid Requests

```bash
# Missing payload
curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid JSON
curl -X POST "$API_ENDPOINT/v1/events" \
  -H "Content-Type: application/json" \
  -d '{invalid json}'

# Invalid event ID
curl -X POST "$API_ENDPOINT/v1/events/invalid-id/ack"
```

---

## Monitoring Tests

### Check CloudWatch Metrics

```bash
# Get Lambda invocation count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=zapier-triggers-api \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region us-east-1

# Get API Gateway request count
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=zapier-triggers-api \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

---

## Quick Test Commands

```bash
# One-liner: Create and verify event
API="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod" && \
EVENT=$(curl -s -X POST "$API/v1/events" -H "Content-Type: application/json" -d '{"payload":{"quick":"test"}}') && \
echo $EVENT | jq && \
ID=$(echo $EVENT | jq -r '.event_id') && \
curl -s "$API/v1/events/inbox?limit=1" | jq '.events[0].id' && \
curl -s -X POST "$API/v1/events/$ID/ack" | jq
```

---

## Expected Results

### Successful Response Examples

**POST /v1/events** (201 Created):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "created",
  "timestamp": "2025-11-10T18:00:00Z",
  "message": "Event ingested successfully"
}
```

**GET /v1/events/inbox** (200 OK):
```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-11-10T18:00:00Z",
      "payload": {"test": "data"},
      "source": "test-source",
      "status": "pending"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**POST /v1/events/{id}/ack** (200 OK):
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "acknowledged",
  "message": "Event acknowledged successfully"
}
```

---

## Troubleshooting

### API Returns 500 Error

1. Check Lambda logs:
   ```bash
   aws logs tail /aws/lambda/zapier-triggers-api --follow
   ```

2. Check API Gateway logs:
   - Go to API Gateway Console → zapier-triggers-api → Logs

3. Verify DynamoDB table exists:
   ```bash
   aws dynamodb describe-table --table-name zapier-triggers-events
   ```

### Events Not Appearing

1. Check DynamoDB:
   ```bash
   aws dynamodb scan --table-name zapier-triggers-events --limit 5
   ```

2. Verify GSI exists:
   ```bash
   aws dynamodb describe-table --table-name zapier-triggers-events \
     --query 'Table.GlobalSecondaryIndexes'
   ```

### CORS Errors

1. Verify CORS is enabled in API Gateway
2. Check frontend is using correct API URL
3. Verify Lambda environment variable `CORS_ORIGINS`

---

**Ready to test!** 🚀

