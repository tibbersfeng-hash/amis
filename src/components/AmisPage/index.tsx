import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import '../PhoneMockup';
import '../DateRangePicker';
import '../FieldWithExclude';
import '../ClosableTabs';
import { LanguageSwitcher, LANGUAGES } from '../LanguageSwitcher';
import type { Language } from '../LanguageSwitcher';

// ── i18n helpers ──────────────────────────────────────────────

/** Check if a value is a {zh, en} multi-language object (at minimum has a zh key) */
function isI18nValue(val: unknown): val is Record<string, string> {
  return !!val && typeof val === 'object' && 'zh' in (val as object);
}

/** Recursively collect all fields with "multiLang: true" from an Amis schema */
function collectMultiLangFields(schema: unknown): string[] {
  const fields: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if (obj.multiLang === true && typeof obj.name === 'string') {
      fields.push(obj.name);
    }
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) val.forEach(walk);
      else walk(val);
    }
  }
  walk(schema);
  return fields;
}

/** Extract label→value option mappings from schema for select/radio/checkbox fields */
function collectFieldOptions(
  schema: unknown,
): Record<string, Array<{ label: string; value: string }>> {
  const options: Record<string, Array<{ label: string; value: string }>> = {};
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if (
      typeof obj.name === 'string' &&
      Array.isArray(obj.options) &&
      obj.options.length > 0
    ) {
      options[obj.name] = obj.options.map(
        (o: Record<string, unknown>) => ({
          label: String(o.label ?? ''),
          value: String(o.value ?? ''),
        }),
      );
    }
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) val.forEach(walk);
      else walk(val);
    }
  }
  walk(schema);
  return options;
}

/** Build a lookup of original {zh, en} values for the given fields */
function buildLookup(data: Record<string, unknown>, fields: string[]): Record<string, Record<string, string>> {
  const lookup: Record<string, Record<string, string>> = {};
  for (const field of fields) {
    const val = data[field];
    if (isI18nValue(val)) lookup[field] = val;
  }
  return lookup;
}

/** Flatten {zh, en} → single language string for Amis display */
function flattenData(
  data: Record<string, unknown>,
  fields: string[],
  lookup: Record<string, Record<string, string>>,
  lang: string
): Record<string, unknown> {
  if (!fields.length) return data;
  const result = { ...data };
  for (const field of fields) {
    const orig = lookup[field];
    if (orig) {
      // Use target lang value; if the key doesn't exist, the field shows empty
      result[field] = lang in orig ? orig[lang] : undefined;
    }
  }
  return result;
}

/**
 * Read current DOM value for a field.
 * 4-level fallback: name attr → label→value mapping → amis store → undefined
 */
function readDomValue(
  field: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>,
): string | undefined {
  // Special fields where input[name] doesn't represent the actual value
  if (field === 'tag') return undefined;             // input is for new tags, not the values
  if (field === 'image') return undefined;            // upload widget, no text value

  // ① Native input/textarea with name attribute
  const input = document.querySelector(
    `input[name="${field}"], textarea[name="${field}"]`,
  ) as HTMLInputElement | HTMLTextAreaElement | null;
  if (input) return input.value;

  // ② Label→value mapping for select/radio/checkbox
  const opts = fieldOptions?.[field];
  if (opts?.length) {
    // Radio: find checked label → match label text → return value
    const radioChecked = document.querySelector('.cxd-Checkbox--radio--default.checked');
    if (radioChecked) {
      const label = radioChecked.textContent?.trim() ?? '';
      const match = opts.find((o) => o.label === label);
      if (match) return match.value;
    }

    // Checkbox: only return when match found (avoid returning '' for other fields)
    const cbChecked = document.querySelectorAll('.cxd-Checkbox--checkbox--default.checked');
    if (cbChecked.length > 0) {
      const values: string[] = [];
      cbChecked.forEach((el) => {
        const label = el.textContent?.trim() ?? '';
        const match = opts.find((o) => o.label === label);
        if (match) values.push(match.value);
      });
      if (values.length > 0) return values.join(',');
    }

    // Select: read display text from the value span
    const selValue = document.querySelector('.cxd-Select-value');
    if (selValue) {
      const label = selValue.textContent?.trim() ?? '';
      const match = opts.find((o) => o.label === label);
      if (match) return match.value;
    }
  }

  // ③ Date / time / month pickers: match by placeholder
  const pickers = document.querySelectorAll('.cxd-DatePicker-input');
  for (const p of pickers) {
    const inp = p as HTMLInputElement;
    if (!inp.value) continue;
    if (field === 'date' && inp.placeholder?.includes('日期')) return inp.value;
    if (field === 'month' && inp.placeholder?.includes('月份')) return inp.value;
    if (field === 'time' && inp.placeholder?.includes('时间')) return inp.value;
  }

  // ④ Color picker
  if (field === 'color') {
    const colorInput = document.querySelector('.cxd-ColorPicker-input') as HTMLInputElement | null
      ?? document.querySelector('.cxd-ColorPicker input') as HTMLInputElement | null;
    if (colorInput?.value) return colorInput.value;
  }

  // ⑤ Switch
  if (field === 'switch') {
    return document.querySelector('.cxd-Switch.is-checked') ? 'true' : 'false';
  }

  return undefined;
}

/** Write a value into the DOM for a field */
function writeDomValue(field: string, value: string): void {
  const input = document.querySelector(
    `input[name="${field}"], textarea[name="${field}"]`
  ) as HTMLInputElement | HTMLTextAreaElement | null;
  if (input) {
    const proto = input instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  const store = (window as any).amisStore;
  if (store?.changeValue) {
    store.changeValue(field, value);
  }
}

/** Persist current DOM values into the lookup, returning the updated lookup */
function persistToLookup(
  lookup: Record<string, Record<string, string>>,
  fields: string[],
  lang: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>
): Record<string, Record<string, string>> {
  const updated = { ...lookup };
  for (const field of fields) {
    const currentVal = readDomValue(field, fieldOptions);
    if (currentVal !== undefined) {
      const prev = updated[field] || { zh: '', en: '' };
      updated[field] = { ...prev, [lang]: currentVal };
    }
  }
  return updated;
}

/** Apply a language's values from the lookup into the DOM */
function applyFromLookup(
  lookup: Record<string, Record<string, string>>,
  fields: string[],
  lang: string
): void {
  for (const field of fields) {
    const vals = lookup[field];
    if (!vals) continue;
    const value = vals[lang] || vals['zh'];
    if (value !== undefined) writeDomValue(field, value);
  }
}

/** Merge current values into {zh, en} for all multiLang fields */
function mergeI18nData(
  rawData: Record<string, unknown>,
  lookup: Record<string, Record<string, string>>,
  fields: string[],
  currentLang: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>
): Record<string, unknown> {
  const merged = { ...rawData };
  for (const field of fields) {
    // Try DOM first (input[name]), then raw form data as fallback
    let domVal = readDomValue(field, fieldOptions);
    if (domVal === undefined) {
      const raw = rawData[field];
      if (raw === undefined || raw === null) continue;
      domVal = String(raw);
    }
    if (domVal === undefined) continue;

    const existing = lookup[field];
    if (existing && isI18nValue(existing)) {
      merged[field] = { ...existing, [currentLang]: domVal };
    } else {
      merged[field] = { zh: domVal, en: domVal };
    }
  }
  return merged;
}

// ── Default fetcher (Amis API requests) ─────────────────────

function defaultFetcher(
  api: { url: string; method?: string; data?: unknown; config?: RequestInit },
  _props?: unknown
): Promise<{ status: number; data: unknown; msg?: string }> {
  const { url, method = 'get', data, config } = api;
  let fetchUrl = url;
  const fetchConfig: RequestInit = {
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
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  });
}

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
  const [currentLang, setCurrentLang] = useState<Language>(previewLanguage || 'zh');
  const langRef = useRef(currentLang);
  langRef.current = currentLang;

  // Extract multiLang fields and option mappings from schema
  const i18nFields = useMemo(() => collectMultiLangFields(schema), [schema]);
  const fieldOptions = useMemo(() => collectFieldOptions(schema), [schema]);
  const hasI18n = i18nFields.length > 0;

  // Build + persist lookup via ref (so fetcher always has latest)
  const [lookup, setLookup] = useState<Record<string, Record<string, string>>>(() =>
    buildLookup(formData, i18nFields)
  );
  const lookupRef = useRef(lookup);
  lookupRef.current = lookup;

  // Flatten formData for Amis display
  const displayData = useMemo(
    () => flattenData(formData, i18nFields, lookup, currentLang),
    [formData, i18nFields, lookup, currentLang]
  );

  // i18n-aware fetcher — merges multiLang fields before POST
  const fetcher = useCallback(
    (api: { url: string; method?: string; data?: unknown; config?: RequestInit }, props?: unknown) => {
      if (api.data && i18nFields.length > 0) {
        const merged = mergeI18nData(
          api.data as Record<string, unknown>,
          lookupRef.current,
          i18nFields,
          langRef.current,
          fieldOptions,
        );
        api = { ...api, data: merged };
      }
      return defaultFetcher(api, props);
    },
    [i18nFields, fieldOptions]
  );

  // Language switch handler
  const handleLanguageChange = useCallback(
    (newLang: Language) => {
      if (newLang === langRef.current) return;
      const updated = persistToLookup(lookupRef.current, i18nFields, langRef.current, fieldOptions);
      setLookup(updated);
      langRef.current = newLang;
      setCurrentLang(newLang);
    },
    [i18nFields, fieldOptions]
  );

  // Render Amis
  useEffect(() => {
    if (!containerRef.current || !schema) return;

    const abortController = new AbortController();

    const amisData = {
      ...displayData,
      previewLanguage: currentLang,
    };

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
        fetcher,
        isCancel: (value: unknown) => (value as Error)?.message === 'cancel',
        confirm: (msg: string) => Promise.resolve(confirm(msg)),
        notify: (type: string, msg: string) => console.log(`[amis] ${type}: ${msg}`),
        enableAMISDebug: false,
      },
      ''
    );

    ReactDOM.render(amisElement, containerRef.current);

    return () => {
      abortController.abort();
      if (containerRef.current) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      }
    };
    // fetcher is stable via useCallback; displayData/currentLang change triggers re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, displayData, locale, currentLang]);

  return (
    <>
      {hasI18n && (
        <LanguageSwitcher
          language={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      )}
      <div ref={containerRef} className="amis-scope" />
    </>
  );
};
