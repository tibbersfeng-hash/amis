/**
 * Content values use {zh, en} object format when multiLang is enabled:
 * { zh: "酒店名称", en: "Hotel Name" }
 *
 * These functions flatten/unflatten {zh, en} objects for Amis rendering.
 * Used by the Showcase's AmisLivePreview for schema-level i18n display.
 */
import { getComponentLanguage } from './i18n-config';

type Language = 'zh' | 'en' | 'jp';

function isI18nValue(val: unknown): val is Record<string, string> {
  return !!val && typeof val === 'object' && 'zh' in (val as object) && Object.keys(val as object).length >= 2;
}

/**
 * Recursively process schema: flatten i18n content values based on multiLang flag and language.
 * If a component has `multiLang: true`, flatten {zh, en} values in content fields.
 * Children inherit the parent's multiLang flag.
 */
export function processSchemaMultiLang(
  schema: unknown,
  lang?: Language
): unknown {
  const language = lang || getComponentLanguage() || 'zh';

  function walk(node: unknown, parentMultiLang: boolean): unknown {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map((item) => walk(item, parentMultiLang));

    const obj = node as Record<string, string>;
    const result: Record<string, unknown> = {};
    const isMultiLang = obj.multiLang === true || parentMultiLang;

    for (const [key, val] of Object.entries(obj)) {
      if (key === 'multiLang') continue; // strip marker

      if (isMultiLang && typeof val === 'object' && isI18nValue(val)) {
        result[key] = val[language] || val['zh'];
      } else {
        result[key] = walk(val, isMultiLang);
      }
    }

    return result;
  }

  return walk(schema, false);
}

/**
 * Flatten {zh, en} values in form data to a single language.
 * Recursively processes all values, converting {zh, en} objects to string.
 */
export function flattenDataMultiLang(
  data: Record<string, unknown>,
  lang?: Language
): Record<string, unknown> {
  const language = lang || getComponentLanguage() || 'zh';
  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(data)) {
    if (isI18nValue(val)) {
      result[key] = val[language] || val['zh'];
    } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = flattenDataMultiLang(val as Record<string, unknown>, language);
    } else {
      result[key] = val;
    }
  }

  return result;
}
