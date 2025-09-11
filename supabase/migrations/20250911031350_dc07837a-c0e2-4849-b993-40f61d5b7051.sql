-- Relax supplier filter: return profile details for any given id, SECURITY DEFINER handles access
CREATE OR REPLACE FUNCTION public.get_supplier_public_details(_id uuid)
RETURNS TABLE(
  id uuid,
  business_name text,
  full_name text,
  city text,
  state text,
  avatar_url text,
  bio text,
  phone text,
  whatsapp text,
  email text,
  address text,
  website text,
  instagram text,
  cep text,
  specialties text[]
) AS $$
  SELECT 
    p.id,
    p.business_name,
    p.full_name,
    p.city,
    p.state,
    p.avatar_url,
    p.bio,
    p.phone,
    p.whatsapp,
    p.email,
    p.address,
    p.website,
    p.instagram,
    p.cep,
    p.specialties
  FROM public.profiles p
  WHERE p.id = _id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public';