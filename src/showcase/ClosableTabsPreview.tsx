import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';
import { JsonEditorPreview } from './JsonEditor';

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'form',
  wrapWithPanel: false,
  body: [
    { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [
      { label: 'Room Stay Prepaid Booking', value: 'ROOM_STAY_PREPAID' },
      { label: 'Direct Booking', value: 'Direct Booking' },
      { label: 'Group Booking', value: 'Group Booking' },
    ]},
    { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [
      { label: 'BU1', value: 'BU1' },
      { label: 'BU2', value: 'BU2' },
      { label: 'BU3', value: 'BU3' },
    ]},
    { type: 'input-text', name: 'targetSpending', label: 'Target Spending' },
    { type: 'select', name: 'currency', label: 'Currency', options: [
      { label: '积分', value: '积分' },
      { label: '钻石', value: '钻石' },
      { label: '金币', value: '金币' },
    ]},
    { type: 'select', name: 'paymentMethod', label: 'Payment Method', options: [
      { label: 'Credit Card', value: 'Credit Card' },
      { label: 'Cash', value: 'Cash' },
    ]},
    { type: 'input-text', name: 'awardPoints', label: 'Award Points' },
    { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
  ],
  actions: [{ type: 'submit', label: '提交', level: 'primary' }],
}, null, 2);

const DEFAULT_DATA = JSON.stringify({
  tabs: [
    {
      title: 'Sub Mission 1',
      subMissionType: 'Room Stay Prepaid Booking',
      businessUnit: 'BU1',
      targetSpending: '',
      currency: '积分',
      paymentMethod: 'Credit Card',
      awardPoints: '',
      transactionNote: '',
    },
    {
      title: 'Sub Mission 2',
      subMissionType: 'Direct Booking',
      businessUnit: 'BU2',
      targetSpending: '500',
      currency: '钻石',
      paymentMethod: 'Cash',
      awardPoints: '100',
      transactionNote: 'Test note',
    },
  ],
}, null, 2);

type EditorTab = 'schema' | 'data';

export interface ClosableTabsPreviewRef {
  getData: () => Record<string, unknown>;
  setData: (data: Record<string, unknown>) => void;
}

/**
 * Build Amis tabs schema from form schema (template) + tab data (values).
 * Schema defines the form body; data defines the tabs array with titles and initial values.
 */
function buildTabsSchema(
  formSchema: Record<string, unknown>,
  tabsData: Record<string, unknown>[]
): Record<string, unknown> {
  const formBody = (formSchema as Record<string, unknown>).body || [];
  const formActions = (formSchema as Record<string, unknown>).actions || [];

  const tabs = tabsData.map((tabData, i) => {
    const title = tabData.title || `Sub Mission ${i + 1}`;
    const { title: _, ...values } = tabData as Record<string, unknown>;
    return {
      title,
      closable: true,
      body: {
        type: 'form',
        wrapWithPanel: false,
        data: values,
        body: formBody,
        actions: formActions,
      },
    };
  });

  return {
    type: 'tabs',
    className: 'custom-closable-tabs',
    tabs,
  };
}

export const ClosableTabsPreview = forwardRef<ClosableTabsPreviewRef, {}>((_props, ref) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [parsedSchema, setParsedSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [tabsData, setTabsData] = useState<Record<string, unknown>[]>(() => JSON.parse(DEFAULT_DATA).tabs);
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);

  // Build Amis schema whenever parsedSchema or tabsData changes
  const amisSchema = buildTabsSchema(parsedSchema, tabsData);

  // Sync data from AmisLivePreview → Data JSON
  const handleDataChange = useCallback((merged: Record<string, unknown>) => {
    const updated = tabsData.map((tab, i) => {
      const { title, ...rest } = tab;
      const changes: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(merged)) {
        changes[key] = val;
      }
      return { title, ...rest, ...changes };
    });
    if (updated.length > 0) {
      setTabsData(updated);
      setDataJson(JSON.stringify({ tabs: updated }, null, 2));
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
        setDataJson(JSON.stringify({ tabs: data.tabs }, null, 2));
      }
      if (data.schema && typeof data.schema === 'object') {
        setParsedSchema(data.schema as Record<string, unknown>);
        setSchemaJson(JSON.stringify(data.schema, null, 2));
      }
      setRenderKey((k) => k + 1);
    },
  }), [tabsData, parsedSchema]);

  const handleRender = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaJson);
      setParsedSchema(parsed);
    } catch (e: unknown) {
      // error handled by JsonEditorPreview
      return;
    }

    try {
      const parsed = JSON.parse(dataJson);
      setTabsData(parsed.tabs || []);
    } catch (e: unknown) {
      // error handled by JsonEditorPreview
      return;
    }

    setRenderKey((k) => k + 1);
  }, [schemaJson, dataJson]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Form Schema JSON' : 'Tabs Data JSON';

  return (
    <div className="closable-tabs-preview-editor">
      {/* Editor Tabs */}
      <div className="schema-preview-editor-tabs">
        <button
          className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Form Schema JSON
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
