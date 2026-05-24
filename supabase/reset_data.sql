-- ⚠️ DANGER — this wipes data in THIS project, which is ALSO your production
-- project (the one GitHub Pages reads). There is no separate test environment.
--
-- Run this ONCE, right before the program starts and BEFORE any real
-- participants have signed up. If you run it after real users exist, it will
-- delete them too.
--
-- What this does:
--   • deletes ALL sessions
--   • deletes ALL participants and their auth users (including admins — you'll
--     need to sign up again and re-grant admin afterward)
--   • KEEPS ventures
--
-- If you'd rather keep your admin login, use the commented variant at the
-- bottom instead of the `delete ... from public.participants` block.

-- 1) Sessions first (they reference participants).
truncate table public.sessions;

-- 2) All participants + their auth users. Deleting the auth user cascades the
--    participants row where an ON DELETE CASCADE exists; the explicit delete
--    cleans up otherwise.
delete from auth.users where id in (select id from public.participants);
delete from public.participants;

-- 3) Ventures are intentionally left untouched.

-- ── Variant: keep admin accounts ────────────────────────────────────────────
-- Replace step 2 above with:
--
-- delete from auth.users
-- where id in (select id from public.participants where role <> 'admin');
-- delete from public.participants where role <> 'admin';
