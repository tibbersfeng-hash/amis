import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import '../PhoneMockup';
import '../DateRangePicker';
import '../FieldWithExclude';
import '../FieldWithExcludeV2';
import '../ClosableTabs';
import '../InputRichTextQuill';
import { LanguageSwitcher, LANGUAGES } from '../LanguageSwitcher';
import type { Language } from '../LanguageSwitcher';

// ── i18n helpers ──────────────────────────────────────────────

const FORM_NAME = 'multiLangForm';

/** 给 schema 中的 form 注入 name 属性，以便 scopeRef + getComponentByName 能定位到表单 */
function injectFormName(schema: Record<string, unknown>): Record<string, unknown> {
  if (schema.type === 'form' && !schema.name) {
    return { ...schema, name: FORM_NAME };
  }
  if (schema.type === 'page' && Array.isArray(schema.body)) {
    return {
      ...schema,
      body: schema.body.map(item => {
        if (typeof item === 'object' && item?.type === 'form' && !item.name) {
          return { ...(item as Record<string, unknown>), name: FORM_NAME };
        }
        return item;
      }),
    };
  }
  return schema;
}

/** Check if a value is a {zh, en} multi-language object */
function isI18nValue(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === 'object' && 'zh' in (val as object) && Object.keys(val as object).length >= 2;
}

/** Recursively collect all fields with "multiLang: true" from an Amis schema */
function collectMultiLangFields(schema: unknown): string[] {
  const fields: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if (obj.multiLang === true) {
      if (typeof obj.name === 'string') {
        fields.push(obj.name);
      }
      // Also include excludeName and excludeCheckboxName so multiLang data is preserved
      if (typeof obj.excludeName === 'string') fields.push(obj.excludeName);
      if (typeof obj.excludeCheckboxName === 'string') fields.push(obj.excludeCheckboxName);
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
      const mapped = obj.options.map((o: Record<string, unknown>) => ({
        label: String(o.label ?? ''),
        value: String(o.value ?? ''),
      }));
      options[obj.name] = mapped;
      // For field-with-exclude-v2, also register sub-fields with same options
      if (
        obj.type === 'field-with-exclude-v2' &&
        typeof obj.excludeName === 'string'
      ) {
        options[obj.excludeName] = mapped;
      }
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
function buildLookup(data: Record<string, unknown>, fields: string[]): Record<string, Record<string, unknown>> {
  const lookup: Record<string, Record<string, unknown>> = {};
  for (const field of fields) {
    const val = data[field];
    if (isI18nValue(val)) lookup[field] = val;
  }
  return lookup;
}

/** Flatten {zh, en} → single language value for Amis display */
function flattenData(
  data: Record<string, unknown>,
  fields: string[],
  lookup: Record<string, Record<string, unknown>>,
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
 * Returns string for text fields, or raw array/object for FieldWithExclude.
 */
function readDomValue(
  field: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>,
  isRichText?: boolean,
): string | unknown[] | unknown | undefined {
  // Special fields where input[name] doesn't represent the actual value
  if (field === 'tag') return undefined;             // input is for new tags, not the values

  // ① Image/file upload: find ImageControl whose parent has data-amis-name matching the field
  let imgControl: Element | null = document.querySelector(
    `[data-amis-name="${field}"] .antd-ImageControl`
  );

  if (imgControl) {
    const img = imgControl.querySelector('img') as HTMLImageElement | null;
    if (img?.src && img.src !== window.location.href) return img.src;
    const hiddenInput = imgControl.querySelector('input[type="hidden"]') as HTMLInputElement | null;
    if (hiddenInput?.value) return hiddenInput.value;
    // Image was cleared — return empty string so lookup gets updated with ""
    return '';
  }

  // ③ TinyMCE rich text editor — only read if this field is a rich text field
  if (isRichText) {
    const tinymceEditor = (window as any).tinymce?.activeEditor;
    if (tinymceEditor && tinymceEditor.getContent) {
      const content = tinymceEditor.getContent();
      if (content) return content;
    }
  }

  // ④ Native input/textarea with name attribute
  const input = document.querySelector(
    `input[name="${field}"], textarea[name="${field}"]`,
  ) as HTMLInputElement | HTMLTextAreaElement | null;
  if (input) return input.value;

  // ⑤ Label→value mapping for select/radio/checkbox
  const opts = fieldOptions?.[field];
  if (opts?.length) {
    // Radio: find checked label → match label text → return value
    const radioChecked = document.querySelector('.antd-Checkbox--radio--default.checked');
    if (radioChecked) {
      const label = radioChecked.textContent?.trim() ?? '';
      const match = opts.find((o) => o.label === label);
      if (match) return match.value;
    }

    // Checkbox: only return when match found (avoid returning '' for other fields)
    const cbChecked = document.querySelectorAll('.antd-Checkbox--checkbox--default.checked');
    if (cbChecked.length > 0) {
      const values: string[] = [];
      cbChecked.forEach((el) => {
        const label = el.textContent?.trim() ?? '';
        const match = opts.find((o) => o.label === label);
        if (match) values.push(match.value);
      });
      if (values.length > 0) return values.join(',');
    }

    // Select: read display text from value span(s) — excludes V2 component's selects
    const selValues = Array.from(document.querySelectorAll('.antd-Select-value'))
        .filter(el => !el.closest('.field-with-exclude-v2'));
    if (selValues.length > 0) {
      const matched: string[] = [];
      selValues.forEach((el) => {
        const label = el.textContent?.trim() ?? '';
        const match = opts.find((o) => o.label === label);
        if (match) matched.push(match.value);
      });
      if (matched.length > 0) return matched.join(',');
    }

    // Select exists but no value visible (cleared or placeholder only) — return empty string
    // so lookup gets updated with "" instead of skipping persistence
    const hasSelectControl = document.querySelector('.antd-SelectControl');
    if (hasSelectControl) return '';
  }

  // ⑥ Date / time / month / datetime pickers: match by placeholder
  const pickers = document.querySelectorAll('.antd-DatePicker-input');
  for (const p of pickers) {
    const inp = p as HTMLInputElement;
    if (!inp.value) continue;
    if (field === 'date' && inp.placeholder?.includes('日期') && !inp.placeholder?.includes('时间')) return inp.value;
    if (field === 'month' && inp.placeholder?.includes('月份')) return inp.value;
    if (field === 'time' && inp.placeholder?.includes('时间')) return inp.value;
    if (field === 'datetime' && inp.placeholder?.includes('日期以及时间')) return inp.value;
  }

  // ⑦ Date range picker: read start,end combo
  if (field === 'dateRange') {
    const rangeInputs = document.querySelectorAll('.antd-DateRangePicker-input');
    if (rangeInputs.length >= 2) {
      const start = (rangeInputs[0] as HTMLInputElement).value;
      const end = (rangeInputs[1] as HTMLInputElement).value;
      if (start && end) return start + ',' + end;
    }
  }

  // ⑧ Color picker
  if (field === 'color') {
    const colorInput = document.querySelector('.antd-ColorPicker-input') as HTMLInputElement | null
      ?? document.querySelector('.antd-ColorPicker input') as HTMLInputElement | null;
    if (colorInput?.value) return colorInput.value;
  }

  // ⑨ Field-with-exclude: read from hidden data div — preserve raw type for multiLang
  const excludeData = document.querySelector(`div[data-field-name="${field}"]`);
  if (excludeData) {
    try {
      const parsed = JSON.parse(excludeData.textContent || '{}');
      if (parsed && typeof parsed === 'object' && field in parsed) {
        const val = parsed[field];
        if (val !== null && val !== undefined) return val; // return raw (array/object/string)
      }
    } catch { /* ignore parse errors */ }
  }

  // ⑩ Switch
  if (field === 'switch') {
    return document.querySelector('.antd-Switch.is-checked') ? true : false;
  }

  return undefined;
}

/** Write a value into the DOM for a field */
function writeDomValue(field: string, value: string | unknown): void {
  // Try native input/textarea first
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
      input.value = value as string;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // Image/file upload component: update via Amis store (no native input[name] to write to)
  const imgControl = document.querySelector(`.antd-ImageControl input[name="${field}"]`);
  if (imgControl) {
    const store = (window as any).amisStore;
    if (store?.changeValue) {
      store.changeValue(field, value);
    }
    return;
  }

  // Field-with-exclude: write to hidden data div
  const excludeData = document.querySelector(`div[data-field-name="${field}"]`);
  if (excludeData && excludeData.textContent) {
    try {
      const parsed = JSON.parse(excludeData.textContent || '{}');
      if (parsed && typeof parsed === 'object') {
        // Update the value for this field (keep checkbox state intact)
        parsed[field] = value;
        excludeData.textContent = JSON.stringify(parsed);
        return;
      }
    } catch { /* ignore parse errors */ }
    // Fallback: replace entire content
    excludeData.textContent = JSON.stringify({ [field]: value });
    return;
  }

  const store = (window as any).amisStore;
  if (store?.changeValue) {
    store.changeValue(field, value);
  }
}

/** Persist current DOM values into the lookup, returning the updated lookup */
function persistToLookup(
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>,
  richTextFields?: string[]
): Record<string, Record<string, unknown>> {
  const updated = { ...lookup };
  for (const field of fields) {
    const currentVal = readDomValue(field, fieldOptions, richTextFields?.includes(field) || false);
    if (currentVal !== undefined) {
      const prev = updated[field] || { zh: '', en: '' };
      // Detect if original value was array → convert comma string back to array
      const anyPrev = Object.values(prev).find(v => v !== null && v !== undefined);
      if (Array.isArray(anyPrev) && typeof currentVal === 'string') {
        updated[field] = { ...prev, [lang]: currentVal ? currentVal.split(',') : [] };
      } else {
        updated[field] = { ...prev, [lang]: currentVal };
      }
    }
  }
  return updated;
}

/** Apply a language's values from the lookup into the DOM */
function applyFromLookup(
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string
): void {
  for (const field of fields) {
    const vals = lookup[field];
    if (!vals) continue;
    // Use ?? instead of || so empty string '' is NOT treated as missing
    const value = vals[lang] ?? vals['zh'];
    if (value !== undefined) writeDomValue(field, value);
  }
}

/** Merge current values into {zh, en} for all multiLang fields */
function mergeI18nData(
  rawData: Record<string, unknown>,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  currentLang: string,
  fieldOptions?: Record<string, Array<{ label: string; value: string }>>
): Record<string, unknown> {
  const merged = { ...rawData };
  for (const field of fields) {
    const rawVal = rawData[field];
    let domVal: unknown;
    // If rawVal is already a {zh, en} object, keep it as-is (V2 component data)
    if (rawVal !== null && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      if ('zh' in rawVal || 'en' in rawVal) continue;
    }
    if (Array.isArray(rawVal)) {
      domVal = rawVal;
    } else {
      domVal = readDomValue(field, fieldOptions);
      if (domVal === undefined) {
        if (rawVal === undefined || rawVal === null) continue;
        domVal = typeof rawVal === 'boolean' ? rawVal : String(rawVal);
      }
    }

    const existing = lookup[field];
    if (existing && isI18nValue(existing)) {
      // For boolean/array values (component state, not language-specific)
      if (typeof domVal === 'boolean' || Array.isArray(domVal)) {
        merged[field] = { zh: domVal, en: domVal };
      } else {
        merged[field] = { ...existing, [currentLang]: domVal };
      }
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

  // Extract rich text field names from schema
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

  // Build + persist lookup via ref (so fetcher always has latest)
  const [lookup, setLookup] = useState<Record<string, Record<string, unknown>>>(() =>
    buildLookup(formData, i18nFields)
  );
  const lookupRef = useRef<Record<string, Record<string, unknown>>>(lookup);
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
      const updated = persistToLookup(lookupRef.current, i18nFields, langRef.current, fieldOptions, richTextFields);
      setLookup(updated);
      langRef.current = newLang;
      setCurrentLang(newLang);
    },
    [i18nFields, fieldOptions, richTextFields]
  );

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
      schema,
      {
        data: {
          ...displayData,
          previewLanguage: currentLang,
        },
        locale,
        theme: 'antd',
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
      ''
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
