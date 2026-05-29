/**
 * Generic schema-driven data extractor.
 *
 * **sourcePath** defines the full config path. The field `name` is optional:
 * - If `name` is provided: use it as-is (for Amis form binding)
 * - If `name` is omitted + `sourcePath` present: auto-derived from last segment of sourcePath
 * - No `sourcePath` → field is at config root level, `name` required
 *
 * **Examples:**
 * ```json
 * // sourcePath only — name auto-derived as "missionCode"
 * { "type": "input-text", "sourcePath": "missionRule.ruleSetup.missionCode" }
 *
 * // sourcePath + explicit name (name used for Amis binding, sourcePath for config lookup)
 * { "type": "input-text", "name": "missionCode", "sourcePath": "missionRule.ruleSetup.missionCode" }
 *
 * // root-level field — no sourcePath, name required
 * { "type": "input-text", "name": "someRootField" }
 * ```
 *
 * **date-range-picker special handling:**
 * `sourcePath` points to a `{startTime, endTime}` object, and values are
 * extracted into the `startName` / `endName` fields.
 */

/**
 * Get a nested value from an object using a dot-separated path.
 * Supports array indexing: `"subMissionRules[0].ruleSetup.field"`
 */
function getByPath(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;

  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalizedPath.split('.');

  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Build full config path from sourcePath (parent) + field name.
 * If no sourcePath, the field is at root level.
 */
function buildPath(sourcePath: string | undefined, fieldName: string): string {
  return sourcePath ? `${sourcePath}.${fieldName}` : fieldName;
}

/**
 * Known Amis form field types that hold a `name` + value.
 */
const FORM_FIELD_TYPES = new Set([
  'input-text',
  'input-number',
  'input-date',
  'input-datetime',
  'input-url',
  'input-email',
  'input-password',
  'textarea',
  'select',
  'radios',
  'checkbox',
  'checkboxes',
  'switch',
  'editor',
  'input-image',
  'input-color',
  'input-range',
  'input-tag',
  'input-tree',
  'tree-select',
  'cascader',
  'transfer',
  'field-with-exclude',
  'static',
  'hidden',
]);

/**
 * Derive the field name from sourcePath's last segment.
 * e.g. "missionRule.ruleSetup.missionCode" → "missionCode"
 */
function deriveNameFromSourcePath(sourcePath: string): string {
  // Handle array indices: "subMissionRules[0].ruleSetup.fieldName" → "fieldName"
  const normalized = sourcePath.replace(/\[\d+\]/g, '');
  const parts = normalized.split('.');
  return parts[parts.length - 1];
}

/**
 * Recursively walk an Amis schema and collect form fields.
 * Returns entries with { name, sourcePath, sourceKey } — sourcePath/sourceKey may be undefined.
 *
 * IMPORTANT: If `name` is omitted but `sourcePath` is present, the name is auto-derived
 * from the last segment of sourcePath. No sourcePath → field is at root level, name required.
 */
function collectFields(
  schema: unknown,
  fields: Array<{ name: string; sourcePath?: string; sourceKey?: string }>,
) {
  if (!schema || typeof schema !== 'object') return;

  if (Array.isArray(schema)) {
    schema.forEach(item => collectFields(item, fields));
    return;
  }

  const obj = schema as Record<string, unknown>;

  // Regular form field — name auto-derived from sourcePath if not provided
  if (
    typeof obj.type === 'string' &&
    FORM_FIELD_TYPES.has(obj.type)
  ) {
    const sp = typeof obj.sourcePath === 'string' ? obj.sourcePath : undefined;
    const sk = typeof obj.sourceKey === 'string' ? obj.sourceKey : undefined;
    const explicitName = typeof obj.name === 'string' ? obj.name : undefined;
    const name = explicitName || (sp ? deriveNameFromSourcePath(sp) : undefined);
    if (name) {
      fields.push({ name, sourcePath: sp, sourceKey: sk });
    }
  }

  // date-range-picker: has startName/endName + sourcePath (parent container)
  if (
    obj.type === 'date-range-picker' &&
    typeof obj.startName === 'string' &&
    typeof obj.endName === 'string'
  ) {
    const sp = typeof obj.sourcePath === 'string' ? obj.sourcePath : undefined;
    fields.push({ name: obj.startName, sourcePath: sp, dateRangeKey: 'startTime' });
    fields.push({ name: obj.endName, sourcePath: sp, dateRangeKey: 'endTime' });
  }

  // Recurse into known container fields
  const CONTAINER_KEYS = ['body', 'tabs', 'children', 'items', 'columns', 'steps', 'links', 'actions', 'drawer', 'dialog', 'buttons'];
  for (const key of CONTAINER_KEYS) {
    if (key in obj) {
      collectFields(obj[key], fields);
    }
  }
}

/**
 * Extract flat formData from a nested config object, driven by schema field definitions.
 */
export function extractFormData(
  schema: Record<string, unknown>,
  config: Record<string, unknown>,
): Record<string, unknown> {
  const fields: Array<{ name: string; sourcePath?: string; sourceKey?: string; dateRangeKey?: string }> = [];
  collectFields(schema, fields);

  const formData: Record<string, unknown> = {};
  for (const { name, sourcePath, sourceKey, dateRangeKey } of fields) {
    let value: unknown;
    if (dateRangeKey) {
      // date-range-picker: sourcePath points to {startTime, endTime} container
      value = sourcePath ? getByPath(config, buildPath(sourcePath, dateRangeKey)) : undefined;
    } else {
      // Regular field: sourcePath (parent) + sourceKey (override) or name
      const key = sourceKey || name;
      value = getByPath(config, buildPath(sourcePath, key));
    }
    if (value !== undefined) {
      formData[name] = value;
    }
  }
  return formData;
}

/**
 * Build a nested config object from flat formData, using schema sourcePath definitions.
 * Reverse of extractFormData — used when saving form data back to config.
 */
export function buildConfig(
  schema: Record<string, unknown>,
  formData: Record<string, unknown>,
  baseConfig?: Record<string, unknown>,
): Record<string, unknown> {
  const fields: Array<{ name: string; sourcePath?: string; sourceKey?: string }> = [];
  collectFields(schema, fields);

  const config = baseConfig ? structuredClone(baseConfig) : {};

  for (const { name, sourcePath, sourceKey } of fields) {
    if (!(name in formData)) continue;

    const value = formData[name];
    const fullPath = buildPath(sourcePath, sourceKey || name);
    const normalizedPath = fullPath.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');

    let current: Record<string, unknown> = config;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        const nextPart = parts[i + 1];
        current[part] = /^\d+$/.test(nextPart) ? [] : {};
      }
      current = current[part] as Record<string, unknown>;
    }

    const leafKey = parts[parts.length - 1];
    current[leafKey] = value;
  }

  return config;
}
