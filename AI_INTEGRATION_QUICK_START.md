# 🚀 AI Integration Quick Start

## ✅ What's Been Implemented

### **Repo 1 (CabriThon) - COMPLETE**

✅ **Direction 1: Fetch AI Insights**
- `AIController` with 5 endpoints for getting AI data
- `ExternalAiService` for HTTP communication with AI API
- User JWT token forwarding for authentication
- DTOs for all AI data types

✅ **Direction 2: Provide Raw Data**
- `DataExportController` with 7 endpoints for data export
- `ApiKeyAuthenticationMiddleware` for secure API key validation
- `DataExportRepository` for efficient data queries
- Support for filtering by client, date range, products, etc.

✅ **Security & Configuration**
- API key authentication for data export
- JWT token forwarding for AI requests
- Configuration templates in `appsettings.json`
- Comprehensive error handling and logging

---

## ⚡ Quick Setup (5 Steps)

### **Step 1: Generate API Keys**

```bash
# Generate 2 secure API keys
openssl rand -base64 32
openssl rand -base64 32
```

### **Step 2: Update Repo 1 Configuration**

Edit `backend/CabriThon.Api/appsettings.json`:

```json
{
  "ExternalAPI": {
    "BaseUrl": "http://localhost:8000",  // Your AI API URL
    "ApiKey": "your-ai-api-authentication-key"
  },
  "DataExportApiKeys": [
    "KEY_1_FROM_STEP_1",  // For AI API to call Repo 1
    "KEY_2_FROM_STEP_1"   // Backup key
  ]
}
```

### **Step 3: Test Data Export Endpoints**

```bash
# Test that data export works
API_KEY="KEY_1_FROM_STEP_1"

curl -H "X-API-Key: $API_KEY" \
  http://localhost:5001/api/data-export/health

curl -H "X-API-Key: $API_KEY" \
  "http://localhost:5001/api/data-export/products?limit=5"
```

Expected response:
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### **Step 4: Provide Info to Repo 2 Team**

Send them:

1. **Data Export API URL:**
   ```
   http://localhost:5001/api/data-export
   # or
   https://your-deployed-cabrithon-api.com/api/data-export
   ```

2. **API Key:**
   ```
   KEY_1_FROM_STEP_1
   ```

3. **Available Endpoints:**
   ```
   GET  /products
   GET  /orders
   GET  /inventory
   GET  /clients
   GET  /sales-history
   POST /comprehensive
   GET  /health
   ```

4. **Supabase Configuration (for JWT validation):**
   ```
   URL: https://dkhluiutbrzzbwfrkveo.supabase.co
   JWT Secret: (get from Supabase Dashboard → Settings → API)
   ```

### **Step 5: Test Full Flow**

Once Repo 2 implements their endpoints:

```bash
# 1. Login via frontend to get JWT token
# 2. Test AI endpoints

TOKEN="your-jwt-from-login"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/ai/predictions

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/ai/alerts
```

---

## 📋 What Repo 2 Needs to Implement

### **1. JWT Validation Function**

```python
import jwt

def validate_supabase_token(token: str):
    """Validate Supabase JWT token"""
    payload = jwt.decode(
        token,
        SUPABASE_JWT_SECRET,
        algorithms=["HS256"],
        audience="authenticated",
        issuer=f"{SUPABASE_URL}/auth/v1"
    )
    return payload.get("sub")  # User ID
```

### **2. HTTP Client for Repo 1**

```python
import httpx

client = httpx.AsyncClient(
    base_url="http://localhost:5001",  # Repo 1 URL
    headers={"X-API-Key": "KEY_1_FROM_STEP_1"}
)

async def fetch_products(client_id: int):
    response = await client.get(
        "/api/data-export/products",
        params={"clientId": client_id}
    )
    return response.json()["data"]
```

### **3. AI Endpoints**

Implement these endpoints:

```python
from fastapi import FastAPI, Header, HTTPException

app = FastAPI()

@app.get("/api/predictions/summary/{client_id}")
async def get_predictions(client_id: int, authorization: str = Header(...)):
    # 1. Validate JWT token
    token = authorization.replace("Bearer ", "")
    user_id = validate_supabase_token(token)
    
    # 2. Check user has access to this client
    user_client = get_user_client(user_id)
    if user_client != client_id:
        raise HTTPException(403, "Not authorized")
    
    # 3. Return predictions from your database
    return get_predictions_from_db(client_id)

@app.get("/api/alerts/client/{client_id}")
async def get_alerts(client_id: int, authorization: str = Header(...)):
    # Similar implementation
    pass

@app.get("/api/promotions/suggestions/{client_id}")
async def get_promotions(client_id: int, authorization: str = Header(...)):
    # Similar implementation
    pass

@app.get("/api/analysis/client/{client_id}")
async def get_analysis(client_id: int, authorization: str = Header(...)):
    # Similar implementation
    pass

@app.get("/api/insights/client/{client_id}")
async def get_insights(client_id: int, authorization: str = Header(...)):
    # Similar implementation
    pass
```

### **4. User-Client Mapping Table**

```sql
CREATE TABLE user_clients (
    user_id UUID PRIMARY KEY,
    client_id INTEGER NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Populate from Repo 1's app_user table
INSERT INTO user_clients (user_id, client_id)
SELECT auth_user_id, client_id
FROM app_user
WHERE client_id IS NOT NULL;
```

---

## 🧪 Testing Checklist

### Repo 1 (Your System)
- [x] ✅ ExternalAiService implemented
- [x] ✅ AIController implemented
- [x] ✅ DataExportController implemented
- [x] ✅ API key middleware implemented
- [x] ✅ Configuration files updated
- [x] ✅ All DTOs created
- [ ] ⏳ API keys generated
- [ ] ⏳ appsettings.json configured
- [ ] ⏳ Data export endpoints tested

### Repo 2 (AI API)
- [ ] ⏳ JWT validation implemented
- [ ] ⏳ HTTP client for Repo 1 configured
- [ ] ⏳ AI endpoints implemented
- [ ] ⏳ User-client mapping table created
- [ ] ⏳ Integration tested

---

## 🔐 Security Checklist

- [ ] API keys are 32+ characters and randomly generated
- [ ] API keys stored in environment variables (not in code)
- [ ] JWT secret obtained from Supabase Dashboard
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] API keys rotated periodically
- [ ] Logs don't expose sensitive data

---

## 📊 API Endpoints Summary

### **Your Frontend → Repo 1 Backend → AI API**

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/ai/predictions` | User JWT | Sales predictions |
| `GET /api/ai/alerts` | User JWT | Inventory alerts |
| `GET /api/ai/promotions` | User JWT | Promotion suggestions |
| `GET /api/ai/analysis` | User JWT | Product analysis |
| `GET /api/ai/insights` | User JWT | Comprehensive insights |
| `GET /api/ai/predictions/{clientId}` | Admin JWT | Admin: Any client predictions |
| `GET /api/ai/alerts/{clientId}` | Admin JWT | Admin: Any client alerts |

### **AI API → Repo 1 Backend**

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/data-export/products` | API Key | Product catalog |
| `GET /api/data-export/orders` | API Key | Order history |
| `GET /api/data-export/inventory` | API Key | Current inventory |
| `GET /api/data-export/clients` | API Key | Client list |
| `GET /api/data-export/sales-history` | API Key | Sales transactions |
| `POST /api/data-export/comprehensive` | API Key | All data types |
| `GET /api/data-export/health` | API Key | Health check |

---

## 🆘 Common Issues

### Issue: "Invalid API Key"
```bash
# Check key in appsettings.json
grep -A 3 "DataExportApiKeys" backend/CabriThon.Api/appsettings.json

# Ensure no extra spaces or quotes
# Key should be: "KEY_1_FROM_STEP_1" (with quotes in JSON)
```

### Issue: AI endpoints return 404
```bash
# Check ExternalAPI BaseUrl in appsettings.json
# Ensure AI API is running
curl http://localhost:8000/health  # Or your AI API URL
```

### Issue: Empty data returned
```bash
# Check if client has data
curl -H "X-API-Key: YOUR_KEY" \
  "http://localhost:5001/api/data-export/clients"

# Check specific client
curl -H "X-API-Key: YOUR_KEY" \
  "http://localhost:5001/api/data-export/products?clientId=1"
```

---

## 📞 Support

- **Documentation**: `BIDIRECTIONAL_API_COMMUNICATION.md`
- **API Reference**: See full documentation for all parameters and responses
- **Test with Postman**: Import endpoints and test manually

---

## ✅ Completion Checklist

Before going to production:

1. **Configuration**
   - [ ] Secure API keys generated
   - [ ] appsettings.json configured
   - [ ] Environment variables set

2. **Testing**
   - [ ] Data export endpoints tested
   - [ ] AI endpoints tested (once Repo 2 ready)
   - [ ] Full user flow tested

3. **Security**
   - [ ] HTTPS enabled
   - [ ] API keys secured
   - [ ] Rate limiting configured
   - [ ] Logs sanitized

4. **Monitoring**
   - [ ] Logging enabled
   - [ ] Error tracking configured
   - [ ] Performance monitoring set up

---

**Status**: ✅ Repo 1 Complete - Ready for Integration  
**Next**: Configure API keys and test data export endpoints  
**Time to Complete**: ~15 minutes

