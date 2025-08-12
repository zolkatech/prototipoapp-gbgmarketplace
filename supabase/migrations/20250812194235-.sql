-- Prevent user_type privilege escalation by blocking updates to user_type
create or replace function public.prevent_user_type_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_type is distinct from old.user_type then
    raise exception 'Changing user_type is not allowed';
  end if;
  return new;
end;
$$;

-- Attach trigger to profiles table
drop trigger if exists trg_prevent_user_type_change on public.profiles;
create trigger trg_prevent_user_type_change
before update on public.profiles
for each row execute function public.prevent_user_type_change();