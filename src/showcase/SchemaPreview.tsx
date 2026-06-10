import React, { forwardRef, useRef, useState, useCallback, useImperativeHandle, useEffect } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';
import { AIGeneratorDrawer, type AIGeneratorResult } from './AIGeneratorDrawer';
import { getComponentCatalog } from './data';

// Register custom Amis renderers
import '../components/PhoneMockup';
import '../components/DateRangePicker';
import '../components/FieldWithExclude';
// Import ClosableTabs to register the closable-tab renderer
import ClosableTabs from '@/components/ClosableTabs';

// Force the module to be evaluated (prevents tree-shaking)
const _closableTabs = ClosableTabs;

const DEFAULT_SCHEMA = '{}';
const DEFAULT_DATA = '{}';

export interface SchemaPreviewRef {
  /** Read current form values from DOM and update Data JSON */
  getData: () => Promise<Record<string, unknown>>;
  /** Programmatically set form data and update Data JSON */
  setData: (data: Record<string, unknown>) => void;
}

/**
 * Set a nested value on an object by dot-separated path.
 * e.g. setByPath(obj, 'a.b.c', 'x') → { a: { b: { c: 'x' } } }
 */
function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in target) || typeof target[part] !== 'object' || Array.isArray(target[part])) {
      target[part] = {};
    }
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = value;
}

/**
 * Convert dot-notation keys to nested objects.
 * e.g. { 'a.b.c': 'x', a: 1 } → { a: { b: { c: 'x' } } }
 * Non-dot keys are set directly. If a key would overwrite a nested object path,
 * the dot-notation value takes precedence.
 */
function dotToNested(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  // First pass: set non-dot keys
  for (const [k, v] of Object.entries(obj)) {
    if (!k.includes('.')) {
      result[k] = v;
    }
  }
  // Second pass: set dot-notation keys as nested paths
  for (const [k, v] of Object.entries(obj)) {
    if (k.includes('.')) {
      setByPath(result, k, v);
    }
  }
  return result;
}

/**
 * Walk the schema and update form.data / combo value.
 * form.data receives the top-level nested keys (missionRule, registrationRule, subMissions).
 * Amis handles the dot-notation name mapping internally.
 */
function injectFormData(schema: Record<string, unknown>, data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...schema };

  // If this is a form without a data property, create one from the provided data.
  // Amis uses form.data as the initial values for fields.
  if (result.type === 'form' && !('data' in result)) {
    result.data = { ...data };
  }

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (key === 'data' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Merge top-level data keys into form.data for Amis dot-notation mapping
      const merged = { ...(value as Record<string, unknown>) };
      for (const [k, v] of Object.entries(data)) {
        merged[k] = v;
      }
      result[key] = merged;
    } else if (key === 'value' && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && result.type === 'combo') {
      // Combo value: replace with data[name] if available, otherwise keep original
      const comboName = result.name as string | undefined;
      if (comboName && Array.isArray(data[comboName])) {
        result[key] = data[comboName];
      }
      // If no matching data, keep original value (don't merge unrelated keys)
    } else if (key === 'body' && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? injectFormData(item, data) : item
      );
    } else if (key === 'tabs' && Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item !== 'object' || item === null) return item;
        const updated = injectFormData(item as Record<string, unknown>, data);
        if (updated.body && typeof updated.body === 'object' &&
            (updated.body as Record<string, unknown>).type === 'combo' &&
            typeof (updated.body as Record<string, unknown>).name === 'string' &&
            Array.isArray(data[(updated.body as Record<string, unknown>).name as string])) {
          const body = updated.body as Record<string, unknown>;
          body.value = data[(body as Record<string, unknown>).name as string];
        }
        return updated;
      });
    } else if (key === 'items' && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? injectFormData(item, data) : item
      );
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = injectFormData(value as Record<string, unknown>, data);
    }
  }
  return result;
}

/**
 * Extract combo names from schema for DOM-based data reading.
 */
function getComboNames(s: Record<string, unknown>): string[] {
  const names: string[] = [];
  const visited = new WeakSet<object>();
  function walk(obj: Record<string, unknown>) {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
    visited.add(obj);
    if (obj.type === 'combo' && typeof obj.name === 'string') {
      names.push(obj.name);
    }
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) {
        val.forEach(item => { if (typeof item === 'object' && item !== null) walk(item as Record<string, unknown>); });
      } else if (typeof val === 'object' && val !== null) {
        walk(val as Record<string, unknown>);
      }
    }
  }
  walk(s);
  return names;
}

/**
 * Read combo items from a tabsMode combo (.cxd-ComboControl with .cxd-ComboTabs).
 * Clicks through all tabs to ensure all panes are mounted, then reads from .cxd-Combo-itemInner.
 */
async function readTabsModeCombo(comboCtrl: Element, comboKey: string): Promise<Record<string, unknown>[]> {
  const comboTabs = comboCtrl.querySelector('.cxd-ComboTabs');
  if (!comboTabs) return [];
  const tabLinks = comboTabs.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink) a');
  if (tabLinks.length === 0) return [];

  // Click through all tabs to mount all panes
  for (let i = 0; i < tabLinks.length; i++) {
    (tabLinks[i] as HTMLElement).click();
    // Small delay for DOM update
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Read all .cxd-Combo-itemInner elements
  const inners = comboCtrl.querySelectorAll('.cxd-Combo-itemInner');
  const rows: Record<string, unknown>[] = [];
  inners.forEach((inner) => {
    const inputs = inner.querySelectorAll('input[name], textarea[name], select[name]');
    const rowData: Record<string, unknown> = {};
    inputs.forEach((el: Element) => {
      const name = (el as HTMLInputElement).getAttribute('name');
      if (name) {
        const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
        if (value !== undefined) rowData[name] = value;
      }
    });
    if (Object.keys(rowData).length > 0) rows.push(rowData);
  });
  return rows;
}

/**
 * Read DOM inputs and build nested data structure.
 * Dot-notation names like 'missionRule.ruleSetup.missionName' are converted
 * to nested objects: { missionRule: { ruleSetup: { missionName: 'value' } } }
 */
async function readInputs(container: HTMLDivElement, schema: Record<string, unknown>): Promise<Record<string, unknown>> {
  const comboNames = getComboNames(schema);
  const comboResult: Record<string, unknown> = {};
  const comboFieldNames = new Set<string>();

  // Read tabsMode combos (.cxd-ComboControl with .cxd-ComboTabs inside)
  const allComboCtrls = container.querySelectorAll('.cxd-ComboControl');
  const tabsModeCombos: Element[] = [];
  allComboCtrls.forEach(ctrl => {
    if (ctrl.querySelector('.cxd-ComboTabs')) tabsModeCombos.push(ctrl);
  });

  for (let i = 0; i < tabsModeCombos.length; i++) {
    const comboKey = comboNames[i] || `combo_${i}`;
    const rows = await readTabsModeCombo(tabsModeCombos[i], comboKey);
    if (rows.length > 0) {
      comboResult[comboKey] = rows;
      rows.forEach(row => Object.keys(row).forEach(k => comboFieldNames.add(k)));
    }
  }

  // Read classic combos (.cxd-Combo that are NOT inside a tabsMode combo control)
  const classicCombos = container.querySelectorAll('.cxd-Combo');
  classicCombos.forEach((comboEl) => {
    // Skip if inside a tabsMode combo control
    const comboControl = comboEl.closest('.cxd-ComboControl');
    if (comboControl && comboControl.querySelector('.cxd-ComboTabs')) return;
    const idx = tabsModeCombos.length + Array.from(classicCombos).indexOf(comboEl);
    const comboKey = comboNames[idx] || `combo_${idx}`;
    const items = comboEl.querySelectorAll('.cxd-Combo-item');
    const rows: Record<string, unknown>[] = [];
    items.forEach((row) => {
      const inputs = row.querySelectorAll('input[name], textarea[name], select[name]');
      const rowData: Record<string, unknown> = {};
      inputs.forEach((el: Element) => {
        const name = (el as HTMLInputElement).getAttribute('name');
        if (name) {
          comboFieldNames.add(name);
          const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
          if (value !== undefined) rowData[name] = value;
        }
      });
      if (Object.keys(rowData).length > 0) rows.push(rowData);
    });
    if (rows.length > 0) comboResult[comboKey] = rows;
  });

  // Read non-combo inputs, convert dot-names to nested structure
  const nestedData: Record<string, unknown> = {};
  const inputs = container.querySelectorAll('input[name], textarea[name], select[name]');
  inputs.forEach((el: Element) => {
    const name = (el as HTMLInputElement).getAttribute('name');
    if (name && !comboFieldNames.has(name)) {
      const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
      if (value !== undefined) setByPath(nestedData, name, value);
    }
  });

  // Merge combo data
  for (const [key, val] of Object.entries(comboResult)) {
    nestedData[key] = val;
  }

  return nestedData;
}

const LS_KEY_SCHEMA = 'schema-preview-schema';
const LS_KEY_DATA = 'schema-preview-data';
const LS_KEY_TAB = 'schema-preview-tab';

function readLS(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch { /* quota exceeded — silent */ }
}

type EditorTab = 'schema' | 'data';

export const SchemaPreview = forwardRef<SchemaPreviewRef, {}>((_props, ref) => {
  const [activeTab, setActiveTab] = useState<EditorTab>(() => readLS(LS_KEY_TAB, 'schema') as EditorTab);
  const [schemaJson, setSchemaJson] = useState(() => readLS(LS_KEY_SCHEMA, DEFAULT_SCHEMA));
  const [dataJson, setDataJson] = useState(() => readLS(LS_KEY_DATA, DEFAULT_DATA));
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => {
    try { return JSON.parse(readLS(LS_KEY_SCHEMA, DEFAULT_SCHEMA)); } catch { return JSON.parse(DEFAULT_SCHEMA); }
  });
  const [data, setData] = useState<Record<string, unknown>>(() => {
    try { return JSON.parse(readLS(LS_KEY_DATA, DEFAULT_DATA)); } catch { return JSON.parse(DEFAULT_DATA); }
  });
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist schema to localStorage on every change
  useEffect(() => { writeLS(LS_KEY_SCHEMA, schemaJson); }, [schemaJson]);
  useEffect(() => { writeLS(LS_KEY_DATA, dataJson); }, [dataJson]);
  useEffect(() => { writeLS(LS_KEY_TAB, activeTab); }, [activeTab]);

  // AI Generator state
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIDrawerOpen = useCallback(() => {
    setAiDrawerVisible(true);
    setAiError(null);
  }, []);

  const handleAIDrawerClose = useCallback(() => {
    setAiDrawerVisible(false);
  }, []);

  const handleAIApply = useCallback((result: AIGeneratorResult) => {
    if (!result.schema) return;
    let parsedSchema: Record<string, unknown>;
    try {
      parsedSchema = JSON.parse(result.schema);
    } catch (e) {
      setAiError(`Schema JSON 解析失败: ${(e as Error).message}`);
      return;
    }

    if (result.data) {
      let parsedData: Record<string, unknown>;
      try {
        parsedData = JSON.parse(result.data);
      } catch (e) {
        setAiError(`Data JSON 解析失败: ${(e as Error).message}`);
        return;
      }

      // Convert dot-notation keys to nested structure (same as onDataChange does)
      const nestedData = dotToNested(parsedData);

      setSchemaJson(result.schema);
      setDataJson(result.data);
      setData(nestedData);
      const injected = injectFormData(parsedSchema, nestedData);
      setSchema(injected);
      setError(null);
      setRenderKey(k => k + 1);

      // Check for Vite error overlay after hot update
      setTimeout(() => {
        const overlay = document.querySelector('vite-error-overlay');
        if (overlay) {
          const message = overlay.shadowRoot?.querySelector('.message')?.textContent || '编译错误';
          setAiError(`生成成功但存在编译错误: ${message}`);
        }
      }, 1500);
    } else {
      setSchemaJson(result.schema);
      setSchema(parsedSchema);
      setError(null);
      setRenderKey(k => k + 1);
    }
  }, []);

  const handleRender = useCallback(() => {
    let parsedSchema: Record<string, unknown>;
    try {
      parsedSchema = JSON.parse(schemaJson);
    } catch (e: unknown) {
      setError(`Schema: ${(e as Error).message}`);
      return;
    }

    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(dataJson);
    } catch (e: unknown) {
      setError(`Data: ${(e as Error).message}`);
      return;
    }

    setData(parsedData);
    parsedSchema = injectFormData(parsedSchema, parsedData);
    setSchema(parsedSchema);
    setError(null);
    setRenderKey(k => k + 1);
  }, [schemaJson, dataJson]);

  const handleSyncData = useCallback(() => {
    previewRef.current?.syncData();
  }, []);

  const handleClear = useCallback(() => {
    try {
      localStorage.removeItem(LS_KEY_SCHEMA);
      localStorage.removeItem(LS_KEY_DATA);
    } catch { /* ignore */ }
    setSchemaJson(DEFAULT_SCHEMA);
    setDataJson(DEFAULT_DATA);
    setData(JSON.parse(DEFAULT_DATA));
    setSchema(JSON.parse(DEFAULT_SCHEMA));
    setError(null);
    setRenderKey(k => k + 1);
  }, []);

  // Auto-sync: watch for DOM changes (user input + structural changes) and update Data JSON.
  // syncData in AmisLivePreview has a snapshot check to prevent unnecessary re-renders.
  useEffect(() => {
    if (!containerRef.current) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        previewRef.current?.syncData();
      }, 300);
    });
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Expose getData / setData via ref and on window for programmatic access
  useImperativeHandle(ref, () => ({
    getData: async () => {
      if (!containerRef.current) return {};
      const nestedData = await readInputs(containerRef.current, schema);
      previewRef.current?.syncData();
      return nestedData;
    },
    setData: (newData: Record<string, unknown>) => {
      previewRef.current?.resetModifications();
      const normalizedData = dotToNested(newData);
      const newDataJson = JSON.stringify(normalizedData, null, 2);
      const updatedSchema = injectFormData(schema, normalizedData);
      setDataJson(newDataJson);
      setData(normalizedData);
      setSchema(updatedSchema);
      setSchemaJson(JSON.stringify(updatedSchema, null, 2));
      setRenderKey(k => k + 1);
    },
  }), [data]);

  // Expose on window for external programmatic access
  useEffect(() => {
    const api = {
      getData: async () => {
        if (!containerRef.current) return {};
        return readInputs(containerRef.current, schema);
      },
      setData: (newData: Record<string, unknown>) => {
        previewRef.current?.resetModifications();
        const normalizedData = dotToNested(newData);
        const newDataJson = JSON.stringify(normalizedData, null, 2);
        const updatedSchema = injectFormData(schema, normalizedData);
        setDataJson(newDataJson);
        setData(normalizedData);
        setSchema(updatedSchema);
        setSchemaJson(JSON.stringify(updatedSchema, null, 2));
        setRenderKey(k => k + 1);
      },
    };
    (window as any).__schemaPreviewAPI = api;
    return () => { delete (window as any).__schemaPreviewAPI; };
  }, [data, schema]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Amis Schema JSON' : 'Data JSON';

  return (
    <div className="schema-preview-full">
      <div className="schema-preview-section">
        {/* Editor Tabs */}
        <div className="schema-preview-editor-tabs">
          <button
            className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            Amis Schema JSON
          </button>
          <button
            className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data JSON
          </button>
        </div>

        {/* Toolbar */}
        <div className="schema-preview-toolbar">
          <span className="schema-preview-toolbar-title">{activeLabel}</span>
          <div className="schema-preview-toolbar-actions">
            <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
            <button className="schema-preview-sync-btn" onClick={handleSyncData}>
              同步数据
            </button>
            <button className="schema-preview-sync-btn" onClick={handleClear} title="清空本地存储">
              清空
            </button>
            <button
              data-testid="ai-generate-btn"
              style={{
                padding: '6px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba1 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-family)',
              }}
              onClick={handleAIDrawerOpen}
            >
              AI 生成
            </button>
            <button className="schema-preview-render-btn" onClick={handleRender}>
              渲染
            </button>
          </div>
        </div>

        {/* JSON Textarea */}
        <textarea
          className="schema-preview-textarea"
          value={activeJson}
          onChange={e => setJson(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <div className="schema-preview-error">{error}</div>}
      </div>

      {/* Preview */}
      <div className="schema-preview-section schema-preview-preview-section">
        <div className="schema-preview-preview-bar">
          <span>实时预览</span>
        </div>
        <div className="schema-preview-ami-container" ref={containerRef}>
          <AmisLivePreview
            ref={previewRef}
            key={renderKey}
            schema={schema}
            data={data}
            onDataChange={(merged) => {
              // Convert flat dot-notation keys to nested structure
              const nested: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(merged)) {
                if (k.includes('.')) {
                  setByPath(nested, k, v);
                } else {
                  nested[k] = v;
                }
              }
              setDataJson(JSON.stringify(nested, null, 2));
            }}
          />
        </div>
      </div>

      {/* AI Generator Drawer */}
      <AIGeneratorDrawer
        visible={aiDrawerVisible}
        onClose={handleAIDrawerClose}
        onApply={handleAIApply}
        currentSchema={schemaJson}
        currentData={dataJson}
        componentCatalog={getComponentCatalog()}
      />

      {/* AI Error toast */}
      {aiError && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: 'var(--danger)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1001,
            cursor: 'pointer',
            maxWidth: '90vw',
          }}
          onClick={() => setAiError(null)}
        >
          {aiError}
        </div>
      )}
    </div>
  );
});

SchemaPreview.displayName = 'SchemaPreview';

export default SchemaPreview;
