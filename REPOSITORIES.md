# Repository Structure

**Separated repositories for frontend and backend**

---

## 📦 Repositories

### Frontend Repository
**URL**: https://github.com/Davaakhatan/zapier-trigger-api

**Contents**:
- Next.js frontend application
- React components
- Frontend deployment scripts
- Amplify configuration
- Frontend documentation

**Deployment**: AWS Amplify

---

### Backend Repository
**URL**: https://github.com/Davaakhatan/zapier-trigger-api-backend

**Contents**:
- FastAPI backend application
- Lambda deployment configuration
- DynamoDB integration
- API Gateway setup
- AWS deployment scripts
- CodeBuild configuration

**Deployment**: AWS Lambda + API Gateway

---

## 🔗 How They Connect

### API Endpoint
The frontend connects to the backend via API Gateway:

```
https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
```

### Environment Variable
Frontend uses `NEXT_PUBLIC_API_URL` to connect to backend:
- Set in AWS Amplify Console
- Or in `.env.production` for local development

---

## 🚀 Deployment Workflow

### Backend Deployment

```bash
# Clone backend repo
git clone https://github.com/Davaakhatan/zapier-trigger-api-backend.git
cd zapier-trigger-api-backend

# Deploy using CodeBuild (AWS-native)
./scripts/build-layer-codebuild.sh

# Or deploy using Docker
./scripts/deploy-lambda-docker.sh
```

### Frontend Deployment

```bash
# Clone frontend repo
git clone https://github.com/Davaakhatan/zapier-trigger-api.git
cd zapier-trigger-api

# Deploy via AWS Amplify Console
# Or use Amplify CLI
amplify publish
```

---

## 📝 Development Workflow

### Local Development

**Backend**:
```bash
cd zapier-trigger-api-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

**Frontend**:
```bash
cd zapier-trigger-api
pnpm install
pnpm dev
```

**Connect**: Frontend at `http://localhost:3000` → Backend at `http://localhost:8000`

---

## 🔄 Updating Code

### Backend Changes

1. Make changes in `zapier-trigger-api-backend` repo
2. Commit and push
3. Deploy using deployment scripts
4. API automatically updates

### Frontend Changes

1. Make changes in `zapier-trigger-api` repo
2. Commit and push
3. Amplify automatically builds and deploys
4. Frontend automatically updates

---

## 📚 Documentation

### Backend Docs
- Located in: `zapier-trigger-api-backend/docs/`
- AWS deployment: `docs/AWS_DEPLOYMENT.md`
- API Gateway: `docs/API_GATEWAY_SETUP.md`
- Testing: `docs/TESTING_GUIDE.md`

### Frontend Docs
- Located in: `zapier-trigger-api/docs/`
- Deployment: `docs/FRONTEND_DEPLOYMENT.md`
- Getting started: `GETTING_STARTED.md`

---

## 🎯 Benefits of Separation

✅ **Independent deployments** - Update frontend/backend separately  
✅ **Clear ownership** - Each repo has focused purpose  
✅ **Easier CI/CD** - Separate pipelines for each service  
✅ **Better organization** - Cleaner codebase structure  
✅ **Team collaboration** - Different teams can work independently  

---

## 🔗 Quick Links

- **Frontend Repo**: https://github.com/Davaakhatan/zapier-trigger-api
- **Backend Repo**: https://github.com/Davaakhatan/zapier-trigger-api-backend
- **API Endpoint**: https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod
- **AWS Amplify**: https://console.aws.amazon.com/amplify
- **AWS Lambda**: https://console.aws.amazon.com/lambda

---

**Both repositories are ready for independent development and deployment!** 🚀

