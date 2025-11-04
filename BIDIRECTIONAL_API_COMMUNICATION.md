# 🔄 Bidirectional API Communication Guide

## Overview

This document describes the bidirectional communication system between:
- **Repo 1**: CabriThon Full-Stack E-Commerce & Inventory System (.NET 9 Backend + React Frontend)
- **Repo 2**: AI Agents & Suggestions API (Your AI API)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  - User authenticates with Supabase                             │
│  - Gets JWT token                                               │
│  - Sends requests to Backend with token                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (.NET 9 API) - REPO 1                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  DIRECTION 1: Repo1 → Repo2 (Get AI Insights)             │ │
│  │  - AIController receives user request with Supabase JWT   │ │
│  │  - ExternalAiService forwards token to AI API              │ │
│  │  - AI API validates token and returns insights             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  DIRECTION 2: Repo2 → Repo1 (Get Raw Data)                │ │
│  │  - DataExportController exposes data endpoints             │ │
│  │  - ApiKeyAuthenticationMiddleware validates API key        │ │
│  │  - DataExportRepository queries database                   │ │
│  │  - Returns products, orders, inventory data                │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENTS API - REPO 2                        │
│  - Validates Supabase JWT tokens from users                     │
│  - Uses API key to fetch raw data from Repo 1                   │
│  - Runs AI analysis and predictions                             │
│  - Returns insights, alerts, and suggestions                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Direction 1: Repo 1 → Repo 2 (Fetch AI Insights)

### **Authentication Mechanism**
- User's Supabase JWT token is forwarded from Repo 1 to Repo 2
- Repo 2 validates the token using the Supabase JWT secret
- Repo 2 extracts user ID and client ID from the token
- Repo 2 returns only data relevant to that user/client

### **Endpoints in Repo 1 (Frontend Calls These)**

#### 1. Get Sales Predictions
```http
GET /api/ai/predictions
Authorization: Bearer <user-supabase-jwt-token>
```

**Response:**
```json
{
  "fechaGeneracion": "2025-01-04T10:00:00Z",
  "clienteId": 123,
  "clienteNombre": "Store XYZ",
  "totalProductosAnalizados": 50,
  "totalUnidadesPredichas": 1500.5,
  "valorTotalPredichoMxn": 125000.00,
  "productosConAlertaStock": 5,
  "modeloUtilizado": "LSTM",
  "mae": 0.15,
  "rmse": 0.23,
  "r2Score": 0.89
}
```

#### 2. Get Inventory Alerts
```http
GET /api/ai/alerts
Authorization: Bearer <user-supabase-jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "fechaGeneracion": "2025-01-04T10:00:00Z",
    "clienteId": 123,
    "productId": 456,
    "productoNombre": "Coca-Cola 600ml",
    "prioridad": "ALTA",
    "stockActual": 5,
    "demandaPredicha": 50.0,
    "faltanteEstimado": 45.0,
    "recomendacionReabastecimiento": 100,
    "estado": "PENDIENTE",
    "notas": "Producto con alta demanda",
    "createdAt": "2025-01-04T10:00:00Z"
  }
]
```

#### 3. Get AI Promotion Suggestions
```http
GET /api/ai/promotions
Authorization: Bearer <user-supabase-jwt-token>
```

**Response:**
```json
[
  {
    "promotionId": null,
    "name": "Combo Refrescos",
    "description": "3x2 en todas las bebidas",
    "justificationAi": "Alta rotación de inventario detectada",
    "originalPrice": 100.00,
    "discountAmount": 33.33,
    "finalPrice": 66.67,
    "expectedIncreasePercent": 25.0,
    "profitMarginPercent": 15.0,
    "startDate": "2025-01-10T00:00:00Z",
    "endDate": "2025-01-17T00:00:00Z",
    "products": [
      {
        "productId": 123,
        "productName": "Coca-Cola 600ml",
        "quantity": 3,
        "individualPrice": 35.00,
        "discountApplied": 35.00
      }
    ],
    "createdByAi": true
  }
]
```

#### 4. Get Product Analysis
```http
GET /api/ai/analysis
Authorization: Bearer <user-supabase-jwt-token>
```

#### 5. Get Comprehensive Client Insights
```http
GET /api/ai/insights
Authorization: Bearer <user-supabase-jwt-token>
```

#### 6. Admin Endpoints (Admin Role Required)
```http
GET /api/ai/predictions/{clientId}
GET /api/ai/alerts/{clientId}
Authorization: Bearer <admin-supabase-jwt-token>
```

### **Implementation in Repo 1**

#### ExternalAiService
Located at: `backend/CabriThon.Infrastructure/Services/ExternalAiService.cs`

```csharp
public async Task<PredictionSummaryDto?> GetSalesPredictionsAsync(int clientId, string userToken)
{
    var request = new HttpRequestMessage(HttpMethod.Get, $"/api/predictions/summary/{clientId}");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", userToken);
    
    var response = await _httpClient.SendAsync(request);
    // ... handle response
}
```

#### Configuration Required
In `appsettings.json`:
```json
{
  "ExternalAPI": {
    "BaseUrl": "https://your-ai-api-url.com",
    "ApiKey": "your-api-key-for-ai-api"
  }
}
```

---

## 📤 Direction 2: Repo 2 → Repo 1 (Fetch Raw Data)

### **Authentication Mechanism**
- API key-based authentication
- Repo 2 sends `X-API-Key` header with requests
- Repo 1 validates the API key via middleware
- Multiple API keys supported for different services/environments

### **Endpoints in Repo 1 (AI API Calls These)**

All endpoints are prefixed with `/api/data-export/`

#### 1. Export Products
```http
GET /api/data-export/products?clientId=123&limit=100
X-API-Key: your-secure-api-key
```

**Query Parameters:**
- `clientId` (optional): Filter by client
- `limit` (optional): Max records to return
- `categoryIds` (optional): Filter by categories
- `productIds` (optional): Specific product IDs

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "productId": 1,
      "name": "Coca-Cola 600ml",
      "cost": 15.00,
      "suggestedPrice": 25.00,
      "categoryId": 1,
      "categoryName": "Bebidas",
      "brandId": 1,
      "brandName": "Coca-Cola",
      "size": "600ml",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

#### 2. Export Orders
```http
GET /api/data-export/orders?clientId=123&startDate=2024-01-01&endDate=2025-01-04&limit=100
X-API-Key: your-secure-api-key
```

**Query Parameters:**
- `clientId` (optional): Filter by client
- `startDate` (optional): Start date for orders
- `endDate` (optional): End date for orders
- `limit` (optional): Max records
- `includeInactive` (optional): Include inactive orders

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "orderId": 1001,
      "clientId": 123,
      "clientName": "Store XYZ",
      "status": "Delivered",
      "isActive": true,
      "createdAt": "2025-01-01T12:00:00Z",
      "items": [
        {
          "orderItemId": 5001,
          "productId": 1,
          "productName": "Coca-Cola 600ml",
          "quantity": 10,
          "unitPrice": 15.00,
          "totalPrice": 150.00
        }
      ]
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

#### 3. Export Inventory
```http
GET /api/data-export/inventory?clientId=123
X-API-Key: your-secure-api-key
```

**Response:**
```json
{
  "success": true,
  "count": 75,
  "data": [
    {
      "productId": 1,
      "productName": "Coca-Cola 600ml",
      "clientId": 123,
      "clientName": "Store XYZ",
      "stock": 50,
      "warehouseLocation": "A-1-5",
      "lastUpdated": "2025-01-04T09:00:00Z",
      "isDistributionCenter": false
    },
    {
      "productId": 1,
      "productName": "Coca-Cola 600ml",
      "clientId": null,
      "clientName": "CEDI",
      "stock": 5000,
      "warehouseLocation": "DC-A-10",
      "lastUpdated": "2025-01-04T08:00:00Z",
      "isDistributionCenter": true
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

#### 4. Export Clients
```http
GET /api/data-export/clients
X-API-Key: your-secure-api-key
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "clientId": 123,
      "name": "Store XYZ",
      "email": "store@example.com",
      "phone": "555-0123",
      "address": "123 Main St",
      "createdAt": "2024-01-01T00:00:00Z",
      "totalOrders": 150,
      "totalProducts": 75
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

#### 5. Export Sales History
```http
GET /api/data-export/sales-history?clientId=123&startDate=2024-01-01&endDate=2025-01-04
X-API-Key: your-secure-api-key
```

**Response:**
```json
{
  "success": true,
  "count": 500,
  "data": [
    {
      "clientId": 123,
      "clientName": "Store XYZ",
      "productId": 1,
      "productName": "Coca-Cola 600ml",
      "orderDate": "2025-01-03T15:30:00Z",
      "quantitySold": 10,
      "salesValue": 150.00,
      "productCategory": "Bebidas",
      "productBrand": "Coca-Cola"
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

#### 6. Export Comprehensive Package (POST)
```http
POST /api/data-export/comprehensive
X-API-Key: your-secure-api-key
Content-Type: application/json

{
  "clientId": 123,
  "startDate": "2024-01-01",
  "endDate": "2025-01-04",
  "limit": 1000,
  "productIds": [1, 2, 3],
  "categoryIds": [1, 2],
  "includeInactive": false
}
```

**Response:** Includes all data types in a single response

#### 7. Health Check
```http
GET /api/data-export/health
X-API-Key: your-secure-api-key
```

**Response:**
```json
{
  "success": true,
  "service": "CabriThon Data Export API",
  "timestamp": "2025-01-04T10:00:00Z",
  "version": "1.0.0"
}
```

### **Configuration Required in Repo 1**

In `appsettings.json`:
```json
{
  "DataExportApiKeys": [
    "your-secure-api-key-1",
    "your-secure-api-key-2",
    "production-key-for-ai-service"
  ]
}
```

**Generate Secure API Keys:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🔐 Security Implementation

### **Direction 1 Security (Repo1 → Repo2)**

#### In Repo 1:
1. User authenticates with Supabase
2. Frontend sends Supabase JWT to Repo 1 backend
3. Repo 1 validates JWT
4. Repo 1 forwards same JWT to Repo 2
5. Repo 2 validates JWT independently

#### In Repo 2 (YOU NEED TO IMPLEMENT):
```python
# Example Python implementation
from supabase import create_client
import jwt

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def validate_supabase_token(token: str):
    """Validate Supabase JWT token"""
    try:
        # Decode and verify JWT
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,  # Get from Supabase Dashboard
            algorithms=["HS256"],
            audience="authenticated",
            issuer=f"{SUPABASE_URL}/auth/v1"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("user_role") or payload.get("role")
        
        return {
            "valid": True,
            "user_id": user_id,
            "email": email,
            "role": role
        }
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}
    except jwt.InvalidTokenError as e:
        return {"valid": False, "error": str(e)}

# Example endpoint in Repo 2
@app.get("/api/predictions/summary/{client_id}")
async def get_predictions(client_id: int, authorization: str = Header(...)):
    # Extract token
    token = authorization.replace("Bearer ", "")
    
    # Validate token
    auth_result = validate_supabase_token(token)
    if not auth_result["valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Query user's client_id from database
    user_client_id = get_user_client_id(auth_result["user_id"])
    
    # Check authorization
    if user_client_id != client_id and auth_result["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Return predictions
    return get_predictions_from_db(client_id)
```

### **Direction 2 Security (Repo2 → Repo1)**

#### API Key Middleware in Repo 1:
Located at: `backend/CabriThon.Api/Middleware/ApiKeyAuthenticationMiddleware.cs`

- Intercepts all requests to `/api/data-export/*`
- Validates `X-API-Key` header or `apiKey` query parameter
- Rejects invalid keys with 403 Forbidden
- Logs all authentication attempts

#### In Repo 2 (YOUR HTTP CLIENT):
```python
import httpx

# Configuration
REPO1_BASE_URL = "https://cabrithon-api.com"
REPO1_API_KEY = "your-secure-api-key-from-repo1-config"

# HTTP client with API key
client = httpx.AsyncClient(
    base_url=REPO1_BASE_URL,
    headers={"X-API-Key": REPO1_API_KEY},
    timeout=30.0
)

# Example: Fetch products
async def fetch_products_from_repo1(client_id: int):
    response = await client.get(
        "/api/data-export/products",
        params={"clientId": client_id, "limit": 1000}
    )
    response.raise_for_status()
    return response.json()

# Example: Fetch sales history
async def fetch_sales_history(client_id: int, start_date: str, end_date: str):
    response = await client.get(
        "/api/data-export/sales-history",
        params={
            "clientId": client_id,
            "startDate": start_date,
            "endDate": end_date,
            "limit": 10000
        }
    )
    response.raise_for_status()
    return response.json()["data"]
```

---

## 🚀 Setup Instructions

### **Step 1: Configure Repo 1**

1. **Update `appsettings.json`:**
```json
{
  "ExternalAPI": {
    "BaseUrl": "https://your-ai-api-url.com",
    "ApiKey": "api-key-for-calling-ai-api"
  },
  "DataExportApiKeys": [
    "secure-key-1-for-ai-api-to-call-repo1",
    "secure-key-2-backup"
  ]
}
```

2. **Generate API Keys:**
```bash
# Generate 2-3 secure keys
openssl rand -base64 32
```

3. **Test the endpoints:**
```bash
# Test Direction 2 (Data Export)
curl -H "X-API-Key: your-key" http://localhost:5001/api/data-export/health
```

### **Step 2: Configure Repo 2 (YOUR AI API)**

#### Required Environment Variables:
```bash
# Supabase Configuration (for validating user tokens)
SUPABASE_URL=https://dkhluiutbrzzbwfrkveo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=<get-from-supabase-dashboard>

# Repo 1 API Configuration (for fetching data)
REPO1_API_URL=http://localhost:5001  # or https://your-deployed-url.com
REPO1_API_KEY=secure-key-1-for-ai-api-to-call-repo1
```

#### Install Dependencies:
```bash
# Python example
pip install httpx pyjwt supabase-py fastapi uvicorn
```

#### Implement Token Validation:
See Python example above in Security section

#### Implement Data Fetching Client:
See HTTP client example above

---

## 🧪 Testing the Communication

### **Test Direction 1: Repo1 → Repo2**

1. **Create test user in Supabase**
2. **Login via frontend to get JWT token**
3. **Call AI endpoint:**

```bash
# Get token from frontend localStorage or API response
TOKEN="your-supabase-jwt-token"

# Test predictions endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5001/api/ai/predictions

# Expected: Either predictions data or 404 if AI API not reachable
```

### **Test Direction 2: Repo2 → Repo1**

```bash
# Test from your AI API or terminal
API_KEY="your-secure-api-key"

# Test health check
curl -H "X-API-Key: $API_KEY" \
  http://localhost:5001/api/data-export/health

# Test products export
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:5001/api/data-export/products?limit=10"

# Test orders export
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:5001/api/data-export/orders?clientId=1&limit=10"
```

---

## 📋 What You Need from Repo 2

### **1. API Endpoints for Direction 1 (Repo1 calls these)**

Please implement these endpoints in your AI API:

```
GET  /api/predictions/summary/{clientId}
GET  /api/alerts/client/{clientId}
GET  /api/promotions/suggestions/{clientId}
GET  /api/analysis/client/{clientId}
GET  /api/insights/client/{clientId}
```

All should:
- Accept `Authorization: Bearer <supabase-jwt>` header
- Validate the JWT token
- Extract user_id from token
- Query database to get user's client_id
- Return only data for that client (unless user is Admin)

### **2. JWT Validation Implementation**

You need:
- Supabase JWT Secret (from dashboard)
- JWT validation library (e.g., `pyjwt` for Python)
- Middleware/decorator to protect endpoints

### **3. HTTP Client Configuration**

To call Repo 1 data export endpoints:
- Base URL: Repo 1 API URL
- API Key: One of the keys from Repo 1's `DataExportApiKeys` config
- Header: `X-API-Key: your-key`

### **4. Database Schema**

Your AI API needs a table linking Supabase users to clients:

```sql
CREATE TABLE user_clients (
  user_id UUID PRIMARY KEY,  -- From Supabase auth
  client_id INTEGER NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

This allows you to:
1. Validate user has access to requested client
2. Determine which data to return
3. Enforce row-level security

---

## 🔧 Troubleshooting

### Issue: "Invalid JWT" in Repo 2
**Cause:** JWT secret mismatch or wrong issuer/audience

**Solution:**
1. Get JWT secret from Supabase Dashboard → Settings → API
2. Verify issuer is `https://your-project.supabase.co/auth/v1`
3. Verify audience is `authenticated`

### Issue: "Invalid API Key" when Repo 2 calls Repo 1
**Cause:** API key not in Repo 1's configuration

**Solution:**
1. Check `appsettings.json` → `DataExportApiKeys` array
2. Ensure the key matches exactly
3. Restart Repo 1 backend after config changes

### Issue: CORS errors
**Cause:** Repo 1 not configured to allow Repo 2's origin

**Solution:**
Add Repo 2's URL to CORS policy in `Program.cs`:
```csharp
policy.WithOrigins(
    "http://localhost:3000",
    "https://your-ai-api-url.com"  // Add this
)
```

### Issue: Empty data returned
**Cause:** Client has no data or wrong client_id

**Solution:**
1. Check if client exists: `GET /api/data-export/clients`
2. Verify client_id is correct
3. Check database has orders/inventory for that client

---

## 📚 Additional Resources

- **Supabase JWT Documentation**: https://supabase.com/docs/guides/auth/jwt
- **API Key Best Practices**: https://owasp.org/www-community/vulnerabilities/Insecure_API_Key_Storage
- **Rate Limiting**: Consider implementing rate limiting for both directions

---

## 📝 Quick Reference

### Environment Variables Needed

**Repo 1 (appsettings.json):**
```json
{
  "ExternalAPI": {
    "BaseUrl": "YOUR_AI_API_URL",
    "ApiKey": "API_KEY_FOR_CALLING_AI"
  },
  "DataExportApiKeys": ["KEY_FOR_AI_TO_CALL_YOU"]
}
```

**Repo 2 (YOUR AI API):**
```bash
SUPABASE_URL=...
SUPABASE_JWT_SECRET=...
REPO1_API_URL=...
REPO1_API_KEY=...
```

### Headers to Send

**Repo1 → Repo2:**
```
Authorization: Bearer <user-supabase-jwt>
```

**Repo2 → Repo1:**
```
X-API-Key: <your-secure-api-key>
```

---

**Status**: ✅ Implementation Complete  
**Next Step**: Configure Repo 2 with endpoints and JWT validation  
**Ready for Integration**: Yes

