-- Add foreign key constraint to prices table
ALTER TABLE public.prices
ADD CONSTRAINT prices_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES public.products(id)
ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS prices_product_id_idx ON public.prices(product_id); 