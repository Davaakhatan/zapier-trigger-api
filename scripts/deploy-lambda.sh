#!/bin/bash
# Deployment script for Lambda function
# Usage: ./scripts/deploy-lambda.sh

set -e

echo "🚀 Starting Lambda deployment..."

# Configuration
FUNCTION_NAME="zapier-triggers-api"
REGION="us-east-1"
DEPLOY_DIR="lambda-package"
ZIP_FILE="lambda-deployment.zip"

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

echo "📦 Creating deployment package..."

# Clean up previous deployment
rm -rf "$DEPLOY_DIR" "$ZIP_FILE"

# Create deployment directory
mkdir -p "$DEPLOY_DIR"

# Copy source code
echo "📋 Copying source files..."
cp -r src "$DEPLOY_DIR/"
cp requirements.txt "$DEPLOY_DIR/"
cp lambda_handler.py "$DEPLOY_DIR/"

# Install dependencies
# Note: For compiled extensions (like pydantic-core), we need Linux binaries
# If this fails, consider using Docker to build the package
echo "📥 Installing dependencies..."
cd "$DEPLOY_DIR"
pip install -r requirements.txt -t . --quiet

# Remove unnecessary files
echo "🧹 Cleaning up..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete
find . -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true

# Fix annotated_doc import issue for Lambda
echo "🔧 Fixing annotated_doc import issue..."
if [ -f "annotated_doc/__init__.py" ]; then
    cat > "annotated_doc/__init__.py" << 'EOF'
try:
    from importlib.metadata import version
    __version__ = version("annotated-doc")
except Exception:
    __version__ = "0.0.0"

from .main import Doc as Doc
EOF
    echo "✅ Fixed annotated_doc/__init__.py"
fi

# Create zip file
echo "📦 Creating deployment package..."
cd ..
cd "$DEPLOY_DIR"
zip -r "../$ZIP_FILE" . -q
cd ..

# Get package size
PACKAGE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "✅ Package created: $ZIP_FILE ($PACKAGE_SIZE)"

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
    echo "🔄 Updating existing Lambda function..."
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
    echo "Please create it first using the AWS Console or CLI."
    echo ""
    echo "To create the function, run:"
    echo "aws lambda create-function \\"
    echo "  --function-name $FUNCTION_NAME \\"
    echo "  --runtime python3.9 \\"
    echo "  --role <YOUR_ROLE_ARN> \\"
    echo "  --handler lambda_handler.handler \\"
    echo "  --zip-file fileb://$ZIP_FILE \\"
    echo "  --timeout 30 \\"
    echo "  --memory-size 512 \\"
    echo "  --region $REGION"
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf "$DEPLOY_DIR"

echo "🎉 Deployment complete!"

