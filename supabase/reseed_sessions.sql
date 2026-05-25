-- Wipe ALL sessions and regenerate ~10 weeks of them for the participants that
-- already exist in the database. Creates no users — it reads members straight
-- from public.participants (role = 'participant') and groups them by their
-- venture (venture_ids[0]). Each venture logs ~40 h/week, split across its
-- members, with phase-appropriate notes.
--
-- Run in the Supabase dashboard SQL editor. Safe to re-run.

do $$
declare
  v_start timestamp := (current_date - interval '10 weeks')::timestamp;

  -- Session notes by program phase (weeks 0–2 / 3–6 / 7–9 over the 10 weeks).
  v_notes_early text[] := array[
    'Customer discovery interviews with target users',
    'Mapped the problem space and riskiest assumptions',
    'Drafted value proposition and ideal customer profile',
    'Competitive landscape research',
    'Synthesized interview notes into key insights',
    'Refined problem statement after mentor feedback',
    'Recruited and scheduled interviewees',
    'Defined hypotheses and what to test first',
    'Surveyed early users to size the pain point'
  ];
  v_notes_mid text[] := array[
    'Built MVP wireframes and core user flows',
    'Set up landing page and waitlist',
    'Developed the first feature prototype',
    'Ran usability tests on the prototype',
    'Iterated on the MVP from user feedback',
    'Integrated auth and payments into the build',
    'Set up product analytics and event tracking',
    'Fixed bugs and polished onboarding',
    'Shipped MVP to first pilot users'
  ];
  v_notes_late text[] := array[
    'Drafted pitch deck for demo day',
    'Practiced investor pitch with mentors',
    'Built go-to-market and pricing plan',
    'Outreach to first paying customers',
    'Built financial model and projections',
    'Rehearsed demo day script',
    'Lined up pilot and LOI agreements',
    'Refined traction metrics and KPI dashboard',
    'Closed first paid customers'
  ];
begin
  -- 1) Clear every session.
  truncate table public.sessions;

  -- 2) Regenerate: ~40 h/week per venture, split across that venture's members.
  --    Each member ~ (540/m) min on ~90% of weekdays, ±20% noise
  --    => venture ≈ m × 5 × 0.9 × (540/m) ≈ 40 h/week.
  insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at, notes)
  with members as (
    select p.id as pid, (p.venture_ids->>0)::uuid as vid
    from public.participants p
    where p.role = 'participant'
      and p.venture_ids->>0 is not null   -- has at least one venture
  ),
  venture_size as (
    select vid, count(*)::int as m from members group by vid
  )
  select
    mem.pid,
    mem.vid,
    s.ci,
    s.ci + make_interval(mins => s.dur),
    s.note
  from members mem
  join venture_size vs on vs.vid = mem.vid
  cross join generate_series(v_start, current_date::timestamp, interval '1 day') as gs(day)
  cross join lateral (
    select
      (gs.day + time '09:00' + (random() * 5) * interval '1 hour')::timestamptz as ci,
      round((540.0 / vs.m) * (0.8 + random() * 0.4))::int as dur,
      -- Note from the phase this day falls in (week index 0–9 since start).
      (
        select arr[1 + floor(random() * array_length(arr, 1))::int]
        from (
          select case
                   when (gs.day::date - v_start::date) / 7 < 3 then v_notes_early
                   when (gs.day::date - v_start::date) / 7 < 7 then v_notes_mid
                   else v_notes_late
                 end as arr
        ) p
      ) as note
  ) as s
  where extract(isodow from gs.day) between 1 and 5  -- Mon–Fri
    and random() < 0.9;                              -- per member-day attendance

  -- 3) One open "checked-in now" session for variety.
  insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at, notes)
  select p.id, (p.venture_ids->>0)::uuid, now() - interval '25 minutes', null,
         v_notes_late[1 + floor(random() * array_length(v_notes_late, 1))::int]
  from public.participants p
  where p.role = 'participant' and p.venture_ids->>0 is not null
  order by random()
  limit 1;

  raise notice 'Regenerated sessions for % participants across % ventures.',
    (select count(*) from public.participants where role = 'participant' and venture_ids->>0 is not null),
    (select count(distinct venture_ids->>0) from public.participants where role = 'participant' and venture_ids->>0 is not null);
end $$;
