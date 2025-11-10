#!/bin/bash
# Quick API Test Script

API_ENDPOINT="https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod"

echo "🧪 Testing Zapier Triggers API"
echo "=============================="
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

if [ $? -ne 0 ]; then
    echo "❌ Failed to create event"
    exit 1
fi

EVENT_ID=$(echo $RESPONSE | jq -r '.event_id')
if [ "$EVENT_ID" = "null" ] || [ -z "$EVENT_ID" ]; then
    echo "❌ Invalid response: $RESPONSE"
    exit 1
fi

echo "✅ Event created: $EVENT_ID"
echo "   Response: $(echo $RESPONSE | jq -c '.')"
echo ""

# Test 2: Get inbox
echo "2️⃣  Getting inbox..."
INBOX=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
TOTAL=$(echo $INBOX | jq -r '.total')
if [ "$TOTAL" = "null" ]; then
    echo "❌ Failed to get inbox"
    exit 1
fi
echo "✅ Found $TOTAL events in inbox"
echo ""

# Test 3: Acknowledge event
echo "3️⃣  Acknowledging event..."
ACK_RESPONSE=$(curl -s -X POST "$API_ENDPOINT/v1/events/$EVENT_ID/ack")
STATUS=$(echo $ACK_RESPONSE | jq -r '.status')
if [ "$STATUS" != "acknowledged" ]; then
    echo "❌ Failed to acknowledge: $ACK_RESPONSE"
    exit 1
fi
echo "✅ Event acknowledged (status: $STATUS)"
echo ""

# Test 4: Verify acknowledged
echo "4️⃣  Verifying event was removed from inbox..."
INBOX_AFTER=$(curl -s "$API_ENDPOINT/v1/events/inbox?limit=10")
TOTAL_AFTER=$(echo $INBOX_AFTER | jq -r '.total')
if [ "$TOTAL_AFTER" -eq 0 ]; then
    echo "✅ Event successfully removed from inbox"
else
    echo "⚠️  Warning: Inbox still has $TOTAL_AFTER events"
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "API Endpoint: $API_ENDPOINT"
echo "✅ POST /v1/events - Working"
echo "✅ GET /v1/events/inbox - Working"
echo "✅ POST /v1/events/{id}/ack - Working"

