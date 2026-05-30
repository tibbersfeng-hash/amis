import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import { getLocale } from '../utils/locale';
import { processSchemaMultiLang, flattenDataMultiLang } from '../utils/multiLang';
import { mockApiFetcher } from './mock-api';
import type { Language } from '../components/LanguageSwitcher';

export interface AmisLivePreviewRef {
  /** Returns the current form data (latest user values) */
  getData: () => Record<string, unknown>;
}

interface AmisLivePreviewProps {
  schema: Record<string, unknown>;
  data?: Record<string, unknown>;
  /**
   * Language for multiLang content values.
   * When set, flattens {zh,en} objects to the specified language.
   * Default: 'zh'
   */
  lang?: Language;
  /** Optional label to display above the preview */
  label?: string;
  /** Called with merged form data whenever form values change */
  onDataChange?: (data: Record<string, unknown>) => void;
}

/**
 * Renders an arbitrary Amis schema for live preview in the showcase.
 * Processes multiLang content values ({zh,en} → single language) before rendering.
 *
 * Preserves user modifications across language switches by storing mutated values
 * in a ref and merging them with the processed data on each re-render.
 */
export const AmisLivePreview = forwardRef<AmisLivePreviewRef, AmisLivePreviewProps>(({
  schema,
  data = {},
  lang = 'zh',
  label,
  onDataChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store user-modified values — survives language switch and re-mount
  const modifiedValues = useRef<Record<string, unknown>>({});
  // Track last synced values to prevent infinite re-render loop
  const lastSyncedRef = useRef<string>('');
  // Track if we've received an onChange callback (means user has modified something)
  const [userValues, setUserValues] = useState<Record<string, unknown> | null>(null);

  // Expose getData via ref — reads from hidden data-field-data divs in the DOM
  useImperativeHandle(ref, () => ({
    getData: () => {
      const result: Record<string, unknown> = { ...modifiedValues.current };
      try {
        const dataEls = containerRef.current?.querySelectorAll('[data-field-data]');
        dataEls?.forEach((el: Element) => {
          try {
            const parsed = JSON.parse(el.textContent || '{}');
            Object.assign(result, parsed);
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
      return result;
    },
  }), []);

  useEffect(() => {
    if (!containerRef.current || !schema) return;

    // Merge user-modified values with initial data
    // When user modified something, those values take precedence
    const baseData = userValues || data;

    // Process schema: flatten {zh,en} content values based on language
    const processedSchema = processSchemaMultiLang(schema, lang);

    // Process data: flatten {zh,en} values based on language
    const processedData = flattenDataMultiLang(baseData, lang);

    const amisScoped = renderAmis(
      processedSchema as any,
      {
        data: { ...processedData, previewLanguage: lang },
        locale: getLocale(),
        theme: 'cxd',
      },
      {
        session: 'showcase-preview',
        theme: 'cxd',
        locale: getLocale(),
        fetcher: mockApiFetcher,
        isCancel: (value: unknown) =>
          (value as Error)?.message === 'cancel',
        notify: (type: string, msg: string) =>
          console.log(`[amis showcase] ${type}: ${msg}`),
        enableAMISDebug: false,
        // Capture form value changes and store them
        onChange: (changeValue: Record<string, unknown> | null) => {
          if (changeValue && typeof changeValue === 'object') {
            modifiedValues.current = { ...modifiedValues.current, ...changeValue };
            setUserValues({ ...modifiedValues.current });
            onDataChange?.({ ...modifiedValues.current });
          }
        },
      },
      ''
    );

    ReactDOM.render(amisScoped, containerRef.current);

    // Watch for custom data-field-data divs that custom components write
    const syncFieldData = () => {
      const dataEls = containerRef.current?.querySelectorAll('[data-field-data]');
      let changed = false;
      dataEls?.forEach((el: Element) => {
        try {
          const parsed = JSON.parse(el.textContent || '{}');
          modifiedValues.current = { ...modifiedValues.current, ...parsed };
          changed = true;
        } catch { /* ignore */ }
      });
      // Only update state if values actually changed — prevents infinite re-render loop
      if (changed) {
        const snapshot = JSON.stringify(modifiedValues.current);
        if (snapshot !== lastSyncedRef.current) {
          lastSyncedRef.current = snapshot;
          setUserValues({ ...modifiedValues.current });
          onDataChange?.({ ...modifiedValues.current });
        }
      }
    };
    // Run after Amis renders
    let observer: MutationObserver | null = null;
    requestAnimationFrame(() => {
      syncFieldData();
      // Also watch for subsequent updates (pagination, data reload, field changes)
      observer = new MutationObserver(() => {
        syncFieldData();
      });
      if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
      }
    });

    return () => {
      observer?.disconnect();
      if (containerRef.current) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, data, lang, userValues]);

  return (
    <div className="amis-live-preview-wrapper">
      {label && <div className="amis-live-preview-label">{label}</div>}
      <div ref={containerRef} className="amis-live-preview amis-scope" />
    </div>
  );
});

AmisLivePreview.displayName = 'AmisLivePreview';
