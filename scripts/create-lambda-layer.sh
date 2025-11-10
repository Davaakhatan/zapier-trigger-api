#!/bin/bash
# Create Lambda Layer with dependencies (AWS-native solution)
# This builds the layer in a Lambda-compatible environment

set -e

echo "📦 Creating Lambda Layer for dependencies..."

LAYER_NAME="zapier-triggers-deps"
REGION="us-east-1"
LAYER_DIR="layer-package"
ZIP_FILE="layer.zip"

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Clean up
rm -rf "$LAYER_DIR" "$ZIP_FILE"

# Create layer structure (Lambda requires python/lib/python3.9/site-packages/)
echo "📋 Creating layer structure..."
mkdir -p "$LAYER_DIR/python/lib/python3.9/site-packages"

# Install dependencies into layer directory
echo "📥 Installing dependencies..."
pip install -r requirements.txt -t "$LAYER_DIR/python/lib/python3.9/site-packages/" --quiet

# Remove unnecessary files
echo "🧹 Cleaning up..."
find "$LAYER_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$LAYER_DIR" -type f -name "*.pyc" -delete
find "$LAYER_DIR" -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find "$LAYER_DIR" -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true

# Fix annotated_doc import issue
echo "🔧 Fixing annotated_doc import issue..."
if [ -f "$LAYER_DIR/python/lib/python3.9/site-packages/annotated_doc/__init__.py" ]; then
    cat > "$LAYER_DIR/python/lib/python3.9/site-packages/annotated_doc/__init__.py" << 'EOF'
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
echo "📦 Creating layer package..."
cd "$LAYER_DIR"
zip -r "../$ZIP_FILE" . -q
cd ..

# Get package size
PACKAGE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "✅ Layer package created: $ZIP_FILE ($PACKAGE_SIZE)"

# Check if layer exists
EXISTING_LAYER=$(aws lambda list-layers --region "$REGION" --query "Layers[?LayerName=='$LAYER_NAME'].LatestMatchingVersion.LayerVersionArn" --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_LAYER" ]; then
    echo "🔄 Layer already exists. Creating new version..."
fi

# Publish layer
echo "📤 Publishing Lambda Layer..."
LAYER_ARN=$(aws lambda publish-layer-version \
    --layer-name "$LAYER_NAME" \
    --description "Dependencies for Zapier Triggers API" \
    --zip-file "fileb://$ZIP_FILE" \
    --compatible-runtimes python3.9 \
    --region "$REGION" \
    --query 'LayerVersionArn' \
    --output text)

echo "✅ Layer published: $LAYER_ARN"

# Update Lambda function to use the layer
echo "🔗 Attaching layer to Lambda function..."
aws lambda update-function-configuration \
    --function-name zapier-triggers-api \
    --layers "$LAYER_ARN" \
    --region "$REGION" \
    --output json > /dev/null

echo "⏳ Waiting for Lambda update..."
aws lambda wait function-updated \
    --function-name zapier-triggers-api \
    --region "$REGION"

echo "✅ Lambda function updated with layer!"

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf "$LAYER_DIR"

echo ""
echo "🎉 Lambda Layer created and attached!"
echo "📝 Layer ARN: $LAYER_ARN"
echo ""
echo "💡 Tip: Now you can deploy code-only updates without rebuilding dependencies:"
echo "   ./scripts/deploy-lambda-code-only.sh"

