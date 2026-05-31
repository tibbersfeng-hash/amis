import React, { forwardRef, useRef, useState, useCallback, useImperativeHandle, useEffect } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'page',
  body: {
    type: 'tabs',
    tabsMode: 'line',
    mountOnEnter: false,
    className: 'custom-underline-tabs',
    tabs: [
      {
        title: 'Mission Rule',
        body: {
          type: 'tabs',
          mountOnEnter: false,
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  missionRule: { ruleSetup: { missionName: '每日签到', missionCode: 'DAILY_CHECKIN' } },
                },
                body: [
                  { type: 'input-text', name: 'missionRule.ruleSetup.missionName', label: 'Mission Name' },
                  { type: 'input-text', name: 'missionRule.ruleSetup.missionCode', label: 'Mission Code' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  missionRule: { display: { missionDesc: '完成每日签到可获得积分奖励', missionImage: 'https://cdn.example.com/images/daily-checkin.png' } },
                },
                body: [
                  { type: 'input-text', name: 'missionRule.display.missionDesc', label: 'Mission Description' },
                  { type: 'input-text', name: 'missionRule.display.missionImage', label: 'Mission Image URL' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Registration Rule',
        body: {
          type: 'tabs',
          mountOnEnter: false,
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  registrationRule: { ruleSetup: { registerKeyWord: '签到', limitionKeyWord: '每日限1次' } },
                },
                body: [
                  { type: 'input-text', name: 'registrationRule.ruleSetup.registerKeyWord', label: 'Registration Key Word' },
                  { type: 'input-text', name: 'registrationRule.ruleSetup.limitionKeyWord', label: 'Limitation Key Word' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  registrationRule: { display: { registerSuccessMsg: '签到成功，获得积分', registerFailMsg: '今日已签到，请勿重复' } },
                },
                body: [
                  { type: 'input-text', name: 'registrationRule.display.registerSuccessMsg', label: 'Registration Success Message' },
                  { type: 'input-text', name: 'registrationRule.display.registerFailMsg', label: 'Registration Failure Message' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Sub Mission Rule',
        body: {
          type: 'combo',
          name: 'subMissions',
          label: false,
          multiple: true,
          addable: true,
          removable: true,
          tabsMode: false,
          items: [
            { type: 'input-text', name: 'subMissionName', label: 'Sub Mission Name' },
            { type: 'input-text', name: 'currency', label: 'Currency' },
            { type: 'input-text', name: 'awardName', label: 'Award name' },
            { type: 'input-text', name: 'ctaText', label: 'cta Text' },
            { type: 'input-text', name: 'ctaLink', label: 'cta Link' },
          ],
          value: [
            { subMissionName: '连续签到7天', currency: '积分', awardName: '宝箱钥匙', ctaText: '立即签到', ctaLink: '/mission/daily-checkin' },
            { subMissionName: '连续签到30天', currency: '钻石', awardName: '限定头像框', ctaText: '查看详情', ctaLink: '/mission/monthly-checkin' },
          ],
        },
      },
    ],
  },
}, null, 2);

const DEFAULT_DATA = JSON.stringify({
  missionRule: {
    ruleSetup: {
      missionName: '每日签到',
      missionCode: 'DAILY_CHECKIN',
    },
    display: {
      missionDesc: '完成每日签到可获得积分奖励',
      missionImage: 'https://cdn.example.com/images/daily-checkin.png',
    },
  },
  registrationRule: {
    ruleSetup: {
      registerKeyWord: '签到',
      limitionKeyWord: '每日限1次',
    },
    display: {
      registerSuccessMsg: '签到成功，获得积分',
      registerFailMsg: '今日已签到，请勿重复',
    },
  },
  subMissions: [
    { subMissionName: '连续签到7天', currency: '积分', awardName: '宝箱钥匙', ctaText: '立即签到', ctaLink: '/mission/daily-checkin' },
    { subMissionName: '连续签到30天', currency: '钻石', awardName: '限定头像框', ctaText: '查看详情', ctaLink: '/mission/monthly-checkin' },
  ],
}, null, 2);

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
 * Walk the schema and update form.data / combo value.
 * form.data receives the top-level nested keys (missionRule, registrationRule, subMissions).
 * Amis handles the dot-notation name mapping internally.
 */
function injectFormData(schema: Record<string, unknown>, data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...schema };
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

type EditorTab = 'schema' | 'data';

export const SchemaPreview = forwardRef<SchemaPreviewRef, {}>((_props, ref) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [data, setData] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_DATA));
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRender = useCallback(() => {
    try {
      const parsedSchema = JSON.parse(schemaJson);
      setSchema(parsedSchema);
      setError(null);
    } catch (e: unknown) {
      setError(`Schema: ${(e as Error).message}`);
      return;
    }

    try {
      const parsedData = JSON.parse(dataJson);
      setData(parsedData);
    } catch (e: unknown) {
      setError(`Data: ${(e as Error).message}`);
      return;
    }

    setRenderKey(k => k + 1);
  }, [schemaJson, dataJson]);

  const handleSyncData = useCallback(() => {
    previewRef.current?.syncData();
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
      const newDataJson = JSON.stringify(newData, null, 2);
      const updatedSchema = injectFormData(schema, newData);
      setDataJson(newDataJson);
      setData(newData);
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
        const newDataJson = JSON.stringify(newData, null, 2);
        const updatedSchema = injectFormData(schema, newData);
        setDataJson(newDataJson);
        setData(newData);
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
    </div>
  );
});

SchemaPreview.displayName = 'SchemaPreview';

export default SchemaPreview;
