import React, { useState } from 'react';
import { useRemotePage } from '../hooks/useRemotePage';
import { AmisPage } from '../components/AmisPage';
import { Loading, ErrorDisplay } from '../components/Loading';
import { getLocale } from '../utils/locale';

/**
 * Parse URL query params: ?dataType=xxx&dataId=xxx
 *
 * Example: /remote?dataType=remote&dataId=remote
 *   → schema: public/api/remote-schema.json
 *   → data:   public/api/remote-data.json
 */
function parseRemoteParams(): { dataType: string; dataId: string } {
  const params = new URLSearchParams(window.location.search);
  const dataType = params.get('dataType') || '';
  const dataId = params.get('dataId') || '';

  return { dataType, dataId };
}

/**
 * RemotePage — renders an Amis page from server-loaded schema + data.
 *
 * URL format: /remote?dataType=xxx&dataId=xxx
 *
 * Server reads files dynamically from public/api/:
 *   - schema: public/api/schema/{dataType}-schema.json
 *   - data:   public/api/data/{dataId}-data.json
 *
 * Files are read fresh on every request — modify JSON files,
 * then refresh the page to see changes. No server restart needed.
 */
const RemotePage: React.FC = () => {
  const [params] = useState(() => parseRemoteParams());
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

  // Inject dataId and dataType into form data so Amis form API templates
  // like ${dataId} and ${dataType} resolve correctly on submit.
  // This allows the form to POST to /api/page/save?dataId=${dataId}&dataType=${dataType}.
  const enhancedFormData = {
    ...data.data,
    dataId: params.dataId,
    dataType: params.dataType,
  };

  return (
    <AmisPage
      schema={data.schema}
      formData={enhancedFormData}
      locale={getLocale()}
    />
  );
};

export default RemotePage;
