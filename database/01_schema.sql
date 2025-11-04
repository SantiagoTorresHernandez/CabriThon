-- CabriThon E-Commerce & Inventory Management System
-- Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_distribution_center BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default distribution center
INSERT INTO stores (name, is_distribution_center)
VALUES ('Distribution Center', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- USERS TABLE
-- Linked to Firebase Auth UID
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Customer', 'StoreOwner', 'Admin')),
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster Firebase UID lookups
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_store_id ON users(store_id);

-- ============================================
-- PRODUCTS TABLE
-- General product catalog
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ============================================
-- STOCK TABLE
-- Multi-tenant inventory tracking
-- ============================================
CREATE TABLE IF NOT EXISTS stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    is_distribution_center_stock BOOLEAN DEFAULT false,
    last_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, store_id)
);

CREATE INDEX idx_stock_product_id ON stock(product_id);
CREATE INDEX idx_stock_store_id ON stock(store_id);
CREATE INDEX idx_stock_is_distribution_center ON stock(is_distribution_center_stock);

-- ============================================
-- ORDERS TABLE
-- Customer orders with multi-tenant support
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- ORDER_ITEMS TABLE
-- Line items for each order
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- STOCK_HISTORY TABLE
-- Track inventory changes for auditing
-- ============================================
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stock_history_stock_id ON stock_history(stock_id);
CREATE INDEX idx_stock_history_store_id ON stock_history(store_id);
CREATE INDEX idx_stock_history_created_at ON stock_history(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at columns
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample stores
INSERT INTO stores (name, address, phone, email, is_distribution_center)
VALUES 
    ('Downtown Store', '123 Main St, City, State 12345', '555-0101', 'downtown@cabrithon.com', false),
    ('Westside Store', '456 West Ave, City, State 12345', '555-0102', 'westside@cabrithon.com', false),
    ('Eastside Store', '789 East Blvd, City, State 12345', '555-0103', 'eastside@cabrithon.com', false)
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO products (name, description, sku, category, price, is_active)
VALUES 
    ('Laptop Pro 15"', 'High-performance laptop with 15-inch display', 'LAP-PRO-15', 'Electronics', 1299.99, true),
    ('Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 'MOU-WIR-01', 'Electronics', 29.99, true),
    ('Office Chair', 'Ergonomic office chair with lumbar support', 'CHR-OFF-01', 'Furniture', 249.99, true),
    ('Desk Lamp LED', 'Adjustable LED desk lamp with USB charging', 'LAM-DSK-01', 'Lighting', 39.99, true),
    ('Notebook Pack', 'Pack of 5 spiral notebooks', 'NOT-PAK-05', 'Office Supplies', 12.99, true)
ON CONFLICT DO NOTHING;

-- Sample stock for distribution center
INSERT INTO stock (product_id, store_id, quantity, is_distribution_center_stock)
SELECT 
    p.id,
    s.id,
    FLOOR(RANDOM() * 500 + 100)::INTEGER,
    true
FROM products p
CROSS JOIN stores s
WHERE s.is_distribution_center = true
ON CONFLICT (product_id, store_id) DO NOTHING;

-- Sample stock for retail stores
INSERT INTO stock (product_id, store_id, quantity, is_distribution_center_stock)
SELECT 
    p.id,
    s.id,
    FLOOR(RANDOM() * 50 + 10)::INTEGER,
    false
FROM products p
CROSS JOIN stores s
WHERE s.is_distribution_center = false
ON CONFLICT (product_id, store_id) DO NOTHING;

-- Sample admin user (you'll need to replace with actual Firebase UID)
-- INSERT INTO users (firebase_uid, email, role, full_name)
-- VALUES ('your-firebase-admin-uid', 'admin@cabrithon.com', 'Admin', 'System Administrator')
-- ON CONFLICT DO NOTHING;

