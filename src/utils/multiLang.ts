/**
 * Multi-language content value utilities.
 *
 * Content values use {zh, en} object format when multiLang is enabled:
 *   { "missionName": { "zh": "迈克的任务", "en": "Mike's Mission" } }
 *
 * When rendered, these are flattened to a single language based on the current locale.
 */

import type { Language } from '../components/LanguageSwitcher';

/**
 * Check if a value is an i18n content object {zh, en}.
 */
export function isI18nValue(val: unknown): boolean {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  const keys = Object.keys(val as object);
  return keys.includes('zh') && keys.length >= 2;
}

/**
 * Flatten an i18n value to a single language string.
 * Returns the value for the given language, falling back to 'zh' if missing.
 */
export function flattenI18nValue(val: unknown, lang: Language): unknown {
  if (!isI18nValue(val)) return val;
  const obj = val as Record<string, string>;
  return obj[lang] || obj['zh'] || '';
}

/**
 * Wrap a plain value into an i18n object for backward compatibility.
 * If already i18n format, returns as-is.
 */
export function wrapToI18n(val: unknown): unknown {
  if (isI18nValue(val)) return val;
  if (typeof val === 'string' && val.length > 0) {
    return { zh: val, en: '' };
  }
  return val;
}

/**
 * Fields that can hold i18n content values within a component schema.
 */
const I18N_CONTENT_FIELDS = ['value', 'label', 'placeholder', 'title', 'description', 'remark', 'text', 'content'];

/**
 * Recursively process schema: flatten i18n content values based on multiLang flag and language.
 *
 * Rules:
 * - If component has `multiLang: true`, flatten {zh,en} values in content fields
 * - Children inherit the parent's multiLang flag — nested structures (drawer, dialog, actions, body)
 *   all flatten their {zh,en} values when the root component has multiLang: true
 * - If component has no multiLang flag (or false), leave values as-is
 * - Backward compat: if value is a plain string and multiLang is true, wrap to {zh,en}
 * - For nested schemas (body, items, tabs, etc.), recurse into children
 */
export function processSchemaMultiLang(schema: unknown, lang: Language, _inherited = false): unknown {
  if (Array.isArray(schema)) {
    return schema.map(item => processSchemaMultiLang(item, lang, _inherited));
  }
  if (!schema || typeof schema !== 'object') return schema;

  const obj = schema as Record<string, unknown>;
  const result: Record<string, unknown> = { ...obj };
  const hasMultiLang = obj.multiLang === true || _inherited;

  // Process content fields if multiLang is enabled (own or inherited)
  if (hasMultiLang) {
    for (const field of I18N_CONTENT_FIELDS) {
      if (field in obj) {
        const val = obj[field];
        if (isI18nValue(val)) {
          // Flatten {zh,en} → single language
          result[field] = flattenI18nValue(val, lang);
        } else if (typeof val === 'string' && val.length > 0) {
          // Backward compat: plain string → keep as-is (don't wrap at runtime)
          result[field] = val;
        }
      }
    }
  }

  // Recurse into known container fields — pass inherited flag down
  const CONTAINER_FIELDS = ['body', 'items', 'tabs', 'children', 'steps', 'columns', 'options', 'links', 'actions', 'drawer', 'dialog', 'buttons'];
  for (const field of CONTAINER_FIELDS) {
    if (field in result) {
      result[field] = processSchemaMultiLang(result[field], lang, hasMultiLang);
    }
  }

  // Also handle options array with nested label values
  if (hasMultiLang && Array.isArray(result.options)) {
    result.options = result.options.map((opt: unknown) => {
      if (opt && typeof opt === 'object' && !Array.isArray(opt)) {
        const optObj = opt as Record<string, unknown>;
        const optResult = { ...optObj };
        // options have 'label' as display text
        if ('label' in optObj && isI18nValue(optObj.label)) {
          optResult.label = flattenI18nValue(optObj.label, lang);
        }
        return optResult;
      }
      return opt;
    });
  }

  return result;
}

/**
 * Flatten i18n data values ({zh,en} → single language).
 * Used for form data / test data before passing to Amis.
 */
export function flattenDataMultiLang(data: Record<string, unknown>, lang: Language): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (isI18nValue(val)) {
      result[key] = flattenI18nValue(val, lang);
    } else {
      result[key] = val;
    }
  }
  return result;
}
