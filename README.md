# myseum

## Setup

1. Install dependencies

```bash
yarn
```

2. Copy `.env.example` to `.env` and copy environment variables

3. Start the development server

```bash
yarn develop
```

## Supabase Setup

1. Set up a new project on Supabase. Store the secret and public keys in your `.env` file.

2. Run schema migration to ensure all tables are up and running:

   ```bash
   yarn db:migrate
   ```

3. In the Supabase dahboard, set up database functions and triggers.

   - Under `Database` / `Functions`, add two new functions:

     ```
     Name of function:  handle_insert_user
     Schema:            public
     Return type:       trigger

     Definition:
     --------------------------------------
       begin
         insert into public.users ("id", "name")
         values (new.id, split_part(new.email, '@', '1'));

         insert into public.museums ("id", "name", "curatorId")
         values (new.id, split_part(new.email, '@', '1') || '''s Museum', new.id);

         return new;
       end;
     --------------------------------------

     Language:          plpgsql
     Behavior:          volatile
     Type of security:  SECURITY DEFINER
     ```

     ```
     Name of function:  handle_delete_user
     Schema:            public
     Return type:       trigger

     Definition:
     --------------------------------------
       begin
         delete from public.users
         where old.id = id;

         delete from public.museums
         where old.id = "curatorId";

         return old;
       end;
     --------------------------------------

     Language:          plpgsql
     Behavior:          volatile
     Type of security:  SECURITY DEFINER
     ```

   - Under `Database` / `Triggers`, add two new triggers:

     ```
     Name of trigger:     on_insert_user
     Table:               users auth
     Events:              - [x] Insert
                          - [ ] Update
                          - [ ] Delete

     Trigger type:        After the event
     Orientation:         Row
     Function to trigger: handle_insert_user
     ```

     ```
     Name of trigger:     on_delete_user
     Table:               users auth
     Events:              - [ ] Insert
                          - [ ] Update
                          - [x] Delete

     Trigger type:        After the event
     Orientation:         Row
     Function to trigger: handle_delete_user
     ```

4. Under `Authentication` / `Settings`:

   - Add `http://localhost:3000/callback` to the Additional redirect URLs list

   - Disable the `Enable email signup` option

   - Enable Google OAuth. Follow [this guide](https://supabase.com/docs/guides/auth/auth-google) for detailed steps on setting this up.

5. You're now all set up!
