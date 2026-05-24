import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Venture } from '@/types';

/** Fetches all ventures (ordered by name) for pickers and id→name lookups. */
export function useVentures() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('ventures')
        .select('*')
        .order('name');
      if (!active) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        // Coerce id to string so it matches VenturePicker's string <select>.
        setVentures((data ?? []).map((v) => ({ id: String(v.id), name: v.name })));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { ventures, loading, error };
}
