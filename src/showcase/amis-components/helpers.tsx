/**
 * Shared helpers for Amis component showcase entries.
 */
import React from 'react';
import { AmisLivePreview } from '@/showcase/AmisLivePreview';
import type { ShowcasePage } from '@/showcase/data';

/**
 * Recursively strip {zh,en} values and multiLang flags from schema/data.
 */
export function stripMultiLang(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(item => stripMultiLang(item));
  }
  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (key === 'multiLang') continue;
      if (isI18nValue(value)) {
        result[key] = (value as Record<string, string>)['zh'] || '';
      } else if (key === 'options' && Array.isArray(value)) {
        result[key] = value.map((opt: unknown) => {
          if (opt && typeof opt === 'object' && !Array.isArray(opt)) {
            const optObj = opt as Record<string, unknown>;
            const optResult: Record<string, unknown> = {};
            for (const [oKey, oVal] of Object.entries(optObj)) {
              if (oKey === 'multiLang') continue;
              if (isI18nValue(oVal)) {
                optResult[oKey] = (oVal as Record<string, string>)['zh'] || '';
              } else {
                optResult[oKey] = stripMultiLang(oVal);
              }
            }
            return optResult;
          }
          return stripMultiLang(opt);
        });
      } else if (['body', 'items', 'tabs', 'children', 'steps', 'columns', 'links', 'actions', 'drawer', 'dialog', 'buttons'].includes(key)) {
        result[key] = stripMultiLang(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return obj;
}

/**
 * Check if a value is an i18n content object {zh, en}.
 */
function isI18nValue(val: unknown): boolean {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  const keys = Object.keys(val as object);
  return keys.includes('zh') && keys.length >= 2;
}

/**
 * Helper: create an Amis showcase page entry.
 * For "表单输入" category: provides FOUR JSON blocks (i18n + plain).
 * For other categories: provides single JSON block (plain only).
 */
export function amisPage(
  id: string,
  category: string,
  title: string,
  description: string,
  schema: Record<string, unknown>,
  testData: Record<string, unknown>,
  initialData?: Record<string, unknown>,
  props?: string,
): ShowcasePage[] {
  const isFormInput = category === '表单输入';
  const schemaPlain = stripMultiLang(schema);
  const dataPlain = stripMultiLang(testData);
  return [{
    id: `amis-${id}`,
    category: category as ShowcasePage['category'],
    title,
    description,
    props,
    ...(isFormInput && {
      jsonSchemaI18n: JSON.stringify(schema, null, 2),
      dataI18n: JSON.stringify(testData, null, 2),
    }),
    jsonSchema: JSON.stringify(isFormInput ? schemaPlain : schema, null, 2),
    ...(isFormInput && { data: JSON.stringify(dataPlain, null, 2) }),
    component: () => <AmisLivePreview schema={schema} data={initialData || testData} />,
  }];
}
