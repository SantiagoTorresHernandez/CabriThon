# Architecture Documentation

## System Overview

CabriThon is a full-stack e-commerce and multi-tenant inventory management system designed with a clean architecture approach, emphasizing separation of concerns, security, and scalability.

## Technology Stack

### Backend
- **.NET 9 Web API** (C#)
  - RESTful API design
  - JWT Bearer authentication
  - Policy-based authorization
  - Dependency injection

### Frontend
- **React.js 18** with TypeScript
  - Functional components with Hooks
  - Context API for state management
  - React Router for navigation
  - Recharts for data visualization

### Database
- **Supabase (PostgreSQL)**
  - Row-Level Security (RLS)
  - Stored procedures and triggers
  - Full ACID compliance

### Authentication & Storage
- **Firebase Authentication**
  - Email/Password provider
  - Google OAuth
  - Custom claims for roles
- **Firebase Storage**
  - Product image hosting
  - Security rules for access control

## Architecture Patterns

### Backend Architecture

```
┌─────────────────────────────────────────────┐
│           API Layer (Controllers)            │
│  - PublicController                          │
│  - StoreController (Auth: StoreOwner)        │
│  - AdminController (Auth: Admin)             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│        Application Layer (Services)          │
│  - Business Logic                            │
│  - Data Transformation                       │
│  - Validation                                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Infrastructure Layer (Repositories)     │
│  - ProductRepository                         │
│  - StockRepository                           │
│  - OrderRepository                           │
│  - UserRepository                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│         Data Layer (Supabase)                │
│  - PostgreSQL Database                       │
│  - Row-Level Security                        │
│  - Stored Procedures                         │
└──────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────┐
│              App Component                   │
│         (Router & AuthProvider)              │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───┴────┐  ┌─────┴─────┐  ┌────┴─────┐
│ Store  │  │   Owner   │  │  Admin   │
│ Module │  │ Dashboard │  │Dashboard │
└────────┘  └───────────┘  └──────────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│          Services & Contexts                 │
│  - API Service (axios)                       │
│  - Auth Context (Firebase)                   │
│  - Firebase Config                           │
└──────────────────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
1. User Signs In → Firebase Auth
2. Firebase Issues JWT Token
3. Frontend Stores Token
4. Frontend Sends Token in API Requests
5. Backend Validates Token with Firebase
6. Backend Checks Custom Claims (Role)
7. Backend Enforces Authorization Policy
8. Backend Queries Supabase with Service Role Key
9. Supabase Applies RLS Policies (defense in depth)
10. Response Returns to Frontend
```

### Role-Based Access Control (RBAC)

#### Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **Customer** | Public + Own Data | Can browse products, place orders, view own order history |
| **StoreOwner** | Store-specific | Can manage inventory and view orders for their assigned store |
| **Admin** | Global | Full access to all stores, distribution center, and analytics |

#### Role Assignment

Roles are managed through:
1. **Firebase Custom Claims** - Set on Firebase Auth user
2. **Database User Table** - Role column in `users` table
3. **Both must match** for proper authorization

### Data Security Layers

#### Layer 1: Network Security
- HTTPS only in production
- CORS configured for known origins
- Rate limiting (recommended for production)

#### Layer 2: Authentication
- Firebase JWT token validation
- Token expiration enforcement
- Secure token storage (httpOnly cookies recommended)

#### Layer 3: Authorization
- .NET Policy-based authorization
- Role checking in middleware
- Custom authorization handlers

#### Layer 4: Database Security (RLS)
- Row-Level Security policies in Supabase
- Store owners only see their store's data
- Admins bypass RLS with service role key
- Customers only access public data and own orders

## Database Schema

### Entity Relationship Diagram

```
┌────────────┐
│   stores   │
└─────┬──────┘
      │
      │ 1:N
      │
┌─────┴──────┐      ┌──────────┐
│   users    │──────│ firebase │
└─────┬──────┘ N:1  │   auth   │
      │             └──────────┘
      │ 1:N
      │
┌─────┴──────┐
│   orders   │
└─────┬──────┘
      │ 1:N
      │
┌─────┴──────────┐      ┌──────────┐
│  order_items   │──────│ products │
└────────────────┘ N:1  └────┬─────┘
                              │
                              │ 1:N
                              │
                         ┌────┴─────┐
                         │  stock   │
                         └──────────┘
```

### Key Tables

#### stores
- Primary entity for multi-tenancy
- `is_distribution_center` flag differentiates DC from retail stores

#### users
- Links Firebase Auth UID to application data
- `role` column defines access level
- `store_id` foreign key for store owners

#### products
- Central product catalog
- Shared across all stores
- `is_active` flag for soft deletion

#### stock
- Multi-tenant inventory tracking
- Composite unique key: `(product_id, store_id)`
- `is_distribution_center_stock` flag for DC inventory

#### orders
- Customer orders linked to specific stores
- `status` field for order lifecycle
- Linked to user (optional for guest checkout)

#### order_items
- Line items for each order
- Captures price at time of order (historical data)

## API Design

### RESTful Endpoints

#### Public Endpoints (No Auth Required)
```
GET  /api/public/products          # Get all active products
POST /api/public/orders            # Place an order
GET  /api/public/orders/{id}       # Get order by ID
```

#### Store Owner Endpoints (Auth: StoreOwner or Admin)
```
GET  /api/store/inventory          # Get store's inventory dashboard
POST /api/store/inventory/update   # Update stock quantity
GET  /api/store/orders             # Get store's orders
```

#### Admin Endpoints (Auth: Admin only)
```
GET  /api/admin/inventory/distribution  # Get DC inventory & global metrics
GET  /api/admin/inventory/all           # Get all inventory across stores
GET  /api/admin/orders                  # Get all orders
POST /api/admin/inventory/update        # Update any store's stock
```

### Response Format

#### Success Response
```json
{
  "id": "uuid",
  "name": "Product Name",
  "price": 29.99,
  ...
}
```

#### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST that creates a resource
- `400 Bad Request` - Validation error or malformed request
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but lacking permission
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side error

## Frontend Architecture

### Module Structure

#### 1. Store Module (Public)
- **Purpose**: Customer-facing e-commerce experience
- **Features**:
  - Product browsing with category filtering
  - Shopping cart management
  - Checkout flow
- **UX Focus**: WCAG 2.1 AA compliance, large touch targets, clear text

#### 2. Store Owner Module (Authenticated)
- **Purpose**: Single-store inventory management
- **Features**:
  - View store-specific inventory
  - Update stock quantities
  - View recent orders
  - Basic metrics dashboard
- **UX Focus**: Simple, task-oriented interface

#### 3. Admin Module (Authenticated)
- **Purpose**: Global oversight and distribution center management
- **Features**:
  - Comprehensive analytics dashboard
  - Distribution center inventory view
  - Multi-store comparison
  - Interactive charts and visualizations
- **UX Focus**: Data-rich interface for technical users

### State Management

#### Global State (Context API)
- **AuthContext**: User authentication state, role, and auth methods
- Accessible throughout the app via `useAuth()` hook

#### Local State (Component State)
- Module-specific data (products, inventory, orders)
- UI state (loading, errors, selected tabs)
- Form data

### Routing Strategy

```
/                  → Store (Public)
/store             → Store (Public)
/login             → Login (Public)
/dashboard         → Role-based redirect
/owner             → Store Owner Dashboard (Auth: StoreOwner)
/admin             → Admin Dashboard (Auth: Admin)
```

### API Integration

- **Axios** for HTTP requests
- Interceptor adds JWT token to all requests
- Centralized error handling
- Type-safe API responses with TypeScript

## Data Flow Examples

### Example 1: Customer Places Order

```
1. Customer adds products to cart (Frontend State)
2. Customer clicks "Checkout"
3. Frontend validates cart items
4. Frontend sends POST /api/public/orders
5. Backend validates products exist and are active
6. Backend checks stock availability
7. Backend creates order record (transaction)
8. Backend creates order_item records
9. Backend returns order confirmation
10. Frontend displays success message
11. Frontend clears cart
```

### Example 2: Store Owner Updates Stock

```
1. Store Owner logs in (Firebase Auth)
2. Frontend requests /api/store/inventory (with JWT)
3. Backend validates token and extracts Firebase UID
4. Backend queries users table to get store_id
5. Backend queries stock filtered by store_id
6. Frontend displays inventory
7. Owner updates quantity for a product
8. Frontend sends POST /api/store/inventory/update
9. Backend validates authorization (store_id match)
10. Backend updates stock quantity
11. Backend records change in stock_history
12. Frontend refreshes inventory display
```

### Example 3: Admin Views Global Analytics

```
1. Admin logs in (Firebase Auth with Admin role)
2. Frontend requests /api/admin/inventory/distribution
3. Backend validates token and checks role = 'Admin'
4. Backend aggregates data:
   - All stock across stores
   - Distribution center specific stock
   - Store-wise summaries
   - Global metrics (totals, revenue)
5. Backend returns comprehensive dashboard data
6. Frontend renders:
   - Metric cards
   - Bar charts (Recharts)
   - Data tables with filtering
```

## Scalability Considerations

### Backend Scalability

#### Horizontal Scaling
- Stateless API design (no server-side sessions)
- Can deploy multiple instances behind load balancer
- Cloud Run auto-scales based on traffic

#### Database Optimization
- Indexed columns for frequent queries
- Connection pooling
- Query optimization with proper JOIN strategies

#### Caching Strategy (Future)
- Redis for frequently accessed data
- Cache product catalog
- Cache stock levels with TTL

### Frontend Scalability

#### Performance Optimization
- Code splitting with React.lazy
- Image optimization and lazy loading
- Debouncing search and filter operations
- Pagination for large data sets

#### CDN Distribution
- Firebase Hosting includes CDN
- Static assets served from edge locations
- Automatic HTTPS

## Deployment Architecture

### Production Environment

```
┌──────────────┐
│   Firebase   │
│   Hosting    │  ← React App (CDN)
└──────┬───────┘
       │
       │ HTTPS
       │
┌──────┴───────┐
│  Cloud Run   │  ← .NET 9 API (Auto-scale)
└──────┬───────┘
       │
       ├──────→ ┌─────────────┐
       │        │  Supabase   │  ← PostgreSQL Database
       │        └─────────────┘
       │
       └──────→ ┌─────────────┐
                │  Firebase   │  ← Auth & Storage
                └─────────────┘
```

### Infrastructure as Code (Future)
- Terraform for cloud resources
- GitHub Actions for CI/CD
- Automated testing pipeline

## Monitoring & Observability

### Logging
- Backend: Structured logging with .NET ILogger
- Frontend: Console logging (development) / Sentry (production)
- Cloud Run: Automatic log aggregation

### Metrics
- Cloud Run: Request rate, latency, error rate
- Firebase: Auth metrics, hosting bandwidth
- Supabase: Database performance metrics

### Alerts (Recommended)
- High error rate
- Slow API response times
- Database connection issues
- Low stock alerts

## Future Enhancements

### Technical Improvements
- [ ] Implement caching layer (Redis)
- [ ] Add WebSocket support for real-time inventory updates
- [ ] Implement GraphQL API alongside REST
- [ ] Add comprehensive unit and integration tests
- [ ] Setup CI/CD pipeline
- [ ] Implement API rate limiting
- [ ] Add audit logging for all modifications

### Feature Enhancements
- [ ] Email notifications (order confirmations, low stock alerts)
- [ ] Advanced analytics and reporting
- [ ] Inventory forecasting with ML
- [ ] Mobile app (React Native)
- [ ] Barcode scanning for inventory management
- [ ] Automated reordering from distribution center
- [ ] Multi-language support (i18n)

### Security Enhancements
- [ ] Two-factor authentication
- [ ] IP whitelisting for admin access
- [ ] Automated security scanning
- [ ] PCI DSS compliance for payment processing
- [ ] GDPR compliance tools (data export, deletion)

## Conclusion

This architecture provides a solid foundation for a scalable, secure, and maintainable e-commerce and inventory management system. The separation of concerns, multi-tenant support, and role-based access control make it suitable for real-world deployment and future growth.

