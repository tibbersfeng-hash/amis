import { isI18nValue, LANGUAGE_KEYS } from '@/components/LanguageSwitcher';
import type { LanguageKey } from '@/components/LanguageSwitcher';

const FORM_NAME = 'multiLangForm';

/**
 * MultiLangHandler — encapsulates all multi-language field lifecycle management
 * for AmisPage: collect → build lookup → flatten display → persist on language
 * switch → merge for submit.
 *
 * Usage in AmisPage:
 *   const handler = new MultiLangHandler(schema, formData);
 *   handler.i18nFields        // schema-derived field names
 *   handler.lookup             // { zh, en } lookup table
 *   handler.displayData(lang)  // flattened data for Amis
 *   handler.persist(scoped, lang, richTextFields) → persist current values
 *   handler.merge(rawData, lang) → merge for POST submit
 *   handler.injectFormName(schema) → add form name for scopeRef
 */
export class MultiLangHandler {
  readonly i18nFields: string[];
  lookup: Record<string, Record<string, unknown>>;

  constructor(schema: unknown, initialData: Record<string, unknown>) {
    this.i18nFields = collectMultiLangFields(schema);
    this.lookup = buildLookup(initialData, this.i18nFields);
  }

  /** Whether any multiLang fields exist */
  get hasI18n(): boolean {
    return this.i18nFields.length > 0;
  }

  /** Flatten multiLang data for Amis display in the given language */
  displayData(
    rawData: Record<string, unknown>,
    lang: string,
  ): Record<string, unknown> {
    if (!this.hasI18n) return rawData;
    return flattenData(rawData, this.i18nFields, this.lookup, lang);
  }

  /** Persist current language values from amis store into lookup */
  persist(
    scoped: any,
    lang: string,
    richTextFields?: string[],
  ): Record<string, Record<string, unknown>> {
    // 切换语言前，强制触发所有字段的 blur + 验证，确保 store 值已同步
    // 这解决了 input-number/textarea/email 等 blur-sync 组件在用户快速操作时值丢失的问题
    const form = scoped?.getComponentByName(FORM_NAME);
    try {
      form?.validate?.();
    } catch {
      // validate 可能返回 Promise 或在验证失败时抛错，忽略
    }
    this.lookup = persistToLookup(scoped, this.lookup, this.i18nFields, lang, richTextFields);
    return this.lookup;
  }

  /** Merge multiLang fields into raw data for POST submit */
  merge(
    rawData: Record<string, unknown>,
    currentLang: string,
  ): Record<string, unknown> {
    return mergeI18nData(rawData, this.lookup, this.i18nFields, currentLang);
  }

  /** Inject form name into schema for scopeRef + getComponentByName */
  injectFormName(schema: Record<string, unknown>): Record<string, unknown> {
    return injectFormName(schema);
  }
}

// ─── Internal functions ────────────────────────────────────────

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

/** Build a lookup of original multi-lang values for schema-defined fields.
 *  Values are stored as-is — {zh, en} objects are kept directly,
 *  while plain strings/numbers/booleans are wrapped into {zh: val, en: val, jp: val}
 *  so that flattenData can handle them uniformly.
 */
function buildLookup(data: Record<string, unknown>, fields: string[]): Record<string, Record<string, unknown>> {
  const lookup: Record<string, Record<string, unknown>> = {};
  for (const field of fields) {
    const val = data[field];
    if (val !== undefined) {
      if (isI18nValue(val)) {
        // Already a language-keyed object — keep as-is
        lookup[field] = val as Record<string, unknown>;
      } else {
        // Plain value — duplicate across all languages (upgrade)
        lookup[field] = Object.fromEntries(LANGUAGE_KEYS.map((k) => [k, val]));
      }
    }
  }
  return lookup;
}

/** Flatten {zh, en} → single language value for Amis display */
function flattenData(
  data: Record<string, unknown>,
  fields: string[],
  lookup: Record<string, Record<string, unknown>>,
  lang: string,
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

/**
 * Read current value from DOM for a form field.
 * 用于处理 Amis 受控组件在用户快速操作时 store 未同步的情况。
 * DOM 是用户实际看到的状态，比 store 更可靠。
 */
function readDomValue(field: string): unknown | undefined {
  // input / textarea
  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `input[name="${field}"], textarea[name="${field}"]`
  );
  if (input) {
    if (input instanceof HTMLInputElement && input.type === 'number') {
      const numVal = input.valueAsNumber;
      return isNaN(numVal) ? (input.value || undefined) : numVal;
    }
    return input.value || undefined;
  }

  // select
  const select = document.querySelector<HTMLSelectElement>(`select[name="${field}"]`);
  if (select) {
    return select.value || undefined;
  }

  // radio (checked)
  const checkedRadio = document.querySelector<HTMLInputElement>(
    `input[type="radio"][name="${field}"]:checked`
  );
  if (checkedRadio) {
    return checkedRadio.value;
  }

  // checkboxes (all checked → array)
  const checkboxes = document.querySelectorAll<HTMLInputElement>(
    `input[type="checkbox"][name="${field}"]:checked`
  );
  if (checkboxes.length > 0) {
    return Array.from(checkboxes).map((cb) => cb.value);
  }

  return undefined;
}

/** 持久化当前语言的值到 lookup — 优先从 amis store 读取，fallback 保留特殊处理 */
function persistToLookup(
  scoped: any,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string,
  richTextFields?: string[],
): Record<string, Record<string, unknown>> {
  const form = scoped?.getComponentByName(FORM_NAME);
  const storeValues = form?.getValues?.() || {};
  const updated = { ...lookup };

  for (const field of fields) {
    // tag 字段跳过（input-tag 的 store 值可能包含未确认的新标签）
    if (field === 'tag') continue;

    // ① 优先从 amis store 读取
    let currentVal: unknown | undefined;
    if (field in storeValues) {
      currentVal = storeValues[field];
    }

    // ①.5 DOM fallback: Amis 受控组件在 blur-sync 场景下 store 可能滞后，
    // DOM 是用户实际看到的状态，更可靠
    const domVal = readDomValue(field);
    if (domVal !== undefined && domVal !== currentVal) {
      currentVal = domVal;
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
        `[data-amis-name="${field}"] .antd-ImageControl`,
      );
      if (imgControl) {
        const img = imgControl.querySelector('img') as HTMLImageElement | null;
        if (img?.src && img.src !== window.location.href) currentVal = img.src;
      }
    }

    // 只有成功获取到值才更新 lookup
    if (currentVal !== undefined) {
      const prev = updated[field] || Object.fromEntries(LANGUAGE_KEYS.map((k) => [k, '']));
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

    // 已经是多语言结构，跳过
    if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      if (LANGUAGE_KEYS.some((key) => key in (rawVal as object))) continue;
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
      merged[field] = Object.fromEntries(LANGUAGE_KEYS.map((k) => [k, storeVal]));
    } else if (existing) {
      // 用当前语言的值覆盖，保留另一语言
      merged[field] = { ...existing, [currentLang]: storeVal };
    } else {
      merged[field] = Object.fromEntries(LANGUAGE_KEYS.map((k) => [k, storeVal]));
    }
  }
  return merged;
}
