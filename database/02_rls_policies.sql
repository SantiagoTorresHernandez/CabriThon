-- CabriThon E-Commerce & Inventory Management System
-- Row-Level Security (RLS) Policies for Supabase

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

-- Get current user's role from users table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM users WHERE firebase_uid = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's store_id
CREATE OR REPLACE FUNCTION get_user_store_id()
RETURNS UUID AS $$
    SELECT store_id FROM users WHERE firebase_uid = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM users WHERE firebase_uid = auth.uid() AND role = 'Admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is store owner
CREATE OR REPLACE FUNCTION is_store_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM users WHERE firebase_uid = auth.uid() AND role = 'StoreOwner');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- STORES POLICIES
-- ============================================

-- Everyone can view stores (public info)
CREATE POLICY "Stores are viewable by everyone"
    ON stores FOR SELECT
    USING (true);

-- Only admins can modify stores
CREATE POLICY "Stores are modifiable by admins only"
    ON stores FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own record
CREATE POLICY "Users can view their own record"
    ON users FOR SELECT
    USING (firebase_uid = auth.uid() OR is_admin());

-- Users can update their own non-critical fields
CREATE POLICY "Users can update their own info"
    ON users FOR UPDATE
    USING (firebase_uid = auth.uid())
    WITH CHECK (firebase_uid = auth.uid() AND role = (SELECT role FROM users WHERE firebase_uid = auth.uid()));

-- Only admins can insert or delete users
CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Everyone can view active products
CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true OR is_admin());

-- Only admins can modify products
CREATE POLICY "Products are modifiable by admins only"
    ON products FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- STOCK POLICIES
-- ============================================

-- Customers can view stock (for availability)
CREATE POLICY "Stock is viewable by appropriate users"
    ON stock FOR SELECT
    USING (
        true  -- Everyone can view stock for product availability
    );

-- Store owners can view their store's stock
-- Admins can view all stock
CREATE POLICY "Stock modifications by store owners and admins"
    ON stock FOR UPDATE
    USING (
        is_admin() OR 
        (is_store_owner() AND store_id = get_user_store_id())
    )
    WITH CHECK (
        is_admin() OR 
        (is_store_owner() AND store_id = get_user_store_id())
    );

-- Only admins can insert new stock records
CREATE POLICY "Stock can be inserted by admins"
    ON stock FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can delete stock records
CREATE POLICY "Stock can be deleted by admins"
    ON stock FOR DELETE
    USING (is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Customers can view their own orders
-- Store owners can view orders for their store
-- Admins can view all orders
CREATE POLICY "Orders are viewable by authorized users"
    ON orders FOR SELECT
    USING (
        is_admin() OR
        (is_store_owner() AND store_id = get_user_store_id()) OR
        (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()))
    );

-- Anyone can create an order (for public checkout)
CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Store owners can update orders for their store
-- Admins can update all orders
CREATE POLICY "Orders can be updated by store owners and admins"
    ON orders FOR UPDATE
    USING (
        is_admin() OR
        (is_store_owner() AND store_id = get_user_store_id())
    )
    WITH CHECK (
        is_admin() OR
        (is_store_owner() AND store_id = get_user_store_id())
    );

-- Only admins can delete orders
CREATE POLICY "Orders can be deleted by admins only"
    ON orders FOR DELETE
    USING (is_admin());

-- ============================================
-- ORDER_ITEMS POLICIES
-- ============================================

-- Order items follow the same visibility as orders
CREATE POLICY "Order items viewable based on order access"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (
                is_admin() OR
                (is_store_owner() AND o.store_id = get_user_store_id()) OR
                (o.user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()))
            )
        )
    );

-- Anyone can insert order items (for checkout)
CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- Store owners and admins can update order items
CREATE POLICY "Order items can be updated by authorized users"
    ON order_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (
                is_admin() OR
                (is_store_owner() AND o.store_id = get_user_store_id())
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (
                is_admin() OR
                (is_store_owner() AND o.store_id = get_user_store_id())
            )
        )
    );

-- Only admins can delete order items
CREATE POLICY "Order items can be deleted by admins only"
    ON order_items FOR DELETE
    USING (is_admin());

-- ============================================
-- STOCK_HISTORY POLICIES
-- ============================================

-- Store owners can view history for their store
-- Admins can view all history
CREATE POLICY "Stock history viewable by authorized users"
    ON stock_history FOR SELECT
    USING (
        is_admin() OR
        (is_store_owner() AND store_id = get_user_store_id())
    );

-- Only system/admins can insert stock history
CREATE POLICY "Stock history can be inserted by admins"
    ON stock_history FOR INSERT
    WITH CHECK (is_admin());

-- History should not be modified or deleted (audit trail)
-- Only admins can modify in exceptional cases
CREATE POLICY "Stock history modifications by admins only"
    ON stock_history FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Stock history can be deleted by admins only"
    ON stock_history FOR DELETE
    USING (is_admin());

-- ============================================
-- GRANTS
-- ============================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- NOTES
-- ============================================

-- RLS Security Model:
-- 1. Customers (anon/authenticated without user record): Can view products, create orders, view their own orders
-- 2. StoreOwner: Can view/modify their store's stock and orders
-- 3. Admin: Full access to all data

-- For API access, you should use the service_role key in the backend
-- This bypasses RLS and allows the backend to implement its own authorization logic
-- based on Firebase Auth tokens

