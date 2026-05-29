import React, { useEffect, useRef } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import '../PhoneMockup'; // Registers phone-mockup renderer
import '../DateRangePicker'; // Registers date-range-picker renderer
import '../FieldWithExclude'; // Registers field-with-exclude renderer
import type { Language } from '../LanguageSwitcher';

/**
 * Default fetcher for Amis API requests.
 * Uses fetch with abort support.
 */
function defaultFetcher(
  api: { url: string; method?: string; data?: unknown; config?: RequestInit },
  props?: { data?: Record<string, unknown> }
): Promise<{ status: number; data: unknown; msg?: string }> {
  const { url, method = 'get', data, config } = api;

  let fetchUrl = url;
  let fetchConfig: RequestInit = {
    method: method.toUpperCase(),
    headers: { 'Content-Type': 'application/json' },
    ...config,
  };

  if (method === 'get' && data) {
    const params = new URLSearchParams(data as Record<string, string>);
    fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + params.toString();
  } else if (data) {
    fetchConfig.body = JSON.stringify(data);
  }

  return fetch(fetchUrl, fetchConfig).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  });
}

interface AmisPageProps {
  schema: Record<string, unknown>;
  formData?: Record<string, unknown>;
  locale?: 'zh-CN' | 'en-US';
  previewLanguage?: Language;
}

export const AmisPage: React.FC<AmisPageProps> = ({
  schema,
  formData = {},
  locale = 'zh-CN',
  previewLanguage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !schema) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Abort controller for fetch cancellation
    const abortController = new AbortController();

    // Merge formData with previewLanguage for Amis data context
    const amisData = {
      ...formData,
      previewLanguage: previewLanguage || 'zh',
    };

    // Render Amis schema with data
    const amisElement = renderAmis(
      schema,
      {
        data: amisData,
        locale,
        theme: 'cxd',
      },
      {
        session: 'mission-cms',
        theme: 'cxd',
        locale,
        fetcher: defaultFetcher,
        isCancel: (value: unknown) => (value as Error)?.message === 'cancel',
        confirm: (msg: string) => Promise.resolve(confirm(msg)),
        notify: (type: string, msg: string) => console.log(`[amis] ${type}: ${msg}`),
        enableAMISDebug: false,
      },
      ''
    );

    // Mount the React element
    ReactDOM.render(amisElement, containerRef.current);

    // Cleanup on unmount
    return () => {
      abortController.abort();
      if (containerRef.current) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, formData, locale]); // Don't include previewLanguage - i18n updates are handled via DOM manipulation in App.tsx

  return <div ref={containerRef} className="amis-scope" />;
};
