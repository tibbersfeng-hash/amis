import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import type { Language } from '@/components/LanguageSwitcher';
import { MultiLangHandler } from '@/utils/MultiLangHandler';
import { defaultFetcher } from '@/utils/amisFetcher';
import '../AmisCustomComponents';

// ── AmisPage component ──────────────────────────────────────

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
  const scopedRef = useRef<any>(null);
  const [currentLang, setCurrentLang] = useState<Language>(previewLanguage || 'zh');
  const langRef = useRef(currentLang);
  langRef.current = currentLang;

  // MultiLang handler — encapsulates all i18n field lifecycle
  const handler = useMemo(
    () => new MultiLangHandler(schema, formData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // schema is stable; re-create only when formData changes externally
  );

  // Extract rich text field names from schema (non-multiLang concern)
  const richTextFields = useMemo(() => {
    const fields: string[] = [];
    function walk(node: unknown) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      const obj = node as Record<string, unknown>;
      if (obj.type === 'input-rich-text' && typeof obj.name === 'string') {
        fields.push(obj.name);
      }
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) val.forEach(walk);
        else walk(val);
      }
    }
    walk(schema);
    return fields;
  }, [schema]);

  // Lookup table (persisted via ref for fetcher access)
  const [lookup, setLookup] = useState(() => handler.lookup);
  const lookupRef = useRef(lookup);
  lookupRef.current = lookup;

  // Flatten formData for Amis display
  const displayData = useMemo(
    () => handler.displayData(formData, currentLang),
    [handler, formData, currentLang],
  );

  // i18n-aware fetcher — merges multiLang fields before POST
  const fetcher = useCallback(
    (api: { url: string; method?: string; data?: unknown; config?: RequestInit }, props?: unknown) => {
      if (api.data && handler.i18nFields.length > 0) {
        const merged = handler.merge(api.data as Record<string, unknown>, langRef.current);
        api = { ...api, data: merged };
      }
      return defaultFetcher(api, props);
    },
    [handler],
  );

  // Language change listener — handles events dispatched from the Amis-scoped
  // language-switcher component. On language change, persists current values
  // and triggers re-render with the new language's data.
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lang: Language };
      const newLang = detail.lang;
      if (newLang === langRef.current) return;

      const updated = handler.persist(scopedRef.current, langRef.current, richTextFields);
      setLookup(updated);
      langRef.current = newLang;
      setCurrentLang(newLang);
    };

    window.addEventListener('amis-language-change', handleLanguageChange);
    return () => window.removeEventListener('amis-language-change', handleLanguageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richTextFields]);

  // Render Amis into a detached DOM node to keep it as a separate React root.
  // This avoids the "unmountComponentAtNode: node rendered by React and not a top-level container"
  // error that occurs when ReactDOM.render targets a div already managed by the parent React tree.
  useEffect(() => {
    if (!containerRef.current || !schema) return;

    // Create a detached div that is NOT part of the React-managed DOM.
    // This becomes a proper top-level container for ReactDOM.render.
    const detachedDiv = document.createElement('div');
    detachedDiv.className = 'amis-scope-inner';

    const amisElement = renderAmis(
      handler.injectFormName(schema),
      {
        data: {
          ...displayData,
          previewLanguage: currentLang,
        },
        locale,
        theme: 'antd',
        scopeRef: (ref: any) => { scopedRef.current = ref; },
      },
      {
        session: 'mission-cms',
        theme: 'antd',
        locale,
        fetcher,
        isCancel: (value: unknown) => (value as Error)?.message === 'cancel',
        confirm: (msg: string) => Promise.resolve(confirm(msg)),
        notify: (type: string, msg: string) => console.log(`[amis] ${type}: ${msg}`),
        enableAMISDebug: false,
      },
      '',
    );

    ReactDOM.render(amisElement, detachedDiv);
    containerRef.current.appendChild(detachedDiv);

    return () => {
      // Unmount from the detached div (which IS a top-level container)
      ReactDOM.unmountComponentAtNode(detachedDiv);
      detachedDiv.remove();
    };
    // fetcher is stable via useCallback; displayData/currentLang change triggers re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, displayData, locale, currentLang]);

  return <div ref={containerRef} className="amis-scope" />;
};
