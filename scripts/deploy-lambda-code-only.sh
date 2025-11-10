#!/bin/bash
# Deploy Lambda function code only (dependencies are in a layer)
# This is much faster and smaller since we don't include dependencies

set -e

echo "🚀 Deploying Lambda function code (dependencies in layer)..."

FUNCTION_NAME="zapier-triggers-api"
REGION="us-east-1"
DEPLOY_DIR="lambda-code-package"
ZIP_FILE="lambda-code.zip"

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

echo "📦 Creating code-only deployment package..."

# Clean up previous deployment
rm -rf "$DEPLOY_DIR" "$ZIP_FILE"

# Create deployment directory
mkdir -p "$DEPLOY_DIR"

# Copy only source code (no dependencies)
echo "📋 Copying source files..."
cp -r src "$DEPLOY_DIR/"
cp lambda_handler.py "$DEPLOY_DIR/"

# Create zip file
echo "📦 Creating deployment package..."
cd "$DEPLOY_DIR"
zip -r "../$ZIP_FILE" . -q
cd ..

# Get package size
PACKAGE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "✅ Package created: $ZIP_FILE ($PACKAGE_SIZE)"

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
    echo "🔄 Updating Lambda function code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://$ZIP_FILE" \
        --region "$REGION" \
        --output json | jq -r '.LastUpdateStatus'
    
    echo "⏳ Waiting for update to complete..."
    aws lambda wait function-updated \
        --function-name "$FUNCTION_NAME" \
        --region "$REGION"
    
    echo "✅ Lambda function updated successfully!"
else
    echo "❌ Lambda function '$FUNCTION_NAME' not found."
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf "$DEPLOY_DIR"

echo "🎉 Deployment complete!"

