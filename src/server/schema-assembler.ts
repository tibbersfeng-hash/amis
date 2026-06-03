/**
 * Schema Assembler — takes LLM component intent and builds Amis schema from templates.
 *
 * Input format from LLM:
 * {
 *   "pageType": "formPage" | "pageWithHeader" | "crudPage",
 *   "pageTitle": "页面标题",
 *   "className": "mission-root",
 *   "api": "/api/data",         // only for crudPage
 *   "filterTitle": "查询条件",  // only for crudPage
 *   "fields": [
 *     { "type": "input-text", "props": { "name": "hotelName", "label": "酒店名称", "required": true, "placeholder": "请输入酒店名称" }},
 *     { "type": "input-text", "props": { "name": "hotelCode", "label": "酒店代码", "required": true, "placeholder": "请输入酒店代码" }},
 *     { "type": "select", "props": { "name": "hotelType", "label": "酒店类型", "options": [{"label":"商务","value":"business"},{"label":"度假","value":"resort"}] }},
 *   ],
 *   "crudColumns": [              // only for crudPage
 *     { "name": "hotelName", "label": "酒店名称", "type": "text" },
 *     { "name": "hotelCode", "label": "酒店代码", "type": "text" },
 *   ],
 *   "searchFields": [             // only for crudPage — filter body fields
 *     { "type": "input-text", "props": { "name": "hotelName", "label": "酒店名称", "placeholder": "请输入" }},
 *     { "type": "input-text", "props": { "name": "hotelCode", "label": "酒店代码", "placeholder": "请输入" }},
 *   ],
 * }
 */

import { COMPONENT_TEMPLATES, PAGE_TEMPLATES, generateSampleData } from './component-templates';

export interface FieldIntent {
  type: string;
  props: Record<string, unknown>;
}

export interface SchemaIntent {
  pageType: 'formPage' | 'pageWithHeader' | 'crudPage';
  pageTitle: string;
  className?: string;
  api?: string;
  filterTitle?: string;
  fields: FieldIntent[];
  crudColumns?: Array<{ name: string; label: string; type?: string }>;
  searchFields?: FieldIntent[];
}

/**
 * Deep clone a template, replacing ${var} placeholders with values from props.
 */
function fillTemplate(template: unknown, props: Record<string, unknown>): unknown {
  if (typeof template === 'string') {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => {
      return props[key] !== undefined ? String(props[key]) : '';
    });
  }
  if (Array.isArray(template)) {
    return template.map(item => fillTemplate(item, props));
  }
  if (template && typeof template === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(template)) {
      // If value is a string placeholder like '${options}', replace from props
      if (typeof value === 'string') {
        const expanded = fillTemplate(value, props);
        // If the expanded result looks like JSON, parse it
        if (typeof expanded === 'string' && expanded.trim().startsWith('[') && expanded.trim().endsWith(']')) {
          try { result[key] = JSON.parse(expanded); } catch { result[key] = expanded; }
        } else if (typeof expanded === 'string' && expanded.trim().startsWith('{') && expanded.trim().endsWith('}')) {
          try { result[key] = JSON.parse(expanded); } catch { result[key] = expanded; }
        } else {
          result[key] = expanded;
        }
      } else {
        result[key] = fillTemplate(value, props);
      }
    }
    return result;
  }
  return template;
}

/**
 * Build a single form field from template + intent.
 */
function buildField(intent: FieldIntent): Record<string, unknown> | null {
  const template = COMPONENT_TEMPLATES[intent.type];
  if (!template) return null;

  return fillTemplate(template.fieldTemplate, intent.props) as Record<string, unknown>;
}

/**
 * Assemble the final schema from intent.
 */
export function assembleSchema(intent: SchemaIntent): { schema: Record<string, unknown>; data: Record<string, unknown> } {
  const pageTemplate = PAGE_TEMPLATES[intent.pageType];
  if (!pageTemplate) {
    throw new Error(`Unknown page type: ${intent.pageType}`);
  }

  // Fill page-level placeholders
  const pageProps: Record<string, unknown> = {
    title: intent.pageTitle || '页面标题',
    className: intent.className || 'mission-root',
    api: intent.api || '/api/data',
    filter_title: intent.filterTitle || '查询条件',
  };

  const page = fillTemplate(pageTemplate, pageProps) as Record<string, unknown>;

  // Build body fields from intent
  const formBody = intent.fields
    .map(f => buildField(f))
    .filter(Boolean) as Record<string, unknown>[];

  // Find the form in the page body and set its body
  function setFormBody(node: unknown, body: Record<string, unknown>[]): boolean {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) {
      return node.some(item => setFormBody(item, body));
    }
    const obj = node as Record<string, unknown>;
    if (obj.type === 'form') {
      obj.body = body;
      return true;
    }
    if (obj.filter && typeof obj.filter === 'object') {
      const filter = obj.filter as Record<string, unknown>;
      if (filter.body) {
        filter.body = body;
        return true;
      }
    }
    for (const val of Object.values(obj)) {
      if (setFormBody(val, body)) return true;
    }
    return false;
  }

  // For CRUD pages, set search fields separately
  if (intent.pageType === 'crudPage' && intent.searchFields && intent.searchFields.length > 0) {
    const searchBody = intent.searchFields
      .map(f => buildField(f))
      .filter(Boolean) as Record<string, unknown>[];

    function setSearchBody(node: unknown): boolean {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) {
        return node.some(item => setSearchBody(item));
      }
      const obj = node as Record<string, unknown>;
      if (obj.type === 'crud' && obj.filter) {
        const filter = obj.filter as Record<string, unknown>;
        if (filter.body !== undefined) {
          filter.body = searchBody;
          return true;
        }
      }
      for (const val of Object.values(obj)) {
        if (setSearchBody(val)) return true;
      }
      return false;
    }
    setSearchBody(page);
  }

  // Set the main form body
  if (intent.fields.length > 0) {
    if (intent.pageType === 'crudPage') {
      // For CRUD, formBody goes into filter body (already handled above)
      // Also set the main form body for form pages within CRUD context
      const mainForm = intent.fields.length > 0 ? formBody : [];
      if (mainForm.length > 0) {
        // If there's a secondary form in crud page, set it too
        function setMainFormBody(node: unknown): boolean {
          if (!node || typeof node !== 'object') return false;
          if (Array.isArray(node)) {
            return node.some(item => setMainFormBody(item));
          }
          const obj = node as Record<string, unknown>;
          // In CRUD page, the form we want is usually the one in body array
          // The filter body was already set above, so we skip filter forms
          if (obj.type === 'form' && obj.filter === undefined) {
            obj.body = mainForm;
            return true;
          }
          for (const val of Object.values(obj)) {
            if (setMainFormBody(val)) return true;
          }
          return false;
        }
        setMainFormBody(page);
      }
    } else {
      // For form pages, set form body
      setFormBody(page, formBody);
    }
  }

  // Set CRUD columns if provided
  if (intent.pageType === 'crudPage' && intent.crudColumns && intent.crudColumns.length > 0) {
    function setCrudColumns(node: unknown): boolean {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) {
        return node.some(item => setCrudColumns(item));
      }
      const obj = node as Record<string, unknown>;
      if (obj.type === 'crud') {
        obj.columns = intent.crudColumns?.map(c => ({
          name: c.name,
          label: c.label,
          type: c.type || 'text',
        }));
        return true;
      }
      for (const val of Object.values(obj)) {
        if (setCrudColumns(val)) return true;
      }
      return false;
    }
    setCrudColumns(page);
  }

  // Generate sample data
  const data = generateSampleData(page);

  return { schema: page, data };
}

/**
 * Validate schema intent. Returns error message or null.
 */
export function validateIntent(intent: Partial<SchemaIntent>): string | null {
  if (!intent.pageType) return '缺少 pageType';
  if (!['formPage', 'pageWithHeader', 'crudPage'].includes(intent.pageType)) {
    return `无效的 pageType: ${intent.pageType}`;
  }
  if (!intent.pageTitle) return '缺少 pageTitle';
  if (!intent.fields || intent.fields.length === 0) return '缺少 fields';

  for (let i = 0; i < intent.fields.length; i++) {
    const field = intent.fields[i];
    if (!field.type) return `field[${i}] 缺少 type`;
    if (!COMPONENT_TEMPLATES[field.type]) {
      return `field[${i}] 未知组件类型: ${field.type}。可用类型: ${Object.keys(COMPONENT_TEMPLATES).join(', ')}`;
    }
    if (!field.props) return `field[${i}] 缺少 props`;
    if (!field.props.name) return `field[${i}] 缺少 props.name`;
    if (!field.props.label) return `field[${i}] 缺少 props.label`;
  }

  return null;
}
