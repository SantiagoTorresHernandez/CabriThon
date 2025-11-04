# Database Alignment Changes

This document summarizes the changes made to align the CabriThon codebase with the Supabase database schema.

## Overview

The codebase has been updated to match the Supabase database structure. The main changes involve:
- Updating data types (from Guid to int/bigint)
- Renaming entities (Store → Client)
- Separating inventory into two tables (inventory_client and inventory_cedi)
- Aligning with the actual database schema

## Model Changes

### 1. Product Model (`Product.cs`)
**Changes:**
- `Id` (Guid) → `ProductId` (int)
- Removed: `Description`, `Sku`, `ImageUrl`, `IsActive`
- Added: `Cost`, `SuggestedPrice`, `CategoryId`, `SubcategoryId`, `Size`, `BrandId`, `SubbrandId`
- Added navigation properties for Category, Subcategory, Brand, Subbrand

**Database Table:** `product`

### 2. Order Model (`Order.cs`)
**Changes:**
- `Id` (Guid) → `OrderId` (long/bigint)
- `StoreId` → `ClientId`
- Removed: `OrderNumber`, `UserId`, `TotalAmount`, `ShippingAddress`, `CustomerName`, `CustomerEmail`, `CustomerPhone`, `Notes`, `UpdatedAt`
- Added: `IsActive`
- Simplified to only essential fields

**Database Table:** `orders`

### 3. OrderItem Model (`OrderItem.cs`)
**Changes:**
- `Id` (Guid) → `OrderItemId` (long/bigint)
- `OrderId`, `ProductId` changed to long/bigint
- Removed: `UnitPrice`, `Subtotal`, `CreatedAt`
- Only keeps: `Quantity`

**Database Table:** `order_item`

### 4. Stock → Inventory Models (`Stock.cs`)
**Major Restructure:**
- Split into two separate models:
  - `InventoryCedi`: Distribution center inventory
  - `InventoryClient`: Client-specific inventory
- Changed IDs from Guid to int
- `Quantity` → `Stock`
- Removed: `IsDistributionCenterStock`, `LastUpdatedBy`, `CreatedAt`, `UpdatedAt`
- Added: `WarehouseLocation`

**Database Tables:** `inventory_cedi`, `inventory_client`

### 5. Store → Client Model (`Store.cs` → `Client.cs`)
**Changes:**
- Renamed from Store to Client
- `Id` (Guid) → `ClientId` (int)
- Removed: `IsDistributionCenter`, `UpdatedAt`
- Kept: `Name`, `Email`, `Phone`, `Address`, `CreatedAt`

**Database Table:** `client`

### 6. User Model (`User.cs`)
**Major Changes:**
- `Id` (Guid) → `UserId` (int)
- `FirebaseUid` → `AuthUserId` (Guid?)
- Removed: `FullName`, `Phone`, `UpdatedAt`
- Added: `Username`, `PasswordHash`, `RoleId`, `ClientId`, `IsActive`, `LastLogin`
- Changed from simple role string to `RoleId` foreign key

**Database Table:** `app_user`

### 7. New Models Added

#### Brand & Subbrand (`Brand.cs`)
```csharp
- Brand: BrandId, Name
- Subbrand: SubbrandId, BrandId, Name
```

#### Category & Subcategory (`Category.cs`)
```csharp
- Category: CategoryId, Name, Description
- Subcategory: SubcategoryId, CategoryId, Name
```

#### Role & Permission (`User.cs`)
```csharp
- Role: RoleId, Name, Description
- Permission: PermissionId, Name, Module, Description
```

## DTO Changes

### ProductDto
- Updated to include category, brand, and subbrand information
- Changed to use `SuggestedPrice` instead of `Price`
- Removed SKU and Description

### OrderDto
- Simplified to match database structure
- Removed shipping and customer information
- `TotalAmount` is now calculated from items

### InventoryDto
- Split into `InventoryCediDto` and `InventoryClientDto`
- Renamed metrics classes to reflect client-based structure

## Repository Changes

### ProductRepository
- `GetAllActiveProductsAsync()` → `GetAllProductsAsync()` - returns ProductDto with joined data
- Changed all IDs from Guid to int
- Updated queries to join with category, brand tables

### StockRepository
- Completely restructured to handle separate inventory tables
- `GetStockByStoreIdAsync()` → `GetStockByClientIdAsync()`
- New methods: `UpdateClientStockQuantityAsync()`, `UpdateCediStockQuantityAsync()`
- Separate methods for client and CEDI inventory

### OrderRepository
- Updated to work with bigint IDs
- `GetOrdersByStoreIdAsync()` → `GetOrdersByClientIdAsync()`
- Removed `GetOrdersByUserIdAsync()` (not in current DB schema)
- Orders now reference clients, not stores

### UserRepository
- `GetUserByFirebaseUidAsync()` → `GetUserByAuthUserIdAsync()`
- Updated to use `app_user` table
- Changed to work with role_id and client_id foreign keys

## Controller Changes

### PublicController
- Updated to work with new ProductDto structure
- Added optional `clientId` parameter to filter stock by client
- Changed order creation to use simplified structure
- All IDs updated from Guid to int/long

### StoreController (ClientOwner endpoints)
- Policy changed from "StoreOwner" to "ClientOwner"
- `GetUserByFirebaseUidAsync()` → `GetUserByAuthUserIdAsync()`
- Works with client inventory instead of store inventory
- Updated to use `ClientInventoryDashboardDto`

### AdminController
- Restructured to work with client/CEDI inventory split
- New endpoints:
  - `/inventory/clients` - Get all client inventory
  - `/inventory/cedi` - Get CEDI inventory
  - `/inventory/client/update` - Update client stock
  - `/inventory/cedi/update` - Update CEDI stock
- Metrics now reflect client-based structure

## Configuration Changes

### Program.cs
- Authorization policy renamed: "StoreOwner" → "ClientOwner"

## API Endpoints Summary

### Public Endpoints (No Auth Required)
- `GET /api/public/products` - Get all products with optional clientId filter
- `GET /api/public/products/{id}` - Get specific product
- `POST /api/public/orders` - Create order (requires clientId in body)
- `GET /api/public/orders/{id}` - Get order by ID

### Client Owner Endpoints (Requires ClientOwner Role)
- `GET /api/store/inventory` - Get client's inventory dashboard
- `POST /api/store/inventory/update` - Update client's stock
- `GET /api/store/orders` - Get client's orders

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/inventory/distribution` - Get global metrics and summaries
- `GET /api/admin/inventory/clients` - Get all client inventory
- `GET /api/admin/inventory/cedi` - Get CEDI inventory
- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/inventory/client/update` - Update any client's stock
- `POST /api/admin/inventory/cedi/update` - Update CEDI stock

## Database Tables Used

The API now correctly maps to these Supabase tables:
- `product` - Product catalog
- `category`, `subcategory` - Product categorization
- `brand`, `subbrand` - Brand information
- `inventory_client` - Client-specific inventory
- `inventory_cedi` - Distribution center inventory
- `orders` - Order records
- `order_item` - Order line items
- `client` - Client/store information
- `app_user` - User accounts
- `role` - User roles
- `permission` - Permissions

## Tables NOT Used by This API

These tables are present in the database but are managed by other systems (likely the AI agent system):
- `alertas_inventario` - Inventory alerts
- `predicciones_ventas` - Sales predictions
- `resumen_predicciones` - Prediction summaries
- `promotion` - Promotions
- `promotion_metrics` - Promotion metrics
- `promotion_product` - Promotion products
- `suggested_order` - Suggested orders
- `suggested_order_item` - Suggested order items
- `role_permission` - Role permission mapping

## Important Notes

1. **No IsActive/IsDeleted on Products**: The current database schema doesn't have an `is_active` flag on products. All products are considered active.

2. **Order Simplification**: Orders in the database are simpler than the original implementation. They don't store customer information, shipping addresses, or total amounts directly. These can be calculated from order items.

3. **User Authentication**: Users now have an optional `auth_user_id` field (Firebase UID) that links to the Firebase authentication system, while also maintaining the traditional username/password fields.

4. **Role-Based Access**: The system now uses a proper role-based access control with role_id foreign keys instead of simple role strings.

5. **Multi-Tenant Architecture**: The database is designed for a multi-tenant system where each client represents a separate store/business.

## Migration Considerations

If you have existing data:
1. Migrate Store → Client data
2. Split stock data into inventory_client and inventory_cedi
3. Update order records to reference clients instead of stores
4. Migrate user data to include username and role_id
5. Ensure all GUIDs are converted to appropriate integer types

## Testing Recommendations

1. Test product listing with category/brand joins
2. Test order creation with the simplified structure
3. Verify inventory separation between clients and CEDI
4. Test authentication with the new user structure
5. Verify role-based access control
6. Test admin endpoints for managing multiple clients

## Next Steps

1. Update frontend to work with the new API structure
2. Implement proper user registration/authentication flow
3. Add validation for role-based permissions
4. Consider adding endpoints to interact with AI predictions (if needed)
5. Add pagination for large result sets
6. Implement proper error handling and logging

