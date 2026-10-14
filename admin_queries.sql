-- ============================================================================
-- SHOPSPHERE - DYNAMIC SQL TEMPLATES (BUYER & SELLER DISTINCTION)
-- Pure SQL structure for MySQL Workbench (No Fake Data)
-- ============================================================================

USE shopsphere;

-- ============================================================================
-- 1. SELLER ACCOUNT CREATION & STORE REGISTRATION QUERIES
-- ============================================================================

-- Step 1.1: Insert Seller User Record into `users` table
INSERT INTO users (name, email, password, phone, role, active)
VALUES (?, ?, ?, ?, 'SELLER', true);

-- Step 1.2: Insert Seller Merchant Details into `sellers` table
INSERT INTO sellers (user_id, store_name, gst_number, selling_category, product_details, approval_status)
VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, 'PENDING');

-- Step 1.3: Insert Buyer Account (Standard Shopper Registration)
INSERT INTO users (name, email, password, phone, role, active)
VALUES (?, ?, ?, ?, 'BUYER', true);

-- ============================================================================
-- 2. SELLER DASHBOARD QUERIES (SELLER PRODUCT LISTING)
-- ============================================================================

-- 2.1 Fetch Seller Merchant Store Profile
SELECT 
    s.id AS seller_table_id,
    s.store_name,
    s.gst_number,
    s.selling_category,
    s.product_details,
    s.approval_status,
    u.name AS seller_name,
    u.email,
    u.phone
FROM sellers s
JOIN users u ON s.user_id = u.id
WHERE u.id = ?;

-- 2.2 Seller Listing a New Product under their Account
INSERT INTO products (name, description, price, old_price, image, category_id, seller_id, active)
VALUES (?, ?, ?, ?, ?, ?, ?, true);

-- 2.3 Set Inventory Stock Quantity for Seller's Product
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
VALUES (LAST_INSERT_ID(), ?, 5);

-- 2.4 Fetch All Products Listed by a Specific Seller
SELECT 
    p.id, p.name, p.description, c.name AS category_name, 
    p.price, p.old_price, p.image, COALESCE(i.quantity, 0) AS stock, 
    p.rating, p.active
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.seller_id = ?
ORDER BY p.created_at DESC;

-- 2.5 Seller Updating Existing Product Price or Stock
UPDATE products 
SET price = ?, old_price = ?, description = ? 
WHERE id = ? AND seller_id = ?;

UPDATE inventory 
SET quantity = ? 
WHERE product_id = ?;

-- 2.6 Seller Deleting Their Product Listing
DELETE FROM products WHERE id = ? AND seller_id = ?;

-- ============================================================================
-- 3. ADMIN SELLER CONTROL & APPROVAL QUERIES
-- ============================================================================

-- 3.1 Fetch All Sellers for Admin Review
SELECT 
    s.id AS seller_id,
    s.store_name,
    s.gst_number,
    s.selling_category,
    s.product_details,
    s.approval_status,
    u.name AS owner_name,
    u.email,
    u.phone,
    u.active AS account_active,
    COUNT(p.id) AS total_products_listed
FROM sellers s
JOIN users u ON s.user_id = u.id
LEFT JOIN products p ON u.id = p.seller_id
GROUP BY s.id, s.store_name, s.gst_number, s.selling_category, s.product_details, s.approval_status, u.name, u.email, u.phone, u.active;

-- 3.2 Admin Approve / Reject Seller Application
UPDATE sellers 
SET approval_status = ? 
WHERE id = ?;

-- 3.3 Admin Activate / Deactivate Seller User Account
UPDATE users 
SET active = ? 
WHERE id = ? AND role = 'SELLER';
