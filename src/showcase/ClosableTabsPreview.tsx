import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';
import { JsonEditorPreview } from './JsonEditor';

// Register closable-tab renderer
import '../components/ClosableTabs';

/**
 * Complete tabs schema — the authoritative source.
 * The preview extracts the schema_format template and tab titles/data from the tabs array.
 */
const DEFAULT_SCHEMA = JSON.stringify({
  type: 'closable-tab',
  addable: true,
  addBtnText: '+ Add Tab',
  schema_format: [
    {
      type: 'form',
      wrapWithPanel: false,
      data: {},
      body: [
        { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
      ],
      actions: [{ type: 'submit', label: '提交', level: 'primary' }],
    },
  ],
  tabs: [
    {
      title: 'Tab 1',
      closable: true,
      body: {
        type: 'form',
        wrapWithPanel: false,
        data: { name: 'Alice' },
        body: [
          { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
        ],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      },
    },
    {
      title: 'Tab 2',
      closable: true,
      body: {
        type: 'form',
        wrapWithPanel: false,
        data: { name: 'Bob' },
        body: [
          { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
        ],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      },
    },
  ],
}, null, 2);

/** Extract schema_format or fallback to first tab's body. */
function extractSchemaFormat(tabsSchema: Record<string, unknown>): Record<string, unknown>[] {
  // First check for schema_format at root level
  if (Array.isArray((tabsSchema as any).schema_format) && (tabsSchema as any).schema_format.length > 0) {
    return (tabsSchema as any).schema_format;
  }
  // Fallback: extract from first tab's body
  const tabs = (tabsSchema as any).tabs;
  if (!Array.isArray(tabs) || tabs.length === 0) return [{ body: [], actions: [] }];
  const firstBody = tabs[0]?.body;
  if (firstBody?.type === 'form') {
    return [firstBody];
  }
  return [firstBody || {}];
}

/** Extract tab titles + data array from the tabs schema. */
function extractTabsData(tabsSchema: Record<string, unknown>): Record<string, unknown>[] {
  const tabs = (tabsSchema as any).tabs;
  if (!Array.isArray(tabs)) return [];
  return tabs.map((tab: any) => {
    const { title, closable, body, ...rest } = tab;
    const formData = body?.type === 'form' ? (body.data || {}) : {};
    return { title: title || 'Untitled', closable: !!closable, ...formData };
  });
}

/** Build complete tabs schema from schema_format + tabs data + root props. */
function buildCompleteSchema(schemaFormat: Record<string, unknown>[], tabsData: Record<string, unknown>[], rootProps: { addable?: boolean; addBtnText?: string }): Record<string, unknown> {
  const tabs = tabsData.map((tabData, i) => {
    const { title, closable, ...values } = tabData;
    // Deep clone each schema_format item and inject data
    const items = schemaFormat.map(item => {
      const cloned = JSON.parse(JSON.stringify(item));
      if (cloned.type === 'form') {
        cloned.data = values;
        cloned.wrapWithPanel = false;
      }
      return cloned;
    });

    return {
      title: title || `Tab ${i + 1}`,
      closable: closable !== false,
      body: items.length === 1 ? items[0] : { type: 'container', body: items },
    };
  });

  return {
    type: 'closable-tab',
    addable: rootProps.addable !== false,
    addBtnText: rootProps.addBtnText || '+ Add Tab',
    schema_format: schemaFormat.length === 1 ? schemaFormat[0] : { type: 'container', body: schemaFormat },
    tabs,
  };
}

type EditorTab = 'schema' | 'data';

export interface ClosableTabsPreviewRef {
  getData: () => Record<string, unknown>;
  setData: (data: Record<string, unknown>) => void;
}

export const ClosableTabsPreview = forwardRef<ClosableTabsPreviewRef, {}>((_props, ref) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(() => {
    const tabsSchema = JSON.parse(DEFAULT_SCHEMA);
    return JSON.stringify(extractTabsData(tabsSchema), null, 2);
  });
  const [parsedSchema, setParsedSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [tabsData, setTabsData] = useState<Record<string, unknown>[]>(() => extractTabsData(JSON.parse(DEFAULT_SCHEMA)));
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);

  // Extract schema_format from parsed schema
  const schemaFormat = useRef(extractSchemaFormat(parsedSchema));

  // Build Amis schema from schema_format + tabs data + root props
  const amisSchema = buildCompleteSchema(schemaFormat.current, tabsData, {
    addable: parsedSchema.addable,
    addBtnText: parsedSchema.addBtnText as string | undefined,
  });

  // Sync data from AmisLivePreview → Data JSON
  const handleDataChange = useCallback((merged: Record<string, unknown>) => {
    const updated = tabsData.map((tab, i) => {
      const { title, closable, ...rest } = tab;
      return { title, closable, ...rest, ...merged };
    });
    if (updated.length > 0) {
      setTabsData(updated);
      setDataJson(JSON.stringify(updated, null, 2));
    }
  }, [tabsData]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      previewRef.current?.syncData();
      return { schema: parsedSchema, tabs: tabsData };
    },
    setData: (data: Record<string, unknown>) => {
      if (data.tabs && Array.isArray(data.tabs)) {
        setTabsData(data.tabs);
        setDataJson(JSON.stringify(data.tabs, null, 2));
      }
      if (data.schema && typeof data.schema === 'object') {
        setParsedSchema(data.schema as Record<string, unknown>);
        setSchemaJson(JSON.stringify(data.schema, null, 2));
        schemaFormat.current = extractSchemaFormat(data.schema as Record<string, unknown>);
      }
      setRenderKey((k) => k + 1);
    },
  }), [tabsData, parsedSchema]);

  const handleRender = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaJson);
      setParsedSchema(parsed);
      schemaFormat.current = extractSchemaFormat(parsed);
      const extracted = extractTabsData(parsed);
      setTabsData(extracted);
      setDataJson(JSON.stringify(extracted, null, 2));
    } catch (e: unknown) {
      return;
    }

    setRenderKey((k) => k + 1);
  }, [schemaJson]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Tabs Schema JSON' : 'Tabs Data JSON';

  return (
    <div className="closable-tabs-preview-editor">
      {/* Editor Tabs */}
      <div className="schema-preview-editor-tabs">
        <button
          className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Tabs Schema JSON
        </button>
        <button
          className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Tabs Data JSON
        </button>
      </div>

      {/* Toolbar */}
      <div className="schema-preview-toolbar">
        <span className="schema-preview-toolbar-title">{activeLabel}</span>
        <div className="schema-preview-toolbar-actions">
          <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
          <button className="schema-preview-render-btn" onClick={handleRender}>
            渲染
          </button>
        </div>
      </div>

      {/* JSON Textarea */}
      <textarea
        className="schema-preview-textarea"
        value={activeJson}
        onChange={(e) => setJson(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />

      {/* Preview */}
      <div className="closable-tabs-preview-bar">
        <span>实时预览</span>
      </div>
      <AmisLivePreview
        ref={previewRef}
        key={renderKey}
        schema={amisSchema}
        onDataChange={handleDataChange}
      />
    </div>
  );
});

ClosableTabsPreview.displayName = 'ClosableTabsPreview';

export default ClosableTabsPreview;
