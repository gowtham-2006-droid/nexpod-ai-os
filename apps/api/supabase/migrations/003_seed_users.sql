-- Seed Admin & Customer credentials into Supabase PostgreSQL users table
insert into users (id, email, password_hash, role)
values 
  ('usr_admin_innovex', 'innovex', 'f664d4c72dad36876db124de215b2a2be402bb019e2dbc30e254d2108accaebd', 'admin'),
  ('usr_admin_innovex_email', 'innovex@nexpod.ai', 'f664d4c72dad36876db124de215b2a2be402bb019e2dbc30e254d2108accaebd', 'admin'),
  ('usr_admin_01', 'admin@nexpod.ai', '33c591b80852c7a21650077c035ce89f368239806a2449d0a7d79ba201c4f709', 'admin'),
  ('usr_cust_01', 'customer@nexpod.ai', '57acf21a8ca205afb315ae23619432b000e6ecd4e9532284d830f0bb92d97b76', 'user')
on conflict (email) do update set 
  password_hash = excluded.password_hash,
  role = excluded.role;
