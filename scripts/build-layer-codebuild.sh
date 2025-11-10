#!/bin/bash
# Build Lambda Layer using AWS CodeBuild (100% AWS-native)

set -e

echo "🏗️  Building Lambda Layer with AWS CodeBuild..."

PROJECT_NAME="zapier-triggers-layer-builder"
REGION="us-east-1"
BUCKET_NAME="zapier-triggers-codebuild-$(aws sts get-caller-identity --query Account --output text)"
SOURCE_KEY="backend-source.zip"

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

# Create S3 bucket if it doesn't exist
echo "📦 Setting up S3 bucket for source code..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "✅ Bucket already exists"
else
    echo "Creating bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Bucket created"
fi

# Create source zip (must include buildspec.yml)
echo "📋 Creating source package..."
cd backend || exit 1
rm -f /tmp/backend-source.zip
if ! zip -r /tmp/backend-source.zip . -x "*.pyc" "__pycache__/*" "*.dist-info/*" "venv/*" "lambda-package/*" "layer-package/*" "*.zip" "test_extract/*" > /dev/null 2>&1; then
    echo "❌ Failed to create source zip"
    exit 1
fi
# Ensure buildspec is included
if ! zip -u /tmp/backend-source.zip buildspec-layer.yml > /dev/null 2>&1; then
    echo "⚠️  Warning: Could not add buildspec-layer.yml (may already be included)"
fi
cd .. || exit 1
echo "✅ Source package created"

# Upload to S3
echo "📤 Uploading source to S3..."
aws s3 cp /tmp/backend-source.zip "s3://$BUCKET_NAME/$SOURCE_KEY"

# Update CodeBuild project to use S3 source
echo "🔧 Updating CodeBuild project..."
aws codebuild update-project \
    --name "$PROJECT_NAME" \
    --region "$REGION" \
    --source type=S3,location="$BUCKET_NAME/$SOURCE_KEY" \
    --output json > /dev/null

# Start build
echo "🚀 Starting CodeBuild..."
BUILD_ID=$(aws codebuild start-build \
    --project-name "$PROJECT_NAME" \
    --region "$REGION" \
    --query 'build.id' \
    --output text)

echo "✅ Build started: $BUILD_ID"
echo ""
echo "⏳ Waiting for build to complete..."
echo "   (This may take 5-10 minutes)"
echo ""

# Wait for build
BUILD_STATUS="IN_PROGRESS"
while [ "$BUILD_STATUS" = "IN_PROGRESS" ] || [ "$BUILD_STATUS" = "QUEUED" ]; do
    sleep 10
    BUILD_STATUS=$(aws codebuild batch-get-builds \
        --ids "$BUILD_ID" \
        --region "$REGION" \
        --query 'builds[0].buildStatus' \
        --output text)
    echo "   Build status: $BUILD_STATUS"
done

# Check result
if [ "$BUILD_STATUS" = "SUCCEEDED" ]; then
    echo ""
    echo "✅ Build succeeded!"
    echo ""
    echo "📥 Downloading layer..."
    
    # Get artifact location
    ARTIFACT_LOCATION=$(aws codebuild batch-get-builds \
        --ids "$BUILD_ID" \
        --region "$REGION" \
        --query 'builds[0].artifacts.location' \
        --output text)
    
    if [ -n "$ARTIFACT_LOCATION" ] && [ "$ARTIFACT_LOCATION" != "None" ]; then
        # Download from S3 (artifact is at bucket/layer.zip)
        aws s3 cp "s3://$BUCKET_NAME/layer.zip" /tmp/layer.zip
        echo "✅ Layer downloaded to /tmp/layer.zip"
        
        # Publish layer
        echo "📤 Publishing Lambda Layer..."
        LAYER_ARN=$(aws lambda publish-layer-version \
            --layer-name zapier-triggers-deps \
            --description "Dependencies for Zapier Triggers API (built with CodeBuild)" \
            --zip-file fileb:///tmp/layer.zip \
            --compatible-runtimes python3.9 \
            --region "$REGION" \
            --query 'LayerVersionArn' \
            --output text)
        
        echo "✅ Layer published: $LAYER_ARN"
        
        # Update Lambda function
        echo "🔗 Attaching layer to Lambda function..."
        aws lambda update-function-configuration \
            --function-name zapier-triggers-api \
            --layers "$LAYER_ARN" \
            --region "$REGION" \
            --output json > /dev/null
        
        echo "✅ Lambda function updated!"
    else
        echo "⚠️  No artifact found. Check CodeBuild logs."
    fi
else
    echo ""
    echo "❌ Build failed with status: $BUILD_STATUS"
    echo ""
    echo "📋 View logs:"
    echo "   aws codebuild batch-get-builds --ids $BUILD_ID --region $REGION"
    exit 1
fi

echo ""
echo "🎉 Lambda Layer built and deployed using 100% AWS-native services!"

