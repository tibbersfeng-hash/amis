/**
 * Test: parseClaudeOutput + assembleSchema logic from vite.config.js
 * Run: node tests/parse-test.js
 */

// ─── Inline the logic from vite.config.js ─────────────────────────

const FIELD_TEMPLATES = {
  'input-text': {
    template: { type: 'input-text', name: '${name}', label: '${label}', placeholder: '${placeholder}', required: false, clearable: true, size: 'md' },
    description: '单行文本输入框',
  },
  'textarea': {
    template: { type: 'textarea', name: '${name}', label: '${label}', placeholder: '${placeholder}', required: false, rows: 3, maxLength: 500 },
    description: '多行文本输入',
  },
  'input-number': {
    template: { type: 'input-number', name: '${name}', label: '${label}', placeholder: '${placeholder}', required: false, min: 0, precision: 0, size: 'md' },
    description: '数字输入框',
  },
  'select': {
    template: { type: 'select', name: '${name}', label: '${label}', placeholder: '${placeholder}', required: false, clearable: true, searchable: true, size: 'md', options: '${options}' },
    description: '下拉选择框',
  },
  'radios': {
    template: { type: 'radios', name: '${name}', label: '${label}', required: false, options: '${options}' },
    description: '单选按钮组',
  },
  'checkboxes': {
    template: { type: 'checkboxes', name: '${name}', label: '${label}', options: '${options}' },
    description: '复选框组',
  },
  'switch': {
    template: { type: 'switch', name: '${name}', label: '${label}', option: ['${option_true}', '${option_false}'] },
    description: '开关控件',
  },
  'input-date': {
    template: { type: 'input-date', name: '${name}', label: '${label}', required: false, format: 'YYYY-MM-DD', inputFormat: 'YYYY-MM-DD', clearable: true },
    description: '日期选择器',
  },
  'input-datetime': {
    template: { type: 'input-datetime', name: '${name}', label: '${label}', required: false, format: 'YYYY-MM-DD HH:mm:ss', inputFormat: 'YYYY-MM-DD HH:mm:ss', timeFormat: 'HH:mm:ss', clearable: true },
    description: '日期时间选择器',
  },
  'input-date-range': {
    template: { type: 'input-date-range', name: '${name}', label: '${label}', required: false, format: 'YYYY-MM-DD', inputFormat: 'YYYY-MM-DD', clearable: true },
    description: '日期范围选择器',
  },
  'input-image': {
    template: { type: 'input-image', name: '${name}', label: '${label}', multiple: false },
    description: '图片上传',
  },
  'input-color': {
    template: { type: 'input-color', name: '${name}', label: '${label}', placeholder: '${placeholder}' },
    description: '颜色选择器',
  },
  'cascader': {
    template: { type: 'cascader', name: '${name}', label: '${label}', placeholder: '${placeholder}', required: false, options: '${options}' },
    description: '级联选择器',
  },
  'transfer': {
    template: { type: 'transfer', name: '${name}', label: '${label}', required: false, options: '${options}', searchable: true },
    description: '穿梭框',
  },
  'editor': {
    template: { type: 'editor', name: '${name}', label: '${label}', language: '${language}', size: '${size}' },
    description: '代码编辑器',
  },
  'tpl': {
    template: { type: 'tpl', tpl: '<div class="section-title-sm">${content}</div>', inline: false },
    description: '模板文本',
  },
  'divider': {
    template: { type: 'divider', lineStyle: { color: '#E8E8E8' } },
    description: '分隔线',
  },
  'group': {
    template: { type: 'group', body: '${fields}' },
    description: '表单项组',
  },
  'wrapper': {
    template: { type: 'wrapper', className: '${className}', body: '${body}' },
    description: '包装器',
  },
};

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

function buildField(intent) {
  const t = FIELD_TEMPLATES[intent.type];
  if (!t) return null;
  const filled = fillTemplate(t.template, intent.props || {});
  // Merge intent props to override template defaults (e.g. required: true, options array)
  return { ...filled, ...(intent.props || {}) };
}

function assembleSchema(intent) {
  const { pageType, pageTitle, className, api, filterTitle, fields, crudColumns, searchFields } = intent;

  let page;
  if (pageType === 'crudPage') {
    page = {
      type: 'page',
      title: pageTitle || '页面标题',
      body: [{
        type: 'crud', mode: 'table', syncLocation: false,
        api: api || '/api/data',
        filter: {
          title: filterTitle || '查询条件', mode: 'normal', wrapWithPanel: true,
          className: 'search-form', body: [],
          actions: [
            { type: 'submit', label: '查询', level: 'primary', className: 'btn-search' },
            { type: 'reset', label: '重置', className: 'btn-clear' },
          ],
        },
        columns: [], headerToolbar: [], perPage: 10, perPageAvailable: [10, 20, 50],
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
        type: 'form', wrapWithPanel: false, mode: 'horizontal', data: {}, body: [],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      }],
    };
  }

  const formBody = (fields || []).map(f => buildField(f)).filter(Boolean);

  function setFormBody(node) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(setFormBody);
    const obj = node;
    if (obj.type === 'form' && obj.filter === undefined) { obj.body = formBody; return true; }
    return Object.values(obj).some(setFormBody);
  }
  if (formBody.length > 0 && pageType !== 'crudPage') setFormBody(page);

  if (pageType === 'crudPage' && searchFields && searchFields.length > 0) {
    const searchBody = searchFields.map(f => buildField(f)).filter(Boolean);
    function setSearchBody(node) {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) return node.some(setSearchBody);
      if (node.type === 'crud' && node.filter) { node.filter.body = searchBody; return true; }
      return Object.values(node).some(setSearchBody);
    }
    setSearchBody(page);
  }

  if (pageType === 'crudPage' && crudColumns && crudColumns.length > 0) {
    function setColumns(node) {
      if (!node || typeof node !== 'object') return false;
      if (Array.isArray(node)) return node.some(setColumns);
      if (node.type === 'crud') { node.columns = crudColumns.map(c => ({ name: c.name, label: c.label, type: c.type || 'text' })); return true; }
      return Object.values(node).some(setColumns);
    }
    setColumns(page);
  }

  const data = generateSampleData(page);
  return { schema: JSON.stringify(page, null, 2), data: JSON.stringify(data, null, 2) };
}

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

function parseClaudeOutput(output) {
  try {
    const intentMatch = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (intentMatch) {
      const candidate = intentMatch[1].trim();
      const parsed = JSON.parse(candidate);
      if (parsed.pageType && Array.isArray(parsed.fields)) {
        const result = assembleSchema(parsed);
        return { schema: result.schema, data: result.data };
      }
      // CRUD intent with searchFields but no fields array
      if (parsed.pageType === 'crudPage' && (parsed.searchFields || parsed.crudColumns)) {
        const result = assembleSchema({ ...parsed, fields: parsed.fields || [] });
        return { schema: result.schema, data: result.data };
      }
    }
  } catch { /* not intent JSON, continue */ }

  const schemaMarkerMatch = output.match(/\/\/ SCHEMA_START\s*\n([\s\S]*?)\n\s*\/\/ SCHEMA_END/);
  const dataMarkerMatch = output.match(/\/\/ DATA_START\s*\n([\s\S]*?)\n\s*\/\/ DATA_END/);
  if (schemaMarkerMatch || dataMarkerMatch) {
    return {
      schema: schemaMarkerMatch ? schemaMarkerMatch[1].trim() : null,
      data: dataMarkerMatch ? dataMarkerMatch[1].trim() : null,
    };
  }

  const codeBlocks = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/g);
  if (codeBlocks && codeBlocks.length >= 1) {
    const cleanBlock = (block) => block.replace(/^```(?:json)?\s*\n/, '').replace(/\n```$/, '').trim();
    const first = cleanBlock(codeBlocks[0]);
    const second = codeBlocks.length >= 2 ? cleanBlock(codeBlocks[1]) : null;
    try {
      JSON.parse(first);
      if (second) JSON.parse(second);
      return { schema: first, data: second };
    } catch { /* continue */ }
  }

  const jsonObjects = [];
  const lines = output.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '{') {
      let depth = 1; let json = '{';
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        json += '\n' + lines[j];
        for (const ch of lines[j]) {
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

  const preview = output.slice(0, 300).replace(/\n/g, '\\n');
  return { schema: null, data: null, error: `无法解析 Claude 输出。原始输出前300字符: ${preview}` };
}

// ─── TEST CASES ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.log(`  ✗ FAIL: ${msg}`); }
}

function testCase(name, fn) {
  console.log(`\n📋 ${name}`);
  try { fn(); } catch (err) { failed++; console.log(`  ✗ ERROR: ${err.message}`); }
}

// ── Strategy 0: Intent JSON parsing + assembleSchema ──

testCase('Strategy 0: Parse intent JSON and assemble formPage schema', () => {
  const llmOutput = `好的，这是您的意图：
\`\`\`json
{
  "pageType": "formPage",
  "pageTitle": "酒店信息管理",
  "fields": [
    { "type": "input-text", "props": { "name": "hotelName", "label": "酒店名称", "required": true, "placeholder": "请输入酒店名称" }},
    { "type": "input-text", "props": { "name": "hotelCode", "label": "酒店代码", "required": true, "placeholder": "请输入酒店代码" }},
    { "type": "select", "props": { "name": "hotelType", "label": "酒店类型", "options": [{"label":"商务","value":"business"},{"label":"度假","value":"resort"}] }},
    { "type": "input-date", "props": { "name": "openDate", "label": "开业日期" }}
  ]
}
\`\`\`
`;

  const result = parseClaudeOutput(llmOutput);
  assert(!result.error, `No error: ${result.error || 'ok'}`);
  assert(!!result.schema, 'Schema is returned');
  assert(!!result.data, 'Data is returned');

  const schema = JSON.parse(result.schema);
  assert(schema.type === 'page', 'Root type is "page"');
  assert(schema.title === '酒店信息管理', 'Title is correct');
  assert(Array.isArray(schema.body), 'Body is array');
  assert(schema.body[0].type === 'form', 'Contains form');
  assert(schema.body[0].body.length === 4, 'Form has 4 fields');

  // Verify field templates were properly filled
  const [f1, f2, f3, f4] = schema.body[0].body;
  assert(f1.type === 'input-text' && f1.name === 'hotelName' && f1.label === '酒店名称', 'input-text field filled correctly');
  assert(f1.required === true && f1.placeholder === '请输入酒店名称', 'input-text required + placeholder');
  assert(f2.type === 'input-text' && f2.name === 'hotelCode', 'Second input-text');
  assert(f3.type === 'select' && f3.name === 'hotelType', 'Select field');
  assert(Array.isArray(f3.options) && f3.options.length === 2, 'Select options populated');
  assert(f3.options[0].label === '商务' && f3.options[0].value === 'business', 'Option label/value correct');
  assert(f4.type === 'input-date' && f4.name === 'openDate', 'Date field');

  // Verify sample data
  const data = JSON.parse(result.data);
  assert(data.hotelName === '示例文本', 'Data: hotelName default');
  assert(data.hotelCode === 'CODE-001', 'Data: hotelCode smart default');
  assert(data.hotelType === 'business', 'Data: select first option');
  assert(data.openDate === '2026-06-01', 'Data: date default');
});

testCase('Strategy 0: Assemble CRUD page with searchFields + columns', () => {
  const llmOutput = `\`\`\`json
{
  "pageType": "crudPage",
  "pageTitle": "酒店列表",
  "api": "/api/hotels",
  "filterTitle": "检索条件",
  "searchFields": [
    { "type": "input-text", "props": { "name": "hotelName", "label": "酒店名称", "placeholder": "请输入" }},
    { "type": "input-text", "props": { "name": "hotelCode", "label": "酒店代码", "placeholder": "请输入" }}
  ],
  "crudColumns": [
    { "name": "hotelName", "label": "酒店名称", "type": "text" },
    { "name": "hotelCode", "label": "酒店代码", "type": "text" },
    { "name": "hotelType", "label": "类型", "type": "text" }
  ]
}
\`\`\``;

  const result = parseClaudeOutput(llmOutput);
  assert(!result.error, `No error: ${result.error || 'ok'}`);

  const schema = JSON.parse(result.schema);
  assert(schema.type === 'page', 'Root is page');
  assert(schema.body[0].type === 'crud', 'Contains CRUD');

  const crud = schema.body[0];
  assert(crud.api === '/api/hotels', 'API endpoint');
  assert(crud.filter.title === '检索条件', 'Filter title');
  assert(crud.filter.body.length === 2, 'Filter has 2 search fields');
  assert(crud.filter.body[0].type === 'input-text' && crud.filter.body[0].name === 'hotelName', 'Search field 1');
  assert(crud.columns.length === 3, 'CRUD has 3 columns');
  assert(crud.columns[0].name === 'hotelName' && crud.columns[0].label === '酒店名称', 'Column 1 correct');
});

testCase('Strategy 0: Assemble pageWithHeader', () => {
  const llmOutput = `\`\`\`json
{
  "pageType": "pageWithHeader",
  "pageTitle": "Mission Setup",
  "fields": [
    { "type": "textarea", "props": { "name": "desc", "label": "描述", "placeholder": "输入描述" }},
    { "type": "switch", "props": { "name": "enabled", "label": "启用" }}
  ]
}
\`\`\``;

  const result = parseClaudeOutput(llmOutput);
  assert(!result.error, `No error: ${result.error || 'ok'}`);

  const schema = JSON.parse(result.schema);
  assert(schema.title === 'Mission Setup', 'Title correct');

  // pageWithHeader has wrapper header + form
  const formNode = schema.body.find(n => n.type === 'form');
  assert(formNode, 'Form exists in body');
  assert(formNode.body.length === 2, 'Form has 2 fields');
  assert(formNode.body[0].type === 'textarea' && formNode.body[0].name === 'desc', 'Textarea field');
  assert(formNode.body[0].placeholder === '输入描述' && formNode.body[0].rows === 3, 'Textarea props filled');
  assert(formNode.body[1].type === 'switch' && formNode.body[1].name === 'enabled', 'Switch field');

  // Sample data
  const data = JSON.parse(result.data);
  assert(data.desc === '示例描述文本', 'Data: textarea smart default');
  assert(data.enabled === false, 'Data: switch default');
});

testCase('Strategy 0: Unknown component type returns null field', () => {
  const llmOutput = `\`\`\`json
{
  "pageType": "formPage",
  "pageTitle": "Test",
  "fields": [
    { "type": "unknown-component", "props": { "name": "x", "label": "X" }},
    { "type": "input-text", "props": { "name": "name", "label": "Name" }}
  ]
}
\`\`\``;

  const result = parseClaudeOutput(llmOutput);
  assert(!result.error, `No error: ${result.error || 'ok'}`);
  const schema = JSON.parse(result.schema);
  const form = schema.body.find(n => n.type === 'form');
  assert(form.body.length === 1, 'Unknown component filtered out, only valid field remains');
});

// ── Strategy 1: SCHEMA_START/DATA_START markers (backward compat) ──

testCase('Strategy 1: SCHEMA_START/DATA_END markers', () => {
  const output = `Here is the result:
// SCHEMA_START
{"type":"page","title":"Test","body":{"type":"form"}}
// SCHEMA_END

// DATA_START
{"name":"test"}
// DATA_END
`;

  const result = parseClaudeOutput(output);
  assert(!result.error, `No error`);
  assert(result.schema === '{"type":"page","title":"Test","body":{"type":"form"}}', 'Schema extracted');
  assert(result.data === '{"name":"test"}', 'Data extracted');
});

// ── Strategy 2: Markdown code blocks (backward compat) ──

testCase('Strategy 2: Markdown code blocks — schema + data', () => {
  const output = `Here are the schemas:

\`\`\`json
{"type":"page","title":"Form","body":{"type":"form","body":[]}}
\`\`\`

And the data:

\`\`\`json
{"title":"Sample Form"}
\`\`\`
`;

  const result = parseClaudeOutput(output);
  assert(!result.error, `No error`);
  assert(result.schema.includes('"type":"page"'), 'Schema from first code block');
  assert(result.data.includes('"title":"Sample Form"'), 'Data from second code block');
});

// ── Strategy 3: Brace matching (backward compat) ──

testCase('Strategy 3: Brace matching for raw JSON', () => {
  const output = `I've built this:
{
  "type": "page",
  "title": "Raw",
  "body": []
}
Hope this helps!
`;

  const result = parseClaudeOutput(output);
  assert(!result.error, `No error`);
  assert(result.schema.includes('"type"'), 'Schema extracted via brace matching');
});

// ── fillTemplate edge cases ──

testCase('fillTemplate: handles ${options} JSON parsing', () => {
  const template = { type: 'select', options: '${options}', name: '${name}' };
  const props = {
    name: 'myField',
    options: JSON.stringify([{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]),
  };
  const filled = fillTemplate(template, props);
  assert(filled.name === 'myField', 'Simple placeholder replaced');
  assert(Array.isArray(filled.options), 'Options JSON parsed into array');
  assert(filled.options.length === 2, 'Options array has 2 items');
  assert(filled.options[0].label === 'A', 'Option label correct');
});

testCase('fillTemplate: handles ${options} that is already an array', () => {
  const template = { type: 'radios', options: '${options}' };
  const props = { options: [{ label: 'X', value: 'x' }] };
  const filled = fillTemplate(template, props);
  assert(Array.isArray(filled.options), 'Array preserved through fillTemplate');
});

// ── generateSampleData: smart defaults ──

testCase('generateSampleData: email field smart default', () => {
  const schema = {
    type: 'page',
    body: [{
      type: 'form',
      body: [{ type: 'input-text', name: 'userEmail' }],
    }],
  };
  const data = generateSampleData(schema);
  assert(data.userEmail === 'demo@example.com', 'Email smart default');
});

testCase('generateSampleData: number field with amount in name', () => {
  const schema = {
    type: 'page',
    body: [{
      type: 'form',
      body: [{ type: 'input-number', name: 'totalAmount' }],
    }],
  };
  const data = generateSampleData(schema);
  assert(data.totalAmount === 1000, 'Amount number defaults to 1000');
});

testCase('generateSampleData: datetime field', () => {
  const schema = {
    type: 'page',
    body: [{
      type: 'form',
      body: [{ type: 'input-datetime', name: 'startTime' }],
    }],
  };
  const data = generateSampleData(schema);
  assert(data.startTime === '2026-06-01 10:00:00', 'Datetime default');
});

testCase('generateSampleData: nested dot-notation fields', () => {
  const schema = {
    type: 'page',
    body: [{
      type: 'form',
      body: [
        { type: 'group', body: [{ type: 'input-text', name: 'hotelName' }, { type: 'input-text', name: 'hotelCode' }] },
      ],
    }],
  };
  const data = generateSampleData(schema);
  assert(data.hotelName === '示例文本', 'Nested: hotelName accessible');
  assert(data.hotelCode === 'CODE-001', 'Nested: hotelCode accessible');
});

// ── Error case ──

testCase('parseClaudeOutput: unrecognized output returns error', () => {
  const output = `Hello! I'm Claude. How can I help you today?`;
  const result = parseClaudeOutput(output);
  assert(result.error, 'Returns error for non-JSON output');
  assert(result.schema === null, 'Schema is null');
});

// ── Summary ──

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) {
  console.log(`⚠️  SOME TESTS FAILED`);
  process.exit(1);
} else {
  console.log(`✅ ALL TESTS PASSED`);
}
