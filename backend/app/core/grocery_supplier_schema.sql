CREATE TYPE store_type AS ENUM ('GROCERY', 'SUPPLIER');
CREATE TYPE user_role AS ENUM ('OWNER', 'STAFF');
CREATE TYPE purchase_order_status AS ENUM
  ('PENDING', 'CONFIRMED', 'SHIPPING', 'RECEIVED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'TRANSFER');
CREATE TYPE notification_type AS ENUM ('PO_STATUS_CHANGED', 'LOW_STOCK', 'GENERAL');
CREATE TYPE category_mapping_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  store_type store_type NOT NULL,
  phone varchar(20),
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id),
  username varchar(50) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  full_name varchar(100) NOT NULL,
  phone varchar(20),
  role user_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_store_id_id UNIQUE (store_id, id)
);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE UNIQUE INDEX uq_one_owner_per_store ON users(store_id) WHERE role = 'OWNER';

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  full_name varchar(100) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode varchar(50) NOT NULL UNIQUE,
  original_name varchar(255) NOT NULL,
  image_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL UNIQUE,
  name varchar(100) NOT NULL
);

CREATE TABLE store_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id),
  name varchar(100) NOT NULL,
  category_id uuid REFERENCES categories(id),
  CONSTRAINT uq_store_category_name UNIQUE (store_id, name),
  CONSTRAINT uq_store_categories_store_id_id UNIQUE (store_id, id)
);
CREATE INDEX idx_store_categories_category_id ON store_categories(category_id);

CREATE TABLE category_mapping_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_category_id uuid NOT NULL REFERENCES store_categories(id),
  proposed_category_id uuid NOT NULL REFERENCES categories(id),
  status category_mapping_status NOT NULL DEFAULT 'PENDING',
  requested_by uuid NOT NULL REFERENCES users(id),
  reviewed_by uuid REFERENCES admin_users(id),
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT ck_mapping_review_state CHECK (
    (status = 'PENDING' AND reviewed_by IS NULL AND reviewed_at IS NULL)
    OR
    (status IN ('APPROVED', 'REJECTED')
      AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
  )
);
CREATE UNIQUE INDEX uq_pending_mapping_per_store_category
  ON category_mapping_requests(store_category_id) WHERE status = 'PENDING';
CREATE INDEX idx_mapping_requests_status_created
  ON category_mapping_requests(status, created_at);

CREATE TABLE store_inventories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id),
  product_id uuid NOT NULL REFERENCES products(id),
  store_category_id uuid,
  custom_name varchar(255),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  cost_price numeric(14, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  selling_price numeric(14, 2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 0 CHECK (low_stock_threshold >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_inventory_store_product UNIQUE (store_id, product_id),
  CONSTRAINT fk_inventory_category_same_store
    FOREIGN KEY (store_id, store_category_id)
    REFERENCES store_categories(store_id, id)
);
CREATE INDEX idx_store_inventories_category_id
  ON store_inventories(store_category_id);

CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_store_id uuid NOT NULL REFERENCES stores(id),
  supplier_store_id uuid NOT NULL REFERENCES stores(id),
  status purchase_order_status NOT NULL DEFAULT 'PENDING',
  total_amount numeric(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz,
  CONSTRAINT ck_purchase_different_stores
    CHECK (grocery_store_id <> supplier_store_id),
  CONSTRAINT fk_purchase_creator_same_grocery
    FOREIGN KEY (grocery_store_id, created_by) REFERENCES users(store_id, id)
);
CREATE INDEX idx_purchase_grocery_created
  ON purchase_orders(grocery_store_id, created_at DESC);
CREATE INDEX idx_purchase_supplier_created
  ON purchase_orders(supplier_store_id, created_at DESC);

CREATE TABLE purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14, 2) NOT NULL CHECK (unit_price >= 0),
  CONSTRAINT uq_purchase_item_product UNIQUE (purchase_order_id, product_id)
);
CREATE INDEX idx_purchase_order_items_product_id ON purchase_order_items(product_id);

CREATE TABLE sales_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id),
  cashier_id uuid NOT NULL,
  total_amount numeric(14, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method payment_method NOT NULL DEFAULT 'CASH',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_sale_cashier_same_store
    FOREIGN KEY (store_id, cashier_id) REFERENCES users(store_id, id)
);
CREATE INDEX idx_sales_store_created ON sales_orders(store_id, created_at DESC);

CREATE TABLE sales_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id uuid NOT NULL REFERENCES sales_orders(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14, 2) NOT NULL CHECK (unit_price >= 0),
  unit_cost numeric(14, 2) NOT NULL CHECK (unit_cost >= 0),
  CONSTRAINT uq_sales_item_product UNIQUE (sales_order_id, product_id)
);
CREATE INDEX idx_sales_order_items_product_id ON sales_order_items(product_id);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type notification_type NOT NULL,
  title varchar(150) NOT NULL,
  content text NOT NULL,
  purchase_order_id uuid REFERENCES purchase_orders(id),
  store_inventory_id uuid REFERENCES store_inventories(id),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_notification_reference CHECK (
    (type = 'PO_STATUS_CHANGED'
      AND purchase_order_id IS NOT NULL AND store_inventory_id IS NULL)
    OR
    (type = 'LOW_STOCK'
      AND store_inventory_id IS NOT NULL AND purchase_order_id IS NULL)
    OR
    (type = 'GENERAL'
      AND purchase_order_id IS NULL AND store_inventory_id IS NULL)
  )
);
CREATE INDEX idx_notifications_user_read_created
  ON notifications(user_id, is_read, created_at DESC);
