import React, { useState, useEffect } from 'react';
import { useRemotePage } from '../hooks/useRemotePage';
import { AmisPage } from '../components/AmisPage';
import { Loading, ErrorDisplay } from '../components/Loading';
import { getLocale } from '../utils/locale';

interface RemotePageParams {
  schemaUrl: string;
  dataUrl: string;
}

/**
 * Parse URL query params for schema and data URLs.
 * Example: /remote?page=schema.json&data=data.json
 * Resolves to: /api/schema.json and /api/data.json
 */
function parseRemoteParams(): RemotePageParams {
  const params = new URLSearchParams(window.location.search);
  const schemaParam = params.get('schema') || 'schema.json';
  const dataParam = params.get('data') || 'data.json';

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  // Support both absolute URLs and relative paths
  const schemaUrl = schemaParam.startsWith('http')
    ? schemaParam
    : `${apiBase}/${schemaParam}`;

  const dataUrl = dataParam.startsWith('http')
    ? dataParam
    : `${apiBase}/${dataParam}`;

  return { schemaUrl, dataUrl };
}

/**
 * RemotePage — renders an Amis page from remotely fetched schema + data.
 *
 * URL format: /remote?schema=schema.json&data=data.json
 *
 * Schema URL: /api/schema.json (configurable via ?schema= param)
 * Data URL:   /api/data.json   (configurable via ?data= param)
 *
 * Schema format:
 *   { "type": "form", "body": [...] }
 *   or any valid Amis schema
 *
 * Data format:
 *   { "name": "Alice", "email": "alice@example.com" }
 */
const RemotePage: React.FC = () => {
  const [params] = useState<RemotePageParams>(() => parseRemoteParams());
  const { data, loading, error } = useRemotePage(params);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return null;
  }

  return (
    <AmisPage
      schema={data.schema}
      formData={data.data}
      locale={getLocale()}
    />
  );
};

export default RemotePage;
