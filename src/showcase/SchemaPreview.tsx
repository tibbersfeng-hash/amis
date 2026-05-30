import React, { useState, useCallback, useEffect } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'form',
  body: [
    { type: 'input-text', name: 'name', label: '姓名', required: true },
    { type: 'input-email', name: 'email', label: '邮箱' },
    { type: 'textarea', name: 'remarks', label: '备注' },
  ],
}, null, 2);

const DEFAULT_DATA = JSON.stringify({
  name: '张三',
  email: 'zhangsan@example.com',
  remarks: '这是备注信息',
}, null, 2);

type EditorTab = 'schema' | 'data';

export const SchemaPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [data, setData] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_DATA));
  const [renderKey, setRenderKey] = useState(0);

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
        <div className="schema-preview-ami-container">
          <AmisLivePreview
            key={renderKey}
            schema={schema}
            data={data}
            onDataChange={(merged) => {
              setDataJson(JSON.stringify(merged, null, 2));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SchemaPreview;
