// Database row shapes (snake_case, matching the Supabase schema).

export type Participant = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'participant' | 'admin';
  venture_ids: string[];
};

export type Venture = {
  id: string;
  name: string;
};

export type Session = {
  id: string;
  participant_id: string;
  venture_id: string;
  check_in_at: string;
  check_out_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** A session row with the venture name embedded via `select('*, ventures(name)')`. */
export type SessionWithVenture = Session & {
  ventures: { name: string } | null;
};
