#!/bin/bash
# Docker-based Lambda deployment script
# This ensures Linux-compatible binaries for compiled extensions

set -e

echo "🐳 Starting Docker-based Lambda deployment..."

FUNCTION_NAME="zapier-triggers-api"
REGION="us-east-1"
DEPLOY_DIR="lambda-package"
ZIP_FILE="lambda-deployment.zip"

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

echo "📦 Creating deployment package using Docker..."

# Clean up previous deployment
rm -rf "$DEPLOY_DIR" "$ZIP_FILE"

# Create deployment directory
mkdir -p "$DEPLOY_DIR"

# Copy source code
echo "📋 Copying source files..."
cp -r src "$DEPLOY_DIR/"
cp requirements.txt "$DEPLOY_DIR/"
cp lambda_handler.py "$DEPLOY_DIR/"

# Use Docker to install dependencies in Linux environment
echo "🐳 Installing dependencies in Docker (Linux environment)..."
docker run --rm \
  --entrypoint /bin/bash \
  -v "$(pwd)/$DEPLOY_DIR:/var/task" \
  -w /var/task \
  public.ecr.aws/lambda/python:3.9 \
  -c "
    pip install -r requirements.txt -t . --quiet && \
    find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true && \
    find . -type f -name '*.pyc' -delete && \
    find . -type d -name '*.dist-info' -exec rm -rf {} + 2>/dev/null || true && \
    find . -type d -name 'tests' -exec rm -rf {} + 2>/dev/null || true
  "

# Fix annotated_doc import issue
echo "🔧 Fixing annotated_doc import issue..."
if [ -f "$DEPLOY_DIR/annotated_doc/__init__.py" ]; then
    cat > "$DEPLOY_DIR/annotated_doc/__init__.py" << 'EOF'
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
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf "$DEPLOY_DIR"

echo "🎉 Deployment complete!"

