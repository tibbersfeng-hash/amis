import { useState, useEffect } from 'react';

export interface RemotePageData {
  schema: Record<string, unknown>;
  data: Record<string, unknown>;
}

export interface UseRemotePageOptions {
  dataType: string;
  dataId: string;
}

/**
 * Fetches schema and data from the single /api/page endpoint.
 *
 * Server reads JSON files dynamically from public/api/:
 *   - schema: {dataType}-schema.json
 *   - data:   {dataId}-data.json
 *
 * Files are read fresh on every request — no restart needed.
 *
 * Usage:
 *   const { data, loading, error } = useRemotePage({
 *     dataType: 'remote',
 *     dataId: 'remote',
 *   });
 *
 * → GET /api/page?dataType=remote&dataId=remote
 * → reads public/api/remote-schema.json + remote-data.json
 */
export function useRemotePage({ dataType, dataId }: UseRemotePageOptions) {
  const [data, setData] = useState<RemotePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${apiBase}/page?dataType=${encodeURIComponent(dataType)}&dataId=${encodeURIComponent(dataId)}`;

    fetch(url)
      .then(async (r) => {
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          throw new Error(errBody.error || `API error: ${r.status}`);
        }
        return r.json();
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
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
  }, [dataType, dataId]);

  return { data, loading, error };
}
