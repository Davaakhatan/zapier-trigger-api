# AWS-Native Lambda Deployment Guide

**Complete guide for deploying Lambda using AWS-native services (no Docker required locally)**

---

## Problem

When building Lambda packages on macOS, compiled Python extensions (like `pydantic-core`) are built for macOS, not Linux. This causes `ModuleNotFoundError` when running in Lambda's Linux environment.

## Solution: Use AWS-Native Services

We have three AWS-native options:

1. **Lambda Layers** (Recommended) - Separate dependencies from code
2. **AWS CodeBuild** - Build in AWS's Linux environment
3. **AWS SAM** - Serverless Application Model with automatic builds

---

## Option 1: Lambda Layers (Current Solution)

### How It Works

- **Layer**: Contains all Python dependencies (built once)
- **Function Code**: Contains only your application code (small, fast updates)

### Setup (One-time)

```bash
# Create the layer (uses Docker locally, but only once)
./scripts/create-lambda-layer.sh
```

This creates a Lambda Layer with all dependencies. The layer is built using Docker locally, but once created, it's stored in AWS.

### Deploy Code Updates

After the layer is created, deploy code-only updates (much faster):

```bash
./scripts/deploy-lambda-code-only.sh
```

**Benefits:**
- ✅ Fast code deployments (no dependencies to rebuild)
- ✅ Small package size (~100KB vs 27MB)
- ✅ Dependencies cached in AWS
- ✅ Easy to update dependencies (rebuild layer)

---

## Option 2: AWS CodeBuild (100% AWS-Native)

### Setup

```bash
# One-time setup
./scripts/setup-codebuild-layer.sh
```

### Build Layer in AWS

```bash
# Build the layer in AWS CodeBuild (Linux environment)
aws codebuild start-build \
  --project-name zapier-triggers-layer-builder \
  --region us-east-1

# Wait for build, then download and publish layer
# (Script to automate this coming soon)
```

**Benefits:**
- ✅ 100% AWS-native (no Docker locally)
- ✅ Builds in AWS Linux environment
- ✅ Automatic builds via CI/CD
- ✅ No local dependencies

---

## Option 3: AWS SAM (Recommended for Production)

### Setup

1. **Install SAM CLI:**
   ```bash
   brew install aws-sam-cli
   ```

2. **Create `template.yaml`:**
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   
   Resources:
     ZapierTriggersAPI:
       Type: AWS::Serverless::Function
       Properties:
         FunctionName: zapier-triggers-api
         Runtime: python3.9
         Handler: lambda_handler.handler
         CodeUri: ./
         Environment:
           Variables:
             DYNAMODB_TABLE_NAME: zapier-triggers-events
         Layers:
           - !Ref DependenciesLayer
   
     DependenciesLayer:
       Type: AWS::Serverless::LayerVersion
       Properties:
         LayerName: zapier-triggers-deps
         ContentUri: layer/
         CompatibleRuntimes:
           - python3.9
   ```

3. **Build and Deploy:**
   ```bash
   sam build
   sam deploy --guided
   ```

**Benefits:**
- ✅ Automatic Linux builds
- ✅ Infrastructure as Code
- ✅ Easy CI/CD integration
- ✅ Production-ready

---

## Current Status

✅ **Using Option 1 (Lambda Layers with Docker)** - Working!

The current setup uses Docker locally to build the layer once, then stores it in AWS. Future code updates don't require Docker.

### To Switch to 100% AWS-Native:

1. **Use AWS CodeBuild** (Option 2) - Set up once, then all builds happen in AWS
2. **Use AWS SAM** (Option 3) - Best for production with Infrastructure as Code

---

## Quick Reference

### Current Workflow (Lambda Layers)

```bash
# One-time: Create layer (requires Docker)
./scripts/create-lambda-layer.sh

# Regular: Deploy code updates (no Docker needed)
./scripts/deploy-lambda-code-only.sh
```

### Future: 100% AWS-Native

```bash
# Setup CodeBuild (one-time)
./scripts/setup-codebuild-layer.sh

# Build in AWS (no Docker locally)
aws codebuild start-build --project-name zapier-triggers-layer-builder
```

---

## Troubleshooting

### Layer Not Found

```bash
# List layers
aws lambda list-layers --region us-east-1

# Check function layers
aws lambda get-function --function-name zapier-triggers-api --query 'Configuration.Layers'
```

### Update Dependencies

```bash
# Rebuild layer with new dependencies
./scripts/create-lambda-layer.sh
```

---

**Next Steps**: Choose your preferred approach and follow the setup instructions above.

