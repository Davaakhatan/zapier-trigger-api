#!/bin/bash
# AWS Infrastructure Setup Script
# Usage: ./scripts/setup-aws.sh

set -e

echo "🏗️  Setting up AWS infrastructure for Zapier Triggers API..."

REGION="us-east-1"
TABLE_NAME="zapier-triggers-events"
FUNCTION_NAME="zapier-triggers-api"
ROLE_NAME="zapier-triggers-lambda-role"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Step 1: Create DynamoDB Table
echo ""
echo "📊 Step 1: Creating DynamoDB table..."

if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Table '$TABLE_NAME' already exists${NC}"
else
    echo "Creating table: $TABLE_NAME"
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions \
            AttributeName=event_id,AttributeType=S \
            AttributeName=status,AttributeType=S \
            AttributeName=created_at,AttributeType=N \
        --key-schema \
            AttributeName=event_id,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --global-secondary-indexes \
            'IndexName=status-created_at-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL}' \
        --region "$REGION" \
        --output json > /dev/null
    
    echo "⏳ Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    echo -e "${GREEN}✅ DynamoDB table created${NC}"
fi

# Step 2: Create IAM Role
echo ""
echo "🔐 Step 2: Creating IAM role..."

if aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Role '$ROLE_NAME' already exists${NC}"
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
else
    echo "Creating IAM role: $ROLE_NAME"
    
    # Create trust policy
    cat > /tmp/lambda-trust-policy.json <<EOF
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
    ROLE_ARN=$(aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
        --query 'Role.Arn' \
        --output text)
    
    # Attach policies
    echo "Attaching policies..."
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    echo -e "${GREEN}✅ IAM role created: $ROLE_ARN${NC}"
fi

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 5

# Step 3: Create Lambda Function (if deployment package exists)
echo ""
echo "⚡ Step 3: Creating Lambda function..."

if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Lambda function '$FUNCTION_NAME' already exists${NC}"
    echo "Run './scripts/deploy-lambda.sh' to update the function code."
else
    DEPLOYMENT_ZIP="backend/lambda-deployment.zip"
    
    if [ ! -f "$DEPLOYMENT_ZIP" ]; then
        echo -e "${YELLOW}⚠️  Deployment package not found.${NC}"
        echo "Please run './scripts/deploy-lambda.sh' first to create the package,"
        echo "or create it manually by following the deployment guide."
        exit 1
    fi
    
    echo "Creating Lambda function: $FUNCTION_NAME"
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime python3.9 \
        --role "$ROLE_ARN" \
        --handler lambda_handler.handler \
        --zip-file "fileb://$DEPLOYMENT_ZIP" \
        --timeout 30 \
        --memory-size 512 \
        --environment "Variables={
            AWS_REGION=$REGION,
            DYNAMODB_TABLE_NAME=$TABLE_NAME,
            DEBUG=false
        }" \
        --region "$REGION" \
        --output json > /dev/null
    
    echo -e "${GREEN}✅ Lambda function created${NC}"
fi

# Step 4: Create CloudWatch Log Group
echo ""
echo "📝 Step 4: Creating CloudWatch log group..."

LOG_GROUP="/aws/lambda/$FUNCTION_NAME"
if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region "$REGION" --query "logGroups[?logGroupName=='$LOG_GROUP']" --output text | grep -q "$LOG_GROUP"; then
    echo -e "${YELLOW}⚠️  Log group already exists${NC}"
else
    aws logs create-log-group \
        --log-group-name "$LOG_GROUP" \
        --region "$REGION" \
        --output json > /dev/null
    echo -e "${GREEN}✅ CloudWatch log group created${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Infrastructure setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy Lambda code: ./scripts/deploy-lambda.sh"
echo "2. Set up API Gateway (see docs/AWS_DEPLOYMENT.md)"
echo "3. Deploy frontend (see docs/AWS_DEPLOYMENT.md)"

