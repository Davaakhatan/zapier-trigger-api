#!/bin/bash
# Setup AWS CodeBuild project to build Lambda Layer (100% AWS-native)
# This builds the layer in AWS's Linux environment

set -e

echo "🏗️  Setting up AWS CodeBuild for Lambda Layer..."

PROJECT_NAME="zapier-triggers-layer-builder"
REGION="us-east-1"
SERVICE_ROLE_NAME="codebuild-zapier-triggers-service-role"

# Check if CodeBuild project exists
if aws codebuild list-projects --region "$REGION" --query "projects[?contains(@, '$PROJECT_NAME')]" --output text | grep -q "$PROJECT_NAME"; then
    echo "⚠️  CodeBuild project already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Create IAM role for CodeBuild if it doesn't exist
echo "🔐 Creating IAM role for CodeBuild..."
if ! aws iam get-role --role-name "$SERVICE_ROLE_NAME" &>/dev/null; then
    # Create trust policy
    cat > /tmp/codebuild-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    aws iam create-role \
        --role-name "$SERVICE_ROLE_NAME" \
        --assume-role-policy-document file:///tmp/codebuild-trust-policy.json \
        --output json > /dev/null

    # Attach policies
    aws iam attach-role-policy \
        --role-name "$SERVICE_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

    aws iam attach-role-policy \
        --role-name "$SERVICE_ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

    echo "✅ IAM role created"
else
    echo "✅ IAM role already exists"
fi

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name "$SERVICE_ROLE_NAME" --query 'Role.Arn' --output text)

# Create or update CodeBuild project
echo "📦 Creating CodeBuild project..."
cd "$(dirname "$0")/../backend" || exit 1

# Get account ID for S3 bucket
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="zapier-triggers-codebuild-$ACCOUNT_ID"

# Create S3 bucket for artifacts if it doesn't exist
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "✅ S3 bucket already exists"
else
    echo "Creating S3 bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ S3 bucket created"
fi

cat > /tmp/codebuild-project.json <<EOF
{
  "name": "$PROJECT_NAME",
  "description": "Build Lambda Layer for Zapier Triggers API",
  "source": {
    "type": "S3",
    "location": "$BUCKET_NAME/backend-source.zip"
  },
  "artifacts": {
    "type": "S3",
    "location": "$BUCKET_NAME",
    "packaging": "ZIP",
    "name": "layer.zip",
    "path": ""
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_SMALL",
    "privilegedMode": false
  },
  "serviceRole": "$ROLE_ARN"
}
EOF

if aws codebuild list-projects --region "$REGION" --query "projects[?contains(@, '$PROJECT_NAME')]" --output text | grep -q "$PROJECT_NAME"; then
    aws codebuild update-project --region "$REGION" --cli-input-json file:///tmp/codebuild-project.json > /dev/null
    echo "✅ CodeBuild project updated"
else
    aws codebuild create-project --region "$REGION" --cli-input-json file:///tmp/codebuild-project.json > /dev/null
    echo "✅ CodeBuild project created"
fi

echo ""
echo "🎉 CodeBuild project setup complete!"
echo ""
echo "To build the layer, run:"
echo "  ./scripts/build-layer-codebuild.sh"
echo ""
echo "Or manually:"
echo "  aws codebuild start-build --project-name $PROJECT_NAME --region $REGION"

