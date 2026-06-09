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

/** 从隐藏的 data-field-name div 中读取 FieldWithExclude 值 */
function readExcludeFieldData(field: string): unknown | undefined {
  const excludeData = document.querySelector(`div[data-field-name="${field}"]`);
  if (excludeData) {
    try {
      const parsed = JSON.parse(excludeData.textContent || '{}');
      if (parsed && typeof parsed === 'object' && field in parsed) {
        return parsed[field];
      }
    } catch { /* ignore */ }
  }
  return undefined;
}

/** 持久化当前语言的值到 lookup — 优先从 amis store 读取，fallback 保留特殊处理 */
function persistToLookup(
  scoped: any,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string,
  richTextFields?: string[]
): Record<string, Record<string, unknown>> {
  const form = scoped?.getComponentByName(FORM_NAME);
  const storeValues = form?.getValues() || {};
  const updated = { ...lookup };

  for (const field of fields) {
    // tag 字段跳过（input-tag 的 store 值可能包含未确认的新标签）
    if (field === 'tag') continue;

    // ① 优先从 amis store 读取
    let currentVal: unknown | undefined;
    if (field in storeValues) {
      currentVal = storeValues[field];
    }

    // ② fallback: 自定义组件的隐藏数据 div（FieldWithExcludeV2 excludeName）
    if (currentVal === undefined) {
      currentVal = readExcludeFieldData(field);
    }

    // ③ fallback: TinyMCE 富文本
    if (currentVal === undefined && richTextFields?.includes(field)) {
      currentVal = (window as any).tinymce?.activeEditor?.getContent();
    }

    // ④ fallback: Image 组件（从 DOM 读）
    if (currentVal === undefined) {
      const imgControl = document.querySelector(
        `[data-amis-name="${field}"] .antd-ImageControl`
      );
      if (imgControl) {
        const img = imgControl.querySelector('img') as HTMLImageElement | null;
        if (img?.src && img.src !== window.location.href) currentVal = img.src;
      }
    }

    // 只有成功获取到值才更新 lookup
    if (currentVal !== undefined) {
      const prev = updated[field] || { zh: '', en: '' };
      updated[field] = { ...prev, [lang]: currentVal };
    }
    // 如果所有方式都没获取到值，保持 lookup 中旧值不变
  }
  return updated;
}

/** Merge current values into {zh, en} for all multiLang fields */
function mergeI18nData(
  rawData: Record<string, unknown>,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  currentLang: string,
): Record<string, unknown> {
  const merged = { ...rawData };
  for (const field of fields) {
    let rawVal = rawData[field];

    // 已经是 {zh, en} 结构，跳过
    if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      if ('zh' in (rawVal as object) || 'en' in (rawVal as object)) continue;
    }

    let storeVal: unknown;
    if (Array.isArray(rawVal)) {
      // 数组值直接使用
      storeVal = rawVal;
    } else if (rawVal === undefined || rawVal === null) {
      // 未设置值，fallback 到 api.data 中的原始值（可能是 boolean）
      storeVal = typeof rawVal === 'boolean' ? rawVal : undefined;
    } else {
      storeVal = rawVal;
    }

    if (storeVal === undefined) continue;

    const existing = lookup[field];
    // boolean/array 值不随语言变化，双写
    if (typeof storeVal === 'boolean' || Array.isArray(storeVal)) {
      merged[field] = { zh: storeVal, en: storeVal };
    } else if (existing) {
      // 用当前语言的值覆盖，保留另一语言
      merged[field] = { ...existing, [currentLang]: storeVal };
    } else {
      merged[field] = { zh: storeVal, en: storeVal };
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
  const scopedRef = useRef<any>(null);
  const [currentLang, setCurrentLang] = useState<Language>(previewLanguage || 'zh');
  const langRef = useRef(currentLang);
  langRef.current = currentLang;

  // Extract multiLang fields from schema
  const i18nFields = useMemo(() => collectMultiLangFields(schema), [schema]);
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
        );
        api = { ...api, data: merged };
      }
      return defaultFetcher(api, props);
    },
    [i18nFields]
  );

  // Language switch handler
  const handleLanguageChange = useCallback(
    (newLang: Language) => {
      if (newLang === langRef.current) return;
      const updated = persistToLookup(scopedRef.current, lookupRef.current, i18nFields, langRef.current, richTextFields);
      setLookup(updated);
      langRef.current = newLang;
      setCurrentLang(newLang);
    },
    [i18nFields, richTextFields]
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
      injectFormName(schema),
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
