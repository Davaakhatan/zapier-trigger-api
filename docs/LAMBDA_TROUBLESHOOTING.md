# Lambda Deployment Troubleshooting

## Issue: `pydantic_core._pydantic_core` Module Not Found

**Error**: `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'`

**Cause**: This happens when building the Lambda package on macOS. The `pydantic-core` package contains compiled C extensions that are platform-specific. When built on macOS, they won't work on Lambda's Linux runtime.

**Solution**: Build the package using Docker to ensure Linux-compatible binaries.

### Option 1: Use Docker (Recommended)

```bash
# Build Lambda package using Docker
docker run --rm -v "$(pwd)/backend:/var/task" \
  public.ecr.aws/lambda/python:3.9 \
  /bin/bash -c "pip install -r requirements.txt -t . && zip -r lambda-deployment.zip . -x '*.pyc' '__pycache__/*'"

# Then upload to Lambda
aws lambda update-function-code \
  --function-name zapier-triggers-api \
  --zip-file fileb://backend/lambda-deployment.zip
```

### Option 2: Use AWS SAM

AWS SAM automatically handles cross-platform builds:

```bash
# Install SAM CLI
brew install aws-sam-cli

# Build
sam build

# Deploy
sam deploy
```

### Option 3: Use Lambda Layers

Create a Lambda Layer with the dependencies:

```bash
# Create layer
mkdir -p python/lib/python3.9/site-packages
pip install -r requirements.txt -t python/lib/python3.9/site-packages/
zip -r layer.zip python/

# Create layer in AWS
aws lambda publish-layer-version \
  --layer-name zapier-triggers-deps \
  --zip-file fileb://layer.zip \
  --compatible-runtimes python3.9

# Attach to function
aws lambda update-function-configuration \
  --function-name zapier-triggers-api \
  --layers arn:aws:lambda:us-east-1:ACCOUNT_ID:layer:zapier-triggers-deps:1
```

---

## Current Status

The deployment script (`scripts/deploy-lambda.sh`) works for pure Python packages but may have issues with compiled extensions when built on macOS.

**Workaround**: Use Docker or AWS SAM for building the package.

