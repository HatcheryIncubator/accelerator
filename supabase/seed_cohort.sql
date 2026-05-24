-- Seed a full TEST cohort: ~3 participants per venture (randomized 2–4), each
-- assigned to one venture, with ~9 weeks of sessions so every venture logs
-- ~40 h/week (split across its members, so individuals vary).
--
-- All accounts are loginable: email is firstname@test.com, password is
-- "password", email pre-confirmed. Ventures are read from the existing
-- public.ventures table (add your ventures first if the table is empty).
--
-- Run in the Supabase dashboard SQL editor. SAFE TO RE-RUN: it first deletes
-- every existing @test.com account (and their sessions), then rebuilds. It does
-- NOT touch your real accounts, the malia.wakesho-ajwang@emory.edu seed, or any
-- ventures.
--
-- Requires the pgcrypto extension (Supabase has it in the `extensions` schema).
-- If an insert into auth.users / auth.identities errors on a column, your
-- GoTrue schema differs slightly — paste me the error and I'll adjust.

do $$
declare
  v_first_names text[] := array[
    'Alice','Ben','Carla','David','Ella','Femi','Grace','Hassan','Iris','Jamal',
    'Kira','Liam','Maya','Noah','Omar','Priya','Quinn','Rosa','Sam','Tara',
    'Uma','Victor','Wren','Xavier','Yara','Zane','Amara','Bode','Cora','Dev',
    'Esi','Finn','Gia','Hugo','Ines','Jonas','Kai','Lena','Mateo','Nadia',
    'Oscar','Pia','Reza','Sana','Theo','Una','Vik','Wade','Yusuf','Zoe'
  ];
  v_last_names text[] := array[
    'Adams','Baker','Chen','Diaz','Evans','Ford','Gupta','Hill','Ito','Jones',
    'Kim','Lopez','Mensah','Novak','Owens','Patel','Reed','Singh','Tran','Vargas'
  ];
  v_pwd_hash text := extensions.crypt('password', extensions.gen_salt('bf'));
  v_start    timestamp := (current_date - interval '9 weeks')::timestamp;

  v_vrow   record;
  v_uid    uuid;
  v_members uuid[];
  v_n      int;   -- members in this venture
  v_m      int;   -- realized member count
  g        int := 0;   -- global participant counter (drives unique emails)
  v_fn     text;
  v_ln     text;
  v_email  text;
  k        int;
begin
  -- Idempotent cleanup of any prior @test.com cohort.
  delete from public.sessions
    where participant_id in (select id from public.participants where email ilike '%@test.com');
  delete from auth.users where email ilike '%@test.com';
  delete from public.participants where email ilike '%@test.com';  -- cleanup if no FK cascade

  if not exists (select 1 from public.ventures) then
    raise exception 'No ventures in public.ventures — add your ventures first.';
  end if;

  for v_vrow in select id, name from public.ventures loop
    v_n := 2 + floor(random() * 3)::int;   -- 2..4, ~3 average
    v_members := '{}';

    for k in 1..v_n loop
      g := g + 1;
      v_fn := v_first_names[((g - 1) % array_length(v_first_names, 1)) + 1];
      v_ln := v_last_names[((g - 1) % array_length(v_last_names, 1)) + 1];
      v_email := case
                   when g <= array_length(v_first_names, 1) then lower(v_fn) || '@test.com'
                   else lower(v_fn) || g::text || '@test.com'
                 end;

      -- 1) Auth user (loginable, email confirmed). The handle_new_user() trigger
      --    creates the matching public.participants row from raw_user_meta_data.
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change,
        email_change_token_new, recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
        'authenticated', 'authenticated', v_email, v_pwd_hash,
        now(), '{"provider":"email","providers":["email"]}',
        jsonb_build_object('first_name', v_fn, 'last_name', v_ln),
        now(), now(), '', '', '', ''
      ) returning id into v_uid;

      -- 2) Email identity (required for password sign-in on current GoTrue).
      insert into auth.identities (
        id, user_id, provider_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_uid, v_uid::text,
        jsonb_build_object('sub', v_uid::text, 'email', v_email),
        'email', now(), now(), now()
      );

      -- 3) Assign role + this one venture.
      update public.participants
        set role = 'participant', venture_ids = array[v_vrow.id]
        where id = v_uid;

      v_members := v_members || v_uid;
    end loop;

    v_m := array_length(v_members, 1);

    -- 4) Sessions for this venture, ~40 h/week split across its members:
    --    each member ~ (540/m) min on ~90% of weekdays, ±20% noise.
    --    => venture ≈ m × 5 × 0.9 × (540/m) ≈ 40 h/week.
    insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at)
    select
      m.uid,
      v_vrow.id,
      s.ci,
      s.ci + make_interval(mins => s.dur)
    from generate_series(v_start, current_date::timestamp, interval '1 day') as gs(day)
    cross join unnest(v_members) as m(uid)
    cross join lateral (
      select
        (gs.day + time '09:00' + (random() * 5) * interval '1 hour')::timestamptz as ci,
        round((540.0 / v_m) * (0.8 + random() * 0.4))::int as dur
    ) as s
    where extract(isodow from gs.day) between 1 and 5  -- Mon–Fri
      and random() < 0.9;                              -- per member-day attendance
  end loop;

  -- 5) One open "checked-in now" session, for variety.
  insert into public.sessions (participant_id, venture_id, check_in_at, check_out_at)
  select p.id, p.venture_ids[1], now() - interval '25 minutes', null
  from public.participants p
  where p.email ilike '%@test.com'
  order by p.email
  limit 1;

  raise notice 'Seeded % test participants across % ventures.',
    g, (select count(*) from public.ventures);
end $$;
