-- Seed ~9 weeks of check-in/out sessions for one participant, so the work-time
-- chart and session views have realistic data to render.
--
-- PREREQS (do these first):
--   1. Sign up malia.wakesho-ajwang@emory.edu in the app (creates the auth user
--      + participants row). Sessions can't exist without a real participant.
--   2. While signing up / in Profile, assign at least one venture. (If none are
--      assigned, this script falls back to attaching sessions across ALL
--      ventures so it still produces data.)
--
-- Run in the Supabase dashboard SQL editor. Safe to re-run: it deletes this
-- participant's existing sessions first, then regenerates them.
--
-- Assumes sessions.id / created_at / updated_at have defaults (gen_random_uuid()
-- / now()). If an insert complains about a missing column, tell me and I'll add
-- explicit values.

do $$
declare
  v_email text := 'malia.wakesho-ajwang@emory.edu';
  v_pid   uuid;
  v_vids  text[];   -- the participant's venture ids, as text (column-type agnostic)
begin
  -- 1) Resolve the participant.
  select p.id into v_pid
  from public.participants p
  where lower(p.email) = lower(v_email);

  if v_pid is null then
    raise exception 'No participant with email % — sign up in the app first.', v_email;
  end if;

  -- 2) Their assigned ventures (cast to text so we don't care if the id /
  --    venture_ids columns are uuid[] or text[]).
  select array_agg(e::text) into v_vids
  from public.participants p, unnest(p.venture_ids) as e
  where p.id = v_pid;

  -- Fall back to every venture if the participant has none assigned.
  if v_vids is null then
    select array_agg(id::text) into v_vids from public.ventures;
  end if;
  if v_vids is null then
    raise exception 'No ventures exist to attach sessions to.';
  end if;

  -- 3) Clean slate for a deterministic re-run.
  delete from public.sessions where participant_id = v_pid;

  -- 4) Generate sessions across the trailing 9 weeks, targeting ~40 h/week
  --    (the program's expectation of roughly a full-time week).
  --    - weekdays only, ~95% of days worked (a few days off)
  --    - two sessions per worked day: a morning block and an afternoon block
  --      with a lunch gap between them
  --    - morning  check-in 08:30–09:00, duration 3.5–4.5 h
  --    - afternoon check-in 13:45–14:15, duration 4.0–5.0 h
  --    => ~8.5 h/day × ~4.75 days ≈ 40 h/week
  insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at)
  select
    v_pid,
    v.id,
    c.ci,
    c.ci + make_interval(mins => c.dur_min)
  from generate_series(
         (current_date - interval '9 weeks')::timestamp,
         current_date::timestamp,
         interval '1 day'
       ) as g(day)
  -- Decide attendance ONCE per day: weekdays only, ~95% worked. Yields 0 or 1 row.
  cross join lateral (
    select g.day as day
    where extract(isodow from g.day) between 1 and 5  -- Mon–Fri
      and random() < 0.95
  ) as att(day)
  -- Two sessions on every worked day (1 = morning, 2 = afternoon).
  cross join lateral generate_series(1, 2) as n(n)
  -- A random venture from the participant's set.
  cross join lateral (
    select vt.id
    from public.ventures vt
    where vt.id::text = any(v_vids)
    order by random()
    limit 1
  ) as v
  -- Check-in time + duration per block.
  cross join lateral (
    select
      (
        att.day
        + (case when n.n = 1 then time '08:30' else time '13:45' end)
        + (random() * 0.5) * interval '1 hour'
      )::timestamptz as ci,
      (case when n.n = 1 then 210 + floor(random() * 60)   -- 3.5–4.5 h
                          else 240 + floor(random() * 60)   -- 4.0–5.0 h
       end)::int as dur_min
  ) as c;

  -- 5) One still-open session "now" to exercise the checked-in state.
  insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at)
  select v_pid,
         (select vt.id from public.ventures vt where vt.id::text = any(v_vids) limit 1),
         now() - interval '35 minutes',
         null;

  raise notice 'Seeded sessions for % (participant %).', v_email, v_pid;
end $$;
