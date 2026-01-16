-- Create Products table first (if not already exists)
-- This is the main products table that sup_img_product will reference
CREATE TABLE IF NOT EXISTS public.Products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  image VARCHAR(500),
  discount NUMERIC,
  productTypeId BIGINT,
  shopId BIGINT,
  userId BIGINT,
  saleTypeId BIGINT,
  status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the sup_img_product table
CREATE TABLE IF NOT EXISTS public.sup_img_product (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES public.Products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sup_img_product_productId ON sup_img_product(product_id);

-- Enable RLS (Row Level Security)
ALTER TABLE sup_img_product ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view product images for their products" ON sup_img_product;
DROP POLICY IF EXISTS "Users can insert images for their products" ON sup_img_product;
DROP POLICY IF EXISTS "Users can update images for their products" ON sup_img_product;
DROP POLICY IF EXISTS "Users can delete images for their products" ON sup_img_product;

-- Create simplified RLS policies
-- Allow all authenticated users to view images
CREATE POLICY "Enable read access for authenticated users" ON sup_img_product
  FOR SELECT USING (true);

-- Allow all authenticated users to insert images
CREATE POLICY "Enable insert for authenticated users" ON sup_img_product
  FOR INSERT WITH CHECK (true);

-- Allow all authenticated users to update images
CREATE POLICY "Enable update for authenticated users" ON sup_img_product
  FOR UPDATE USING (true);

-- Allow all authenticated users to delete images
CREATE POLICY "Enable delete for authenticated users" ON sup_img_product
  FOR DELETE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sup_img_product TO authenticated;
GRANT SELECT ON sup_img_product TO anon;
