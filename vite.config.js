import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load the components guide document.
 */
function loadComponentsGuide() {
  try {
    return fs.readFileSync(
      path.resolve(__dirname, 'docs', 'amis-components.md'),
      'utf-8'
    );
  } catch {
    return '# Amis 组件介绍文档\n\n(文档未找到)';
  }
}

// ─── Component Templates (inline copy for Node.js usage) ───────────
// These match src/server/component-templates.ts but are inlined here
// so vite.config.js can use them without TS compilation.

const FIELD_TEMPLATES = {
  'input-text': {
    template: {
      type: 'input-text', name: '${name}', label: '${label}',
      placeholder: '${placeholder}', required: false, clearable: true, size: 'md',
    },
    description: '单行文本输入框',
  },
  'textarea': {
    template: {
      type: 'textarea', name: '${name}', label: '${label}',
      placeholder: '${placeholder}', required: false, rows: 3, maxLength: 500,
    },
    description: '多行文本输入',
  },
  'input-number': {
    template: {
      type: 'input-number', name: '${name}', label: '${label}',
      placeholder: '${placeholder}', required: false, min: 0, precision: 0, size: 'md',
    },
    description: '数字输入框',
  },
  'select': {
    template: {
      type: 'select', name: '${name}', label: '${label}',
      placeholder: '${placeholder}', required: false, clearable: true,
      searchable: true, size: 'md', options: '${options}',
    },
    description: '下拉选择框',
  },
  'radios': {
    template: {
      type: 'radios', name: '${name}', label: '${label}',
      required: false, options: '${options}',
    },
    description: '单选按钮组',
  },
  'checkboxes': {
    template: {
      type: 'checkboxes', name: '${name}', label: '${label}',
      options: '${options}',
    },
    description: '复选框组',
  },
  'switch': {
    template: {
      type: 'switch', name: '${name}', label: '${label}',
      option: ['${option_true}', '${option_false}'],
    },
    description: '开关控件',
  },
  'input-date': {
    template: {
      type: 'input-date', name: '${name}', label: '${label}',
      required: false, format: 'YYYY-MM-DD', inputFormat: 'YYYY-MM-DD', clearable: true,
    },
    description: '日期选择器',
  },
  'input-datetime': {
    template: {
      type: 'input-datetime', name: '${name}', label: '${label}',
      required: false, format: 'YYYY-MM-DD HH:mm:ss',
      inputFormat: 'YYYY-MM-DD HH:mm:ss', timeFormat: 'HH:mm:ss', clearable: true,
    },
    description: '日期时间选择器',
  },
  'input-date-range': {
    template: {
      type: 'input-date-range', name: '${name}', label: '${label}',
      required: false, format: 'YYYY-MM-DD', inputFormat: 'YYYY-MM-DD', clearable: true,
    },
    description: '日期范围选择器',
  },
  'input-image': {
    template: {
      type: 'input-image', name: '${name}', label: '${label}', multiple: false,
    },
    description: '图片上传',
  },
  'input-color': {
    template: {
      type: 'input-color', name: '${name}', label: '${label}', placeholder: '${placeholder}',
    },
    description: '颜色选择器',
  },
  'cascader': {
    template: {
      type: 'cascader', name: '${name}', label: '${label}',
      placeholder: '${placeholder}', required: false, options: '${options}',
    },
    description: '级联选择器',
  },
  'transfer': {
    template: {
      type: 'transfer', name: '${name}', label: '${label}',
      required: false, options: '${options}', searchable: true,
    },
    description: '穿梭框',
  },
  'editor': {
    template: {
      type: 'editor', name: '${name}', label: '${label}',
      language: '${language}', size: '${size}',
    },
    description: '代码编辑器',
  },
  'tpl': {
    template: {
      type: 'tpl', tpl: '<div class="section-title-sm">${content}</div>', inline: false,
    },
    description: '模板文本',
  },
  'divider': {
    template: {
      type: 'divider', lineStyle: { color: '#E8E8E8' },
    },
    description: '分隔线',
  },
  'group': {
    template: {
      type: 'group', body: '${fields}',
    },
    description: '表单项组',
  },
  'wrapper': {
    template: {
      type: 'wrapper', className: '${className}', body: '${body}',
    },
    description: '包装器',
  },
};

/**
 * Deep clone and fill ${var} placeholders in a template.
 */
function fillTemplate(template, props) {
  if (typeof template === 'string') {
    return template.replace(/\$\{(\w+)\}/g, (_, key) => {
      if (props[key] === undefined) return '';
      // If props value is array or plain object, return as JSON string for later parsing
      if (Array.isArray(props[key]) || (typeof props[key] === 'object')) {
        return JSON.stringify(props[key]);
      }
      return String(props[key]);
    });
  }
  if (Array.isArray(template)) {
    return template.map(item => fillTemplate(item, props));
  }
  if (template && typeof template === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'string') {
        const expanded = fillTemplate(value, props);
        if (typeof expanded === 'string' && expanded.trim().startsWith('[')) {
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
 * Build a form field from template + field intent.
 */
function buildField(intent) {
  const t = FIELD_TEMPLATES[intent.type];
  if (!t) return null;
  const filled = fillTemplate(t.template, intent.props || {});
  // Merge intent props to override template defaults (e.g. required: true, options array)
  return { ...filled, ...(intent.props || {}) };
}

/**
 * Assemble final schema from intent.
 */
function assembleSchema(intent) {
  const { pageType, pageTitle, className, api, filterTitle, fields, tabs, visibilityRules, computedFields, crudColumns, searchFields } = intent;

  // Page template
  let page;
  if (pageType === 'crudPage') {
    page = {
      type: 'page',
      title: pageTitle || '页面标题',
      body: [{
        type: 'crud',
        mode: 'table',
        syncLocation: false,
        api: api || '/api/data',
        filter: {
          title: filterTitle || '查询条件',
          mode: 'normal',
          wrapWithPanel: true,
          className: 'search-form',
          body: [],
          actions: [
            { type: 'submit', label: '查询', level: 'primary', className: 'btn-search' },
            { type: 'reset', label: '重置', className: 'btn-clear' },
          ],
        },
        columns: [],
        headerToolbar: [],
        perPage: 10,
        perPageAvailable: [10, 20, 50],
        footerToolbar: [
          { type: 'statistics', align: 'left' },
          { type: 'pagination', align: 'center', maxButtons: 6, showPageInput: false },
          { type: 'switch-per-page', align: 'right' },
        ],
      }],
    };
  } else {
    page = {
      type: 'page',
      title: pageTitle || '页面标题',
      className: className || 'mission-root',
      body: [{
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        data: {},
        body: [],
        actions: [
          { type: 'submit', label: '提交', level: 'primary' },
        ],
      }],
    };
  }

  // Build field objects with visibility rules applied
  function applyVisibility(field) {
    if (!field || !field.props || !visibilityRules) return field;
    const name = field.props.name;
    const rule = visibilityRules.find(r => r.field === name);
    if (rule) {
      if (rule.visibleOn) field.visibleOn = rule.visibleOn;
      if (rule.hiddenOn) field.hiddenOn = rule.hiddenOn;
    }
    return field;
  }

  // Build fields from flat list
  const formBody = (fields || [])
    .map(f => buildField(f))
    .map(applyVisibility)
    .filter(Boolean);

  // Build tabs structure (if tabs provided, replaces flat fields)
  function buildTabsBody(tabsArr) {
    if (!tabsArr || tabsArr.length === 0) return [];
    return tabsArr.map(tab => ({
      title: tab.title || 'Tab',
      tab: tab.group || tab.title || 'tab',
      body: (tab.fields || [])
        .map(f => buildField(f))
        .map(applyVisibility)
        .filter(Boolean),
    }));
  }

  const tabsBody = buildTabsBody(tabs);

  // Build computed field wrappers for formula-based fields
  function addComputedFields(formNode) {
    if (!computedFields || computedFields.length === 0) return;
    const computedItems = computedFields.map(cf => ({
      type: 'input-number',
      name: cf.name,
      label: cf.label || cf.name,
      readOnly: true,
      value: cf.formula,
      mode: 'horizontal',
    }));
    if (formNode && Array.isArray(formNode.body)) {
      formNode.body.push({
        type: 'divider',
        lineStyle: { color: '#E8E8E8' },
      }, ...computedItems);
    }
  }

  // Set form body or tabs
  function setFormBody(node) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(setFormBody);
    const obj = node;
    if (obj.type === 'form' && obj.filter === undefined) {
      if (tabsBody.length > 0) {
        // Use tabs layout
        obj.body = [{
          type: 'tabs',
          mode: 'line',
          tabs: tabsBody,
        }];
      } else {
        obj.body = formBody;
      }
      // Add computed fields after form body is set
      addComputedFields(obj);
      return true;
    }
    return Object.values(obj).some(setFormBody);
  }
  if ((formBody.length > 0 || tabsBody.length > 0) && pageType !== 'crudPage') {
    setFormBody(page);
  }

  // CRUD: set search fields in filter
  if (pageType === 'crudPage' && searchFields && searchFields.length > 0) {
    const searchBody = searchFields.map(f => buildField(f)).filter(Boolean);
    function setSearchBody(node) {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) return node.some(setSearchBody);
      if (node.type === 'crud' && node.filter) {
        node.filter.body = searchBody;
        return true;
      }
      return Object.values(node).some(setSearchBody);
    }
    setSearchBody(page);
  }

  // CRUD: set columns
  if (pageType === 'crudPage' && crudColumns && crudColumns.length > 0) {
    function setColumns(node) {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) return node.some(setColumns);
      if (node.type === 'crud') {
        node.columns = crudColumns.map(c => ({ name: c.name, label: c.label, type: c.type || 'text' }));
        return true;
      }
      return Object.values(node).some(setColumns);
    }
    setColumns(page);
  }

  // Generate sample data
  const data = generateSampleData(page);

  return { schema: JSON.stringify(page, null, 2), data: JSON.stringify(data, null, 2) };
}

/**
 * Generate plausible sample data based on schema field types.
 */
function generateSampleData(schema) {
  const data = {};
  const dotData = {};

  function extractFields(node, prefix = '') {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(n => extractFields(n, prefix)); return; }

    const obj = node;
    if (obj.type === 'form' || obj.type === 'filter') {
      if (Array.isArray(obj.body)) obj.body.forEach(f => extractFields(f, prefix));
      return;
    }
    if (obj.type && !['page', 'wrapper', 'group', 'container', 'flex', 'crud'].includes(obj.type)) {
      if (obj.name) {
        const fullName = prefix ? `${prefix}.${obj.name}` : obj.name;
        dotData[fullName] = getDefaultValue(obj, fullName);
      }
      return;
    }
    Object.values(obj).forEach(v => extractFields(v, prefix));
  }

  extractFields(schema);

  // Convert dot-notation to nested
  for (const [key, value] of Object.entries(dotData)) {
    const parts = key.split('.');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  return data;
}

function getDefaultValue(field, name) {
  const lower = name.toLowerCase();
  if (field.type === 'input-date') return '2026-06-01';
  if (field.type === 'input-datetime') return '2026-06-01 10:00:00';
  if (field.type === 'input-date-range') return '2026-06-01';
  if (field.type === 'input-number') {
    if (lower.includes('quota') || lower.includes('amount') || lower.includes('price')) return 1000;
    if (lower.includes('night') || lower.includes('count')) return 3;
    return 0;
  }
  if (['select', 'radios', 'checkboxes'].includes(field.type)) {
    if (Array.isArray(field.options) && field.options.length > 0) return field.options[0].value;
  }
  if (field.type === 'switch') return false;
  if (lower.includes('code') || lower.includes('代码')) return 'CODE-001';
  if (lower.includes('email') || lower.includes('mail')) return 'demo@example.com';
  if (lower.includes('phone') || lower.includes('mobile')) return '13800138000';
  if (lower.includes('desc') || lower.includes('remark') || lower.includes('note')) return '示例描述文本';
  if (lower.includes('name') || lower.includes('title')) return '示例文本';
  return '示例文本';
}

// ─── Output Parser ─────────────────────────────────────────────────

/**
 * Parse Claude output to extract schema and data JSON.
 * Layered routing: complete Amis schema first (for complex nested structures), then Intent JSON (for simple forms/CRUD).
 */
function parseClaudeOutput(output) {
  // Helper: try to parse and assemble intent JSON from a candidate string
  function tryAssembleIntent(candidate) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed.pageType) {
        const fieldsProvided = Array.isArray(parsed.fields);
        const tabsProvided = Array.isArray(parsed.tabs) && parsed.tabs.length > 0;
        // Regular form with fields or tabs
        if (fieldsProvided || tabsProvided) {
          const result = assembleSchema(parsed);
          return { schema: result.schema, data: result.data };
        }
        // CRUD intent with searchFields but no fields
        if (parsed.pageType === 'crudPage' && (parsed.searchFields || parsed.crudColumns)) {
          const result = assembleSchema({ ...parsed, fields: parsed.fields || [] });
          return { schema: result.schema, data: result.data };
        }
        // Tabs-only form
        if (tabsProvided) {
          const result = assembleSchema(parsed);
          return { schema: result.schema, data: result.data };
        }
      }
    } catch { /* not valid intent JSON */ }
    return null;
  }

  // Helper: detect if a parsed JSON object is a complete Amis schema
  function isAmisSchema(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.type === 'page' && Array.isArray(obj.body)) return true;
    if (obj.type === 'form' && Array.isArray(obj.body)) return true;
    if (obj.type === 'crud' && Array.isArray(obj.columns)) return true;
    return false;
  }

  // Extract all JSON code blocks
  const allCodeBlocks = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/g);
  if (allCodeBlocks) {
    const cleanBlock = (block) => block.replace(/^```(?:json)?\s*\n/, '').replace(/\n```$/, '').trim();
    // Layer 1: Complete Amis schema first (for complex nested structures)
    for (const block of allCodeBlocks) {
      try {
        const parsed = JSON.parse(cleanBlock(block));
        if (isAmisSchema(parsed)) {
          return { schema: cleanBlock(block), data: JSON.stringify(generateSampleData(parsed), null, 2) };
        }
      } catch { /* continue */ }
    }
    // Layer 2: Intent JSON (for simple forms/CRUD)
    for (const block of allCodeBlocks) {
      const result = tryAssembleIntent(cleanBlock(block));
      if (result) return result;
    }
  }

  // Strategy 0.5: Try raw JSON containing "pageType" (no markdown fence)
  const pageTypeRegex = /\{[\s\S]*?"pageType"[\s\S]*?"fields"[\s\S]*?\}/m;
  if (!pageTypeRegex.test(output)) {
    const tabsTypeRegex = /\{[\s\S]*?"pageType"[\s\S]*?"tabs"[\s\S]*?\}/m;
    const crudTypeRegex = /\{[\s\S]*?"pageType"[\s\S]*?"searchFields"[\s\S]*?\}/m;
    if (tabsTypeRegex.test(output) || crudTypeRegex.test(output)) {
      const fullJsonMatch = extractJsonObject(output);
      if (fullJsonMatch) {
        const result = tryAssembleIntent(fullJsonMatch);
        if (result) return result;
      }
    }
  } else {
    const fullJsonMatch = extractJsonObject(output);
    if (fullJsonMatch) {
      const result = tryAssembleIntent(fullJsonMatch);
      if (result) return result;
    }
  }

  // Strategy 1: SCHEMA_START/SCHEMA_END markers
  const schemaMarkerMatch = output.match(/\/\/ SCHEMA_START\s*\n([\s\S]*?)\n\s*\/\/ SCHEMA_END/);
  const dataMarkerMatch = output.match(/\/\/ DATA_START\s*\n([\s\S]*?)\n\s*\/\/ DATA_END/);

  if (schemaMarkerMatch || dataMarkerMatch) {
    return {
      schema: schemaMarkerMatch ? schemaMarkerMatch[1].trim() : null,
      data: dataMarkerMatch ? dataMarkerMatch[1].trim() : null,
    };
  }

  // Strategy 2: All code blocks as raw schema/data
  if (allCodeBlocks && allCodeBlocks.length >= 1) {
    const cleanBlock = (block) => block.replace(/^```(?:json)?\s*\n/, '').replace(/\n```$/, '').trim();
    const first = cleanBlock(allCodeBlocks[0]);
    const second = allCodeBlocks.length >= 2 ? cleanBlock(allCodeBlocks[1]) : null;
    try {
      JSON.parse(first);
      if (second) JSON.parse(second);
      return { schema: first, data: second };
    } catch { /* continue */ }
  }

  // Strategy 2.5: Detect complete Amis schema in raw output (no code fences)
  const rawJson = extractJsonObject(output);
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (isAmisSchema(parsed)) {
        return { schema: rawJson, data: JSON.stringify(generateSampleData(parsed), null, 2) };
      }
    } catch { /* continue */ }
  }

  // Strategy 3: Brace matching for raw JSON objects
  const jsonObjects = [];
  const outputLines = output.split('\n');
  for (let i = 0; i < outputLines.length; i++) {
    if (outputLines[i].trim() === '{') {
      let depth = 1;
      let json = '{';
      for (let j = i + 1; j < outputLines.length && depth > 0; j++) {
        json += '\n' + outputLines[j];
        for (const ch of outputLines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
      }
      jsonObjects.push(json);
    }
  }
  if (jsonObjects.length >= 1) {
    try {
      JSON.parse(jsonObjects[0]);
      const schema = jsonObjects[0];
      const data = jsonObjects.length >= 2 ? (() => {
        try { JSON.parse(jsonObjects[1]); return jsonObjects[1]; } catch { return null; }
      })() : null;
      return { schema, data };
    } catch { /* continue */ }
  }

  // All strategies failed
  const preview = output.slice(0, 300).replace(/\n/g, '\\n');
  return { schema: null, data: null, error: `无法解析 Claude 输出。原始输出前300字符: ${preview}` };
}

/**
 * Extract a balanced JSON object from text by finding matching braces.
 * Returns the full JSON string or null if none found.
 */
function extractJsonObject(text) {
  // Find the first '{' that precedes a 'pageType' reference
  const startIdx = text.indexOf('{');
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\') {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.substring(startIdx, i + 1);
      }
    }
  }
  return null;
}

// ─── AI Prompt Config Loader (hot-reload, no restart needed) ────────

/**
 * Load ai-prompt-config.json on EVERY call — changes take effect immediately.
 * Edit ai-prompt-config.json while the server is running, no restart needed.
 */
function loadPromptConfig() {
  const configPath = path.resolve(__dirname, 'ai-prompt-config.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ai-prompt] Failed to load ${configPath}: ${err.message}`);
    // Fallback: return minimal config so the server doesn't break
    return { role: '', outputFormat: '', rules: '', visibleOnExamples: '', components: {} };
  }
}

function buildAvailableComponentsList(config) {
  if (!config) config = loadPromptConfig();
  const c = config.components || {};
  const sections = [
    ['Form Components', c.formComponents],
    ['Layout Components', c.layoutComponents],
    ['Data Components', c.dataComponents],
    ['Feedback Components', c.feedbackComponents],
    ['Navigation Components', c.navigationComponents],
    ['Action Components', c.actionComponents],
    ['Display Components', c.displayComponents],
    ['Advanced Components', c.advancedComponents],
  ];

  const lines = [];
  for (const [title, items] of sections) {
    if (!items || items.length === 0) continue;
    lines.push(`### ${title}`);
    lines.push(...items);
    lines.push('');
  }

  // Field Linkage
  if (c.fieldLinkage && c.fieldLinkage.length > 0) {
    lines.push('### Field Linkage (visibleOn/hiddenOn expressions)');
    lines.push('Use "visibleOn" or "hiddenOn" on any field to control conditional display:');
    lines.push(...c.fieldLinkage);
  }

  return lines.join('\n');
}

/**
 * Build a system prompt containing component knowledge + output rules.
 * Reads ai-prompt-config.json on EVERY call — edit the config file, no restart needed.
 * Context (schema, data, images, user request) goes into the -p prompt.
 */
function buildSystemPrompt(componentCatalog) {
  const config = loadPromptConfig();
  const parts = [];

  parts.push(config.role || `You are an Amis schema component selection assistant.`);

  // Dynamic component list from config
  const componentsText = buildAvailableComponentsList(config);
  if (componentsText) {
    parts.push(`\n## Available Components\n\n${componentsText}`);
  }

  // Dynamic showcase pages from frontend
  if (componentCatalog && componentCatalog.length > 0) {
    parts.push(`\n### Showcase Pages\nPre-built component pages available in the system. Reference their IDs, types, and classNames when suggesting page compositions:\n`);
    const byCategory = {};
    for (const entry of componentCatalog) {
      if (!byCategory[entry.category]) byCategory[entry.category] = [];
      byCategory[entry.category].push(entry);
    }
    for (const [category, entries] of Object.entries(byCategory)) {
      parts.push(`#### ${category}`);
      for (const e of entries) {
        let line = `- \`${e.id}\`: ${e.title}`;
        if (e.type) line += ` | type: \`${e.type}\``;
        if (e.className) line += ` | className: \`${e.className}\``;
        if (e.description) line += ' — ' + e.description;
        parts.push(line);
      }
    }
  }

  // Output format from config
  if (config.outputFormat) parts.push(`\n${config.outputFormat}`);

  // Rules from config
  if (config.rules) parts.push(`\n${config.rules}`);

  // visibleOn examples from config
  if (config.visibleOnExamples) parts.push(`\n${config.visibleOnExamples}`);

  return parts.join('\n');
}

// ─── Image Attachment Handler ──────────────────────────────────────

/**
 * Save base64 image data to a temp file and return its path.
 * Images are stored in .cc-connect/attachments/ directory.
 */
function saveImageAttachment(base64Data, fileName) {
  const attachmentsDir = path.resolve(__dirname, '.cc-connect', 'attachments');
  if (!fs.existsSync(attachmentsDir)) {
    fs.mkdirSync(attachmentsDir, { recursive: true });
  }
  const filePath = path.join(attachmentsDir, fileName);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Build a text instruction referencing image files for Claude to read.
 */
function buildImageReferencePrompt(imagePaths) {
  if (imagePaths.length === 0) return '';
  const lines = [
    '\n## Attached Images',
    'The user has attached the following image files. Read them and use as design reference:',
  ];
  imagePaths.forEach((p, i) => {
    lines.push(`\nImage ${i + 1}: \`${p}\` — read this file and analyze its contents for schema generation.`);
  });
  lines.push('\n');
  return lines.join('\n');
}

// ─── Claude CLI Caller ─────────────────────────────────────────────

const CLAUDE_MAX_RETRIES = 1; // Retry once on parse failure
const CLAUDE_TIMEOUT_MS = 600_000; // 10 minutes — Claude with images can take >5min

/**
 * Internal: single Claude CLI invocation.
 */
function _invokeClaude(systemPrompt, userMsg, sessionId, imagePaths) {
  // ── Log input for debugging ──
  const ts = new Date().toISOString();
  console.log(`\n[AI-${ts}] ═══ Claude Invoke ═══`);
  console.log(`[AI-${ts}] Session: ${sessionId || '(new)'}`);
  console.log(`[AI-${ts}] Image attachments: ${imagePaths.length}`);
  console.log(`[AI-${ts}] System prompt length: ${systemPrompt.length} chars`);
  console.log(`[AI-${ts}] User prompt (first 300 chars):\n${userMsg.slice(0, 300)}...`);
  console.log(`[AI-${ts}] User prompt (last 200 chars):\n...${userMsg.slice(-200)}`);
  console.log(`[AI-${ts}] ─── Starting Claude ───`);

  return new Promise((resolve) => {
    const claudeArgs = [
      '--system-prompt', systemPrompt,
      '-p', userMsg,
      '--output-format', 'text',
      '--max-turns', '50',
      '--permission-mode', 'bypassPermissions',
    ];

    if (sessionId && sessionId !== 'default') {
      claudeArgs.push('--resume', sessionId);
    }

    const TIMEOUT_MS = 120_000;
    let output = '';
    let stderr = '';

    const proc = spawn('claude', claudeArgs, {
      timeout: CLAUDE_TIMEOUT_MS,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'], // ignore stdin — prevents "no stdin data" timeout
    });

    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      const result = parseClaudeOutput(output);

      let extractedSessionId = null;
      const sessionMatch = stderr.match(/session:?\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (sessionMatch) {
        extractedSessionId = sessionMatch[1];
      }

      // ── Log output for debugging ──
      const endTs = new Date().toISOString();
      console.log(`\n[AI-${endTs}] ═══ Claude Result ═══`);
      console.log(`[AI-${endTs}] Exit code: ${code}`);
      console.log(`[AI-${endTs}] Stderr (${stderr.length} chars): ${stderr.slice(0, 500)}`);
      console.log(`[AI-${endTs}] Raw output (${output.length} chars): ${output.slice(0, 500)}${output.length > 500 ? '...' : ''}`);
      if (result.error) {
        console.log(`[AI-${endTs}] Parse error: ${result.error}`);
      } else {
        console.log(`[AI-${endTs}] Parse ok — schema: ${result.schema ? result.schema.length : 0} chars, data: ${result.data ? result.data.length : 0} chars`);
      }
      console.log(`[AI-${endTs}] ═══ End ═══\n`);

      if (code !== 0 && output.length === 0) {
        resolve({ ok: false, error: `Claude CLI 退出码 ${code}\n${stderr.slice(0, 500)}`, output, stderr });
        return;
      }

      if (result.error) {
        resolve({ ok: false, error: result.error, output, stderr, sessionId: extractedSessionId || sessionId || null });
      } else {
        resolve({ ok: true, ...result, sessionId: extractedSessionId || sessionId || null, rawText: output });
      }
    });

    proc.on('error', (err) => {
      console.error(`[AI-${new Date().toISOString()}] Claude CLI 启动失败: ${err.message}`);
      resolve({ ok: false, error: `Claude CLI 启动失败: ${err.message}`, output, stderr });
    });

    proc.on('timeout', () => {
      console.error(`[AI-${new Date().toISOString()}] Claude CLI 超时（120s）`);
      proc.kill();
      resolve({ ok: false, error: 'Claude CLI 超时（120s）', output });
    });
  });
}

/**
 * Call Claude CLI to generate schema intent JSON.
 * Auto-retries once if Claude's output cannot be parsed.
 *
 * Uses Claude CLI's native --session-id / --resume for conversation continuity.
 * The sessionId is a UUID that Claude Code uses to store session state in .claude/.
 *
 * @param {string} sessionId - UUID for Claude's --session-id / --resume flag (empty = new session)
 * @param {string} userPrompt - Current user request
 * @param {string} currentSchema - Current schema JSON (from editor)
 * @param {string} currentData - Current data JSON (from editor)
 * @param {Array<{data: string, fileName: string}>} images - Base64 images to pass as file attachments
 * @param {Array<{id: string, category: string, title: string, description: string}>} componentCatalog - Dynamic component catalog from frontend
 */
function callClaude(sessionId, userPrompt, currentSchema, currentData, images = [], componentCatalog = []) {
  // Save images as temp files
  const imagePaths = [];
  for (const img of (images || [])) {
    try {
      const filePath = saveImageAttachment(img.data, img.fileName);
      imagePaths.push(filePath);
    } catch (err) {
      console.error(`[AI Generator] Failed to save image ${img.fileName}:`, err.message);
    }
  }

  // Build image reference section
  const imageRef = buildImageReferencePrompt(imagePaths);

  // System prompt: components + output rules (static knowledge)
  const systemPrompt = buildSystemPrompt(componentCatalog);

  // User prompt: task-specific context + request
  const userMsg = `## Current Schema (for context — preserve existing structure when modifying)
\`\`\`json
${currentSchema}
\`\`\`

## Current Data (for context)
\`\`\`json
${currentData}
\`\`\`
${imageRef}
## User Request
${userPrompt}

REMINDER: Output ONLY a single JSON object. No explanations, no markdown code fences, no text before or after the JSON.`;

  const cleanupFiles = () => {
    for (const p of imagePaths) {
      try { fs.unlinkSync(p); } catch {}
    }
  };

  // First attempt
  return _invokeClaude(systemPrompt, userMsg, sessionId, imagePaths).then(async (firstResult) => {
    if (firstResult.ok) {
      cleanupFiles();
      console.log(`[AI-${new Date().toISOString()}] First attempt OK`);
      return firstResult;
    }

    // Retry with stricter prompt if parse failed
    if (CLAUDE_MAX_RETRIES > 0 && firstResult.error && firstResult.error.includes('无法解析')) {
      console.log(`[AI-${new Date().toISOString()}] Parse failed, retrying with stricter prompt...`);
      const retrySystemPrompt = systemPrompt + `\n\nCRITICAL RETRY: Your previous output could not be parsed as JSON. This time, output ONLY the JSON object. No explanation, no markdown, no text before or after.`;
      const retryMsg = userMsg + `\n\nIMPORTANT: Output ONLY valid JSON. Do NOT use markdown code fences.`;

      const retryResult = await _invokeClaude(retrySystemPrompt, retryMsg, sessionId, imagePaths);
      cleanupFiles();

      if (retryResult.ok) {
        console.log(`[AI-${new Date().toISOString()}] Retry OK`);
        return { ...retryResult, retryAttempt: true };
      }
      // Return first result's error if retry also failed
      console.error(`[AI-${new Date().toISOString()}] Retry also failed. First: ${firstResult.error.slice(0, 200)}, Retry: ${retryResult.error.slice(0, 200)}`);
      return { ...firstResult, retryAttempted: true, retryError: retryResult.error };
    }

    cleanupFiles();
    return firstResult;
  });
}

// ─ Vite Config ───────────────────────────────────────────────────

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // POST /api/ai/generate — generate schema with session continuity
          if (req.method === 'POST' && req.url === '/api/ai/generate') {
            const reqTs = new Date().toISOString();
            console.log(`\n[AI-${reqTs}] ═══ API Request Received ═══`);

            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body);
                const { prompt, currentSchema, currentData, sessionId, images, componentCatalog } = parsed;

                console.log(`[AI-${reqTs}] Prompt: ${prompt.slice(0, 200)}${prompt.length > 200 ? '...' : ''}`);
                console.log(`[AI-${reqTs}] Current Schema: ${currentSchema ? currentSchema.length + ' chars' : '(none)'}`);
                console.log(`[AI-${reqTs}] Current Data: ${currentData ? currentData.length + ' chars' : '(none)'}`);
                console.log(`[AI-${reqTs}] Session: ${sessionId || '(new)'}, Images: ${(images || []).length}, Catalog: ${(componentCatalog || []).length} items`);

                if (!prompt) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'prompt is required' }));
                  return;
                }

                const startMs = Date.now();
                const result = await callClaude(
                  sessionId || 'default',
                  prompt,
                  currentSchema || '',
                  currentData || '',
                  images || [],
                  componentCatalog || [],
                );
                const elapsed = Date.now() - startMs;

                console.log(`\n[AI-${new Date().toISOString()}] ═══ API Response (${elapsed}ms) ═══`);
                console.log(`[AI Response] ok: ${result.ok}, error: ${result.error ? result.error.slice(0, 200) : '(none)'}`);
                if (result.ok) {
                  console.log(`[AI Response] schema: ${result.schema ? result.schema.length : 0} chars, data: ${result.data ? result.data.length : 0} chars`);
                }
                console.log(`[AI-${new Date().toISOString()}] ═══ End ═══\n`);

                // Return sessionId so frontend can continue the conversation
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ...result, sessionId: sessionId || 'default' }));
              } catch (err) {
                console.error(`[AI-${new Date().toISOString()}] API error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: err instanceof Error ? err.message : 'Unknown error',
                }));
              }
            });
            return;
          }

          // GET /api/page?dataType=xxx&dataId=xxx — load schema + data from JSON files
          if (req.method === 'GET' && req.url && req.url.startsWith('/api/page')) {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const dataType = urlObj.searchParams.get('dataType');
            const dataId = urlObj.searchParams.get('dataId');

            if (!dataType || !dataId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'dataType and dataId are required' }));
              return;
            }

            // Read files dynamically from public/api/
            const apiDir = path.resolve(__dirname, 'public', 'api');
            const schemaFile = path.join(apiDir, `${dataType}-schema.json`);
            const dataFile = path.join(apiDir, `${dataId}-data.json`);

            try {
              // Schema file — read fresh every request (no caching)
              if (!fs.existsSync(schemaFile)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Schema not found: ${dataType}-schema.json` }));
                return;
              }
              const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'));

              // Data file — read fresh every request (no caching)
              let data = {};
              if (fs.existsSync(dataFile)) {
                data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
              }

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              });
              res.end(JSON.stringify({ schema, data }));
            } catch (err) {
              console.error(`[API] Error loading page: ${err.message}`);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          return next();
        });
      },
    },
  ],
  css: {
    lightningcss: {
      errorRecovery: true,
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
