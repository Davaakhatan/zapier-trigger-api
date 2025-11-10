# CORS Fix for Lambda Function

## Problem

The Lambda function is crashing with:
```
SettingsError: error parsing value for field "cors_origins" from source "EnvSettingsSource"
```

This happens because the backend's `config.py` is trying to parse `CORS_ORIGINS` environment variable, but the format doesn't match what Pydantic expects.

## Solution

Update the backend repository's `src/core/config.py` file to handle `CORS_ORIGINS` properly.

### Option 1: Make CORS_ORIGINS Optional and Parse String

In `backend/src/core/config.py`, update the `Settings` class:

```python
from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... other settings ...
    
    cors_origins: Optional[str] = None
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        if not self.cors_origins:
            return ["*"]  # Default to allow all
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

Then in `src/main.py`, use:

```python
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Option 2: Use Pydantic Field Validator

```python
from typing import Optional, List
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... other settings ...
    
    cors_origins: Optional[str] = None
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if v is None:
            return ["*"]
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

But this won't work directly because Pydantic expects a list. Better approach:

### Option 3: Use Pydantic Field with Custom Parser (Recommended)

```python
from typing import Optional, List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... other settings ...
    
    cors_origins: str = Field(default="*", description="Comma-separated list of allowed origins")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        if self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

## Steps to Fix

1. **Go to backend repository**: https://github.com/Davaakhatan/zapier-trigger-api-backend

2. **Update `src/core/config.py`**:
   - Change `cors_origins` field to accept a string
   - Add a property or method to parse it into a list

3. **Update `src/main.py`**:
   - Use `settings.cors_origins_list` instead of `settings.cors_origins` in CORS middleware

4. **Redeploy Lambda**:
   ```bash
   cd backend
   ./scripts/build-layer-codebuild.sh
   # Or use your deployment script
   ```

5. **Verify**:
   ```bash
   curl -X GET "https://b6su7oge4f.execute-api.us-east-1.amazonaws.com/prod/v1/events/inbox?limit=100" \
     -H "Origin: https://main.dib8qm74qn70a.amplifyapp.com" \
     -v
   ```

## Current Lambda Environment Variable

```
CORS_ORIGINS=https://main.dib8qm74qn70a.amplifyapp.com
```

The backend needs to parse this string and split it by comma (if multiple origins are provided).

## Quick Fix (If you can't update backend right now)

Temporarily remove `CORS_ORIGINS` from Lambda environment variables and allow all origins:

```bash
aws lambda update-function-configuration \
  --function-name zapier-triggers-api \
  --environment "Variables={
    DYNAMODB_TABLE_NAME=zapier-triggers-events,
    DEBUG=false
  }" \
  --region us-east-1
```

Then update the backend to default to `["*"]` if `CORS_ORIGINS` is not set.

