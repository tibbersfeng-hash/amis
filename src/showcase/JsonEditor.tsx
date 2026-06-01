import React, { useState, useCallback } from 'react';

type EditorTab = 'schema' | 'data';

interface JsonEditorPreviewProps {
  /** Initial schema JSON string */
  defaultSchema: string;
  /** Initial data JSON string */
  defaultData: string;
  /** Tab labels (default: ['Amis Schema JSON', 'Data JSON']) */
  tabLabels?: [string, string];
  /** Render the preview section with parsed schema + data + renderKey */
  children: (schema: Record<string, unknown>, data: Record<string, unknown>, renderKey: number) => React.ReactNode;
}

/**
 * Generic JSON editor with schema/data tabs, render button, and preview slot.
 * Used by SchemaPreview, ClosableTabsPreview, ComboShowcase, etc.
 */
export const JsonEditorPreview: React.FC<JsonEditorPreviewProps> = ({
  defaultSchema,
  defaultData,
  tabLabels = ['Amis Schema JSON', 'Data JSON'],
  children,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(defaultSchema);
  const [dataJson, setDataJson] = useState(defaultData);
  const [error, setError] = useState<string | null>(null);
  const [parsedSchema, setParsedSchema] = useState<Record<string, unknown>>(() => JSON.parse(defaultSchema));
  const [parsedData, setParsedData] = useState<Record<string, unknown>>(() => JSON.parse(defaultData));
  const [renderKey, setRenderKey] = useState(0);

  const handleRender = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaJson);
      setParsedSchema(parsed);
      setError(null);
    } catch (e: unknown) {
      setError(`Schema: ${(e as Error).message}`);
      return;
    }

    try {
      const parsed = JSON.parse(dataJson);
      setParsedData(parsed);
    } catch (e: unknown) {
      setError(`Data: ${(e as Error).message}`);
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
  const activeLabel = activeTab === 'schema' ? tabLabels[0] : tabLabels[1];

  return (
    <div className="schema-preview-full">
      <div className="schema-preview-section">
        {/* Editor Tabs */}
        <div className="schema-preview-editor-tabs">
          <button
            className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            {tabLabels[0]}
          </button>
          <button
            className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            {tabLabels[1]}
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
        {error && <div className="schema-preview-error">{error}</div>}
      </div>

      {/* Preview */}
      <div className="schema-preview-section schema-preview-preview-section">
        <div className="schema-preview-preview-bar">
          <span>实时预览</span>
        </div>
        <div className="schema-preview-ami-container">
          {children(parsedSchema, parsedData, renderKey)}
        </div>
      </div>
    </div>
  );
};

export default JsonEditorPreview;
