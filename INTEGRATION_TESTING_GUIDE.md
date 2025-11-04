# 🧪 Integration Testing Guide

## Configuration Summary

✅ **Repo 1 (CabriThon):**
- Running on: `http://localhost:5001` (or your configured port)
- AI API URL: `http://localhost:5272`
- AI API Key: `cabrithon-api-key`

✅ **Repo 2 (AI API):**
- Running on: `http://localhost:5272`
- Repo 1 Data Export URL: `http://localhost:5001/api/data-export`
- API Keys for calling Repo 1:
  - `l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4=`
  - `DO08xSwPk0jDdMAbuD+eB6C7wBBeohy8u8t62HG0Sac=`

---

## 🧪 Test 1: Data Export (Repo 2 → Repo 1)

### **Test 1.1: Health Check**

```bash
# From terminal or Postman
API_KEY="l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4="

curl -X GET "http://localhost:5001/api/data-export/health" \
  -H "X-API-Key: $API_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "service": "CabriThon Data Export API",
  "timestamp": "2025-01-04T10:00:00Z",
  "version": "1.0.0"
}
```

### **Test 1.2: Get Clients List**

```bash
curl -X GET "http://localhost:5001/api/data-export/clients" \
  -H "X-API-Key: $API_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "clientId": 1,
      "name": "Client Name",
      "email": "client@example.com",
      "totalOrders": 50,
      "totalProducts": 75
    }
  ],
  "exportedAt": "2025-01-04T10:00:00Z"
}
```

### **Test 1.3: Get Products**

```bash
# Get all products (limited to 1000)
curl -X GET "http://localhost:5001/api/data-export/products?limit=10" \
  -H "X-API-Key: $API_KEY"

# Get products for specific client
curl -X GET "http://localhost:5001/api/data-export/products?clientId=1&limit=10" \
  -H "X-API-Key: $API_KEY"
```

### **Test 1.4: Get Orders**

```bash
# Recent orders
curl -X GET "http://localhost:5001/api/data-export/orders?limit=5" \
  -H "X-API-Key: $API_KEY"

# Orders for specific client with date range
curl -X GET "http://localhost:5001/api/data-export/orders?clientId=1&startDate=2024-01-01&endDate=2025-01-04&limit=10" \
  -H "X-API-Key: $API_KEY"
```

### **Test 1.5: Get Inventory**

```bash
# All inventory (CEDI + clients)
curl -X GET "http://localhost:5001/api/data-export/inventory?limit=20" \
  -H "X-API-Key: $API_KEY"

# Inventory for specific client
curl -X GET "http://localhost:5001/api/data-export/inventory?clientId=1" \
  -H "X-API-Key: $API_KEY"
```

### **Test 1.6: Get Sales History**

```bash
# Sales history with date range
curl -X GET "http://localhost:5001/api/data-export/sales-history?startDate=2024-01-01&endDate=2025-01-04&limit=100" \
  -H "X-API-Key: $API_KEY"

# Sales for specific client
curl -X GET "http://localhost:5001/api/data-export/sales-history?clientId=1&startDate=2024-01-01&limit=100" \
  -H "X-API-Key: $API_KEY"
```

### **Test 1.7: Get Comprehensive Package**

```bash
curl -X POST "http://localhost:5001/api/data-export/comprehensive" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "startDate": "2024-01-01",
    "endDate": "2025-01-04",
    "limit": 1000
  }'
```

---

## 🧪 Test 2: AI Insights (Frontend → Repo 1 → Repo 2)

### **Step 1: Get User JWT Token**

**Option A: Via Frontend Login**
1. Open browser to `http://localhost:3000` (your frontend)
2. Login with Supabase credentials
3. Open browser console (F12)
4. Run: `localStorage.getItem('sb-dkhluiutbrzzbwfrkveo-auth-token')`
5. Copy the `access_token` value

**Option B: Via Supabase Auth API**
```bash
curl -X POST 'https://dkhluiutbrzzbwfrkveo.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraGx1aXV0YnJ6emJ3ZnJrdmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjIwMDcsImV4cCI6MjA3NzgzODAwN30.sESgC2Fy8YjB4SF8EuESLgJofh67dyI_gtaT4_sWxIM' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@cabrithon.com",
    "password": "your-password"
  }'
```

### **Step 2: Test AI Endpoints**

```bash
# Set your JWT token
TOKEN="your-jwt-token-from-step-1"

# Test 2.1: Get Sales Predictions
curl -X GET "http://localhost:5001/api/ai/predictions" \
  -H "Authorization: Bearer $TOKEN"

# Test 2.2: Get Inventory Alerts
curl -X GET "http://localhost:5001/api/ai/alerts" \
  -H "Authorization: Bearer $TOKEN"

# Test 2.3: Get Promotion Suggestions
curl -X GET "http://localhost:5001/api/ai/promotions" \
  -H "Authorization: Bearer $TOKEN"

# Test 2.4: Get Product Analysis
curl -X GET "http://localhost:5001/api/ai/analysis" \
  -H "Authorization: Bearer $TOKEN"

# Test 2.5: Get Comprehensive Insights
curl -X GET "http://localhost:5001/api/ai/insights" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Flow:**
1. Your backend receives request with JWT
2. Validates JWT
3. Extracts user's client_id from database
4. Forwards JWT to AI API at `http://localhost:5272`
5. AI API validates JWT
6. AI API returns predictions/insights
7. Your backend returns to frontend

---

## 🧪 Test 3: Admin Endpoints

Admin users can view AI insights for any client:

```bash
# Get admin JWT token (user with Admin role)
ADMIN_TOKEN="admin-jwt-token"

# Get predictions for specific client
curl -X GET "http://localhost:5001/api/ai/predictions/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get alerts for specific client
curl -X GET "http://localhost:5001/api/ai/alerts/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🧪 Test 4: From AI API (Python Example)

If your AI API is Python-based, here's how to test calling Repo 1:

```python
import httpx
import asyncio

# Configuration
REPO1_URL = "http://localhost:5001"
API_KEY = "l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4="

async def test_data_export():
    client = httpx.AsyncClient(
        base_url=REPO1_URL,
        headers={"X-API-Key": API_KEY}
    )
    
    try:
        # Test health
        response = await client.get("/api/data-export/health")
        print(f"Health: {response.status_code}")
        print(response.json())
        
        # Test products
        response = await client.get("/api/data-export/products", params={"limit": 5})
        print(f"\nProducts: {response.status_code}")
        data = response.json()
        print(f"Count: {data['count']}")
        
        # Test sales history
        response = await client.get(
            "/api/data-export/sales-history",
            params={
                "clientId": 1,
                "startDate": "2024-01-01",
                "endDate": "2025-01-04",
                "limit": 100
            }
        )
        print(f"\nSales History: {response.status_code}")
        data = response.json()
        print(f"Count: {data['count']}")
        
    finally:
        await client.aclose()

# Run test
asyncio.run(test_data_export())
```

---

## 🧪 Test 5: End-to-End Flow

### **Complete User Journey:**

1. **User logs in to frontend**
   ```
   Browser → Login → Supabase Auth → JWT Token
   ```

2. **User navigates to AI Insights dashboard**
   ```
   Frontend calls: GET /api/ai/insights
   With: Authorization: Bearer <jwt>
   ```

3. **Backend processes request**
   ```
   Repo 1 Backend:
   - Validates JWT
   - Gets user's client_id from database
   - Forwards JWT to AI API at localhost:5272
   ```

4. **AI API runs analysis**
   ```
   AI API at localhost:5272:
   - Validates JWT
   - Calls Repo 1: GET /api/data-export/sales-history
   - With: X-API-Key header
   - Runs AI models
   - Returns predictions
   ```

5. **User sees results**
   ```
   Frontend displays:
   - Sales predictions
   - Inventory alerts
   - Promotion suggestions
   - Product analysis
   ```

---

## ✅ Success Criteria

### **Direction 1 (Repo 2 → Repo 1) - Data Export**
- [ ] Health endpoint returns 200 OK
- [ ] Products endpoint returns data
- [ ] Orders endpoint returns data
- [ ] Inventory endpoint returns data
- [ ] Sales history endpoint returns data
- [ ] Invalid API key returns 403 Forbidden
- [ ] Missing API key returns 401 Unauthorized

### **Direction 2 (Frontend → Repo 1 → Repo 2) - AI Insights**
- [ ] Predictions endpoint forwards JWT correctly
- [ ] AI API receives and validates JWT
- [ ] AI API can fetch data from Repo 1
- [ ] User receives AI insights
- [ ] Invalid JWT returns 401
- [ ] Unauthorized access returns 403

---

## 🐛 Troubleshooting

### **Issue: "Invalid API Key" when testing data export**

**Check:**
```bash
# Verify key in config
cat backend/CabriThon.Api/appsettings.json | grep -A 3 "DataExportApiKeys"

# Try both keys
API_KEY_1="l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4="
API_KEY_2="DO08xSwPk0jDdMAbuD+eB6C7wBBeohy8u8t62HG0Sac="

curl -H "X-API-Key: $API_KEY_1" http://localhost:5001/api/data-export/health
```

### **Issue: "Connection refused" to AI API**

**Check:**
```bash
# Verify AI API is running
curl http://localhost:5272/health  # or your AI API health endpoint

# Check configured URL
cat backend/CabriThon.Api/appsettings.json | grep -A 2 "ExternalAPI"
```

### **Issue: AI endpoints return 404**

**Verify Repo 2 endpoints:**
```bash
# Check if these endpoints exist in your AI API
curl http://localhost:5272/api/predictions/summary/1
curl http://localhost:5272/api/alerts/client/1
curl http://localhost:5272/api/promotions/suggestions/1
```

### **Issue: JWT validation fails**

**Check:**
1. JWT secret matches in both Repo 1 and Repo 2
2. Issuer is correct: `https://dkhluiutbrzzbwfrkveo.supabase.co/auth/v1`
3. Audience is correct: `authenticated`
4. Token hasn't expired

### **Issue: Empty data returned**

**Check:**
```bash
# Verify client has data
API_KEY="l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4="

# Get list of clients
curl -H "X-API-Key: $API_KEY" http://localhost:5001/api/data-export/clients

# Check specific client has orders
curl -H "X-API-Key: $API_KEY" "http://localhost:5001/api/data-export/orders?clientId=1&limit=5"
```

---

## 📊 Monitoring & Logs

### **Check Backend Logs**

Look for these log messages in your .NET backend:

**Data Export Success:**
```
[Information] Exporting products data for client 1
[Information] Valid API key provided for data export request
```

**AI API Calls:**
```
[Information] Fetching sales predictions for client 1
[Information] AI API returned 200 for client 1
```

**Errors:**
```
[Warning] Invalid API key provided for data export request from ::1
[Error] Error fetching sales predictions for client 1
```

### **Check AI API Logs**

Your AI API should log:
```
[INFO] Received request from Repo 1 with valid API key
[INFO] Fetched 150 sales records from Repo 1
[INFO] JWT token validated for user xyz
[INFO] Returning predictions for client 1
```

---

## 🎯 Performance Testing

### **Load Test Data Export**

```bash
# Test concurrent requests
for i in {1..10}; do
  curl -H "X-API-Key: $API_KEY" \
    "http://localhost:5001/api/data-export/products?limit=100" &
done
wait
```

### **Measure Response Times**

```bash
# Test with timing
time curl -H "X-API-Key: $API_KEY" \
  "http://localhost:5001/api/data-export/sales-history?clientId=1&limit=1000"
```

---

## 📝 Quick Test Script

Create a file `test-integration.sh`:

```bash
#!/bin/bash

API_KEY="l4stDQf/ZURzKdpcBI76YSli/D4CIKUtrD9mFI5Jno4="
BASE_URL="http://localhost:5001"

echo "🧪 Testing Bidirectional Integration"
echo "======================================"

echo "\n✅ Test 1: Health Check"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/data-export/health" | jq .

echo "\n✅ Test 2: Clients List"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/data-export/clients" | jq '.count'

echo "\n✅ Test 3: Products"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/data-export/products?limit=5" | jq '.count'

echo "\n✅ Test 4: Orders"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/data-export/orders?limit=5" | jq '.count'

echo "\n✅ Test 5: Inventory"
curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/api/data-export/inventory?limit=10" | jq '.count'

echo "\n✨ All tests complete!"
```

Run with:
```bash
chmod +x test-integration.sh
./test-integration.sh
```

---

## ✅ Integration Complete Checklist

- [ ] Repo 1 backend running
- [ ] Repo 2 AI API running
- [ ] Data export health check passes
- [ ] Data export returns actual data
- [ ] AI API can fetch data from Repo 1
- [ ] User can login and get JWT
- [ ] AI insights endpoints return data
- [ ] Logs show successful communication
- [ ] Performance is acceptable
- [ ] Error handling works correctly

---

**Status**: 🎉 Ready for Integration Testing  
**Both Services Running**: ✅ Yes  
**Configuration**: ✅ Complete  
**Next**: Run the tests above to verify everything works!

