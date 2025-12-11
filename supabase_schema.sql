-- Create a table for orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone_number text, -- Added phone number
  product_type text not null, -- 'pin' or 'keychain'
  size text not null,
  quantity integer not null,
  size_details jsonb not null, -- Stores the full size object
  image_data text, -- Storing base64 string directly for now
  image_transform jsonb, -- Stores {scale, x, y}
  status text default 'pending' -- 'pending', 'processing', 'completed'
);

-- Set up Row Level Security (RLS)
-- For this simple app without auth, we might need to open it up or use anon key with policy.
-- CAUTION: This allows anyone with the anon key (public) to insert/read.
alter table orders enable row level security;

create policy "Enable all access for all users"
on "public"."orders"
as PERMISSIVE
for ALL
to public
using (true)
with check (true);
