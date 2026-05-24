-- Keeps public.participants.email in sync with the auth credential.
--
-- The sign-in email lives in auth.users. participants.email is just a copy
-- (first set by the handle_new_user() signup trigger). When a user changes
-- their email via Supabase's secure email-change flow, auth.users.email is
-- updated only AFTER they confirm the links — at which point this trigger
-- copies the new value into participants so the app's displayed email matches.
--
-- Run this once in the Supabase dashboard SQL editor.

create or replace function public.sync_participant_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.participants set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_email_change on auth.users;
create trigger on_auth_email_change
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_participant_email();
