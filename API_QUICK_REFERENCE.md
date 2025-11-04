# API Quick Reference Guide

## Data Type Changes Summary

| Old Type | New Type | Used For |
|----------|----------|----------|
| `Guid` | `int` | Products, Users, Clients, Inventory |
| `Guid` | `long` (bigint) | Orders, OrderItems |

## Key Endpoints

### 🌐 Public Endpoints (No Authentication)

#### Get All Products
```http
GET /api/public/products?clientId={optional}
```
**Response:**
```json
[
  {
    "productId": 1,
    "name": "Product Name",
    "cost": 10.50,
    "suggestedPrice": 15.00,
    "categoryName": "Category",
    "brandName": "Brand",
    "availableStock": 100
  }
]
```

#### Get Product by ID
```http
GET /api/public/products/{id}?clientId={optional}
```

#### Create Order
```http
POST /api/public/orders
```
**Body:**
```json
{
  "clientId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 5
    }
  ]
}
```

#### Get Order
```http
GET /api/public/orders/{id}
```

---

### 👤 Client Owner Endpoints (Requires Authentication)

#### Get Inventory Dashboard
```http
GET /api/store/inventory
Authorization: Bearer {firebase-token}
```
**Response:**
```json
{
  "clientId": 1,
  "clientName": "Client Name",
  "stock": [...],
  "recentOrders": [...],
  "metrics": {
    "totalProducts": 50,
    "totalQuantity": 1000,
    "lowStockCount": 5,
    "pendingOrders": 3
  }
}
```

#### Update Stock
```http
POST /api/store/inventory/update
Authorization: Bearer {firebase-token}
```
**Body:**
```json
{
  "productId": 1,
  "quantity": 100
}
```

#### Get Orders
```http
GET /api/store/orders?limit=50
Authorization: Bearer {firebase-token}
```

---

### 🔐 Admin Endpoints (Requires Admin Role)

#### Get Global Metrics
```http
GET /api/admin/inventory/distribution
Authorization: Bearer {firebase-token}
```

#### Get All Client Inventory
```http
GET /api/admin/inventory/clients
Authorization: Bearer {firebase-token}
```

#### Get CEDI Inventory
```http
GET /api/admin/inventory/cedi
Authorization: Bearer {firebase-token}
```

#### Get All Orders
```http
GET /api/admin/orders?limit=100
Authorization: Bearer {firebase-token}
```

#### Update Client Stock
```http
POST /api/admin/inventory/client/update?clientId={id}
Authorization: Bearer {firebase-token}
```
**Body:**
```json
{
  "productId": 1,
  "quantity": 100
}
```

#### Update CEDI Stock
```http
POST /api/admin/inventory/cedi/update
Authorization: Bearer {firebase-token}
```
**Body:**
```json
{
  "productId": 1,
  "quantity": 500
}
```

---

## Database Schema Mapping

### Products
```
product table → Product model
- product_id (int) → ProductId
- name → Name
- cost → Cost
- suggested_price → SuggestedPrice
- category_id → CategoryId
- brand_id → BrandId
```

### Orders
```
orders table → Order model
- order_id (bigint) → OrderId
- client_id (bigint) → ClientId
- status → Status
- is_active → IsActive
- created_at → CreatedAt
```

### Order Items
```
order_item table → OrderItem model
- order_item_id (bigint) → OrderItemId
- order_id (bigint) → OrderId
- product_id (bigint) → ProductId
- quantity → Quantity
```

### Inventory (Client)
```
inventory_client table → InventoryClient model
- inventory_client_id (int) → InventoryClientId
- product_id (int) → ProductId
- client_id (int) → ClientId
- stock (int) → Stock
- warehouse_location → WarehouseLocation
```

### Inventory (CEDI)
```
inventory_cedi table → InventoryCedi model
- inventory_cedi_id (int) → InventoryCediId
- product_id (int) → ProductId
- stock (int) → Stock
- warehouse_location → WarehouseLocation
```

### Clients
```
client table → Client model
- client_id (int) → ClientId
- name → Name
- email → Email
- phone → Phone
- address → Address
```

### Users
```
app_user table → User model
- user_id (int) → UserId
- username → Username
- email → Email
- password_hash → PasswordHash
- role_id (int) → RoleId
- client_id (int) → ClientId
- auth_user_id (uuid) → AuthUserId (Firebase UID)
```

---

## Authentication Flow

1. **User authenticates with Firebase** → Gets JWT token
2. **Token includes Firebase UID** → Mapped to `auth_user_id` in database
3. **Backend looks up user** → Using `GetUserByAuthUserIdAsync()`
4. **Checks role permissions** → Based on `role_id`
5. **Filters data by client** → If user is ClientOwner

---

## Common Response Formats

### Success Response
```json
{
  "data": {...}
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Validation Error
```json
{
  "message": "Product {id} is not available"
}
```

---

## Important Notes

1. **All IDs are now integers or bigints** - No more GUIDs
2. **Stock is separated** - Client inventory vs CEDI inventory
3. **Orders are simplified** - No customer info stored directly
4. **Products have categories and brands** - Relational data
5. **Multi-tenant system** - Each client is isolated

---

## Frontend Integration Tips

### When displaying products:
```typescript
// Old
const product = { id: "guid", price: 10.50 }

// New
const product = { productId: 1, cost: 10.50, suggestedPrice: 15.00 }
```

### When creating orders:
```typescript
// Old
const order = {
  storeId: "guid",
  customerName: "John",
  items: [...]
}

// New
const order = {
  clientId: 1,
  items: [...]
}
```

### When checking stock:
```typescript
// Old - single stock value
await api.getStock(productId)

// New - specify context
await api.getStock(productId, clientId) // Client-specific
await api.getStock(productId) // Total across all
```

---

## Migration Checklist

- [ ] Update all product ID references (Guid → int)
- [ ] Update all order ID references (Guid → long)
- [ ] Change "store" terminology to "client"
- [ ] Split stock queries (client vs CEDI)
- [ ] Remove customer info from order creation
- [ ] Update user authentication to use auth_user_id
- [ ] Change role checks to use role-based system
- [ ] Update price display (cost vs suggested_price)
- [ ] Add category/brand filters for products
- [ ] Update admin dashboard for multi-client view

