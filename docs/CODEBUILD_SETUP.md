# AWS CodeBuild Setup - Complete Guide

**100% AWS-native Lambda Layer building (no Docker required locally)**

---

## ✅ What's Set Up

1. **AWS CodeBuild Project**: `zapier-triggers-layer-builder`
   - Builds Lambda Layer in AWS Linux environment
   - Uses `buildspec-layer.yml` for build instructions
   - Stores artifacts in S3

2. **S3 Bucket**: `zapier-triggers-codebuild-971422717446`
   - Stores source code
   - Stores build artifacts

3. **IAM Role**: `codebuild-zapier-triggers-service-role`
   - Permissions for CodeBuild to access S3 and CloudWatch

---

## 🚀 How to Build Layer

### Option 1: Automated Script (Recommended)

```bash
./scripts/build-layer-codebuild.sh
```

This script:
1. Packages your backend code
2. Uploads to S3
3. Starts CodeBuild
4. Waits for build to complete
5. Downloads the layer
6. Publishes to Lambda
7. Attaches to your function

### Option 2: Manual Steps

```bash
# 1. Package source
cd backend
zip -r /tmp/backend-source.zip . -x "venv/*" "*.zip"

# 2. Upload to S3
BUCKET="zapier-triggers-codebuild-971422717446"
aws s3 cp /tmp/backend-source.zip "s3://$BUCKET/backend-source.zip"

# 3. Start build
aws codebuild start-build \
  --project-name zapier-triggers-layer-builder \
  --region us-east-1

# 4. Check status
aws codebuild list-builds-for-project \
  --project-name zapier-triggers-layer-builder \
  --region us-east-1
```

---

## 📊 Monitor Build Progress

### View Build Status

```bash
# List recent builds
aws codebuild list-builds-for-project \
  --project-name zapier-triggers-layer-builder \
  --region us-east-1 \
  --max-items 1

# Get build details
BUILD_ID="your-build-id"
aws codebuild batch-get-builds \
  --ids "$BUILD_ID" \
  --region us-east-1
```

### View Build Logs

1. Go to **AWS Console** → **CodeBuild** → **Build history**
2. Click on your build
3. View logs in real-time

Or use CLI:
```bash
# Get log group
aws codebuild batch-get-builds \
  --ids "$BUILD_ID" \
  --region us-east-1 \
  --query 'builds[0].logs.groupName'

# Tail logs
aws logs tail /aws/codebuild/zapier-triggers-layer-builder --follow
```

---

## 🔄 Workflow

### Initial Setup (One-time)
```bash
./scripts/setup-codebuild-layer.sh
```

### Regular Builds
```bash
# Build layer with CodeBuild (takes 5-10 minutes)
./scripts/build-layer-codebuild.sh

# Deploy code-only updates (fast, no dependencies)
./scripts/deploy-lambda-code-only.sh
```

---

## 📝 Buildspec File

The build process uses `backend/buildspec-layer.yml`:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      python: 3.9
  build:
    commands:
      - pip install -r requirements.txt -t layer-package/...
      - zip layer.zip
artifacts:
  files:
    - layer.zip
```

---

## 🎯 Benefits

✅ **100% AWS-native** - No Docker required locally  
✅ **Linux-compatible** - Built in AWS Linux environment  
✅ **Automated** - One command to build and deploy  
✅ **Scalable** - Can integrate with CI/CD pipelines  
✅ **Cost-effective** - Pay only for build time  

---

## 🔧 Troubleshooting

### Build Fails

1. **Check build logs** in CodeBuild console
2. **Verify buildspec** syntax is correct
3. **Check S3 permissions** for CodeBuild role
4. **Verify requirements.txt** has all dependencies

### Layer Not Found After Build

```bash
# Check if layer was created
aws lambda list-layers --region us-east-1

# Check function layers
aws lambda get-function \
  --function-name zapier-triggers-api \
  --query 'Configuration.Layers'
```

### Update Dependencies

1. Update `requirements.txt`
2. Run build script again
3. New layer version will be created and attached

---

## 📚 Next Steps

After layer is built:
1. ✅ Layer is automatically attached to Lambda function
2. ✅ Test your API endpoints
3. ✅ Deploy frontend
4. ✅ Set up CI/CD (optional)

---

**Current Status**: CodeBuild is set up and ready to use! 🎉

