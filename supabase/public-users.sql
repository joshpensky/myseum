-- https://supabase.io/docs/guides/auth#create-a-publicusers-table
-- https://supabase.io/docs/guides/api#managing-realtime

-- inserts a row into public.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- trigger the create function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- deletes a row from public.users
create function public.handle_delete_user()
returns trigger as $$
begin
  delete from public.users
  where old.id = id;
  return old;
end;
$$ language plpgsql security definer;

-- trigger the delete function every time a user is deleted
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_delete_user();
