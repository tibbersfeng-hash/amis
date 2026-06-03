import { useState, useEffect } from 'react';

export interface RemotePageData {
  schema: Record<string, unknown>;
  data: Record<string, unknown>;
}

export interface UseRemotePageOptions {
  schemaUrl: string;
  dataUrl: string;
}

/**
 * Fetches schema and data from remote API endpoints.
 *
 * Usage:
 *   const { data, loading, error } = useRemotePage({
 *     schemaUrl: '/api/schema.json',
 *     dataUrl: '/api/data.json',
 *   });
 */
export function useRemotePage({ schemaUrl, dataUrl }: UseRemotePageOptions) {
  const [data, setData] = useState<RemotePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(schemaUrl).then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load schema from ${schemaUrl}: ${r.status}`);
        return r.json();
      }),
      fetch(dataUrl).then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load data from ${dataUrl}: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([schema, data]) => {
        if (cancelled) return;
        setData({ schema, data });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load remote page');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [schemaUrl, dataUrl]);

  return { data, loading, error };
}
