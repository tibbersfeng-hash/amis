import { useState, useEffect } from 'react';
import { extractFormData } from '../utils/schemaDataExtractor';

export interface PageData {
  schema: Record<string, unknown>;
  formData: Record<string, unknown>;
}

export function usePageLoader(pageName: string) {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

    Promise.all([
      fetch(`${apiBase}/${pageName}-schema.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load schema: ${pageName}`);
        return r.json();
      }),
      fetch(`${apiBase}/${pageName}-config.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load config: ${pageName}`);
        return r.json();
      }),
    ])
      .then(([schema, config]) => {
        if (cancelled) return;

        // Extract flat formData from nested config, driven by schema sourcePath
        const formData = extractFormData(schema, config);

        setData({ schema, formData });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load page');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageName]);

  return { data, loading, error };
}
