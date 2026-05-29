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

export const SchemaPreview: React.FC = () => {
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [renderKey, setRenderKey] = useState(0);

  // Render on mount and whenever user clicks the button
  const handleRender = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaJson);
      setSchema(parsed);
      setError(null);
      setRenderKey(k => k + 1);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [schemaJson]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  return (
    <div className="schema-preview-full">
      <div className="schema-preview-section">
        <div className="schema-preview-toolbar">
          <span className="schema-preview-toolbar-title">Amis Schema JSON</span>
          <div className="schema-preview-toolbar-actions">
            <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
            <button className="schema-preview-render-btn" onClick={handleRender}>
              渲染
            </button>
          </div>
        </div>
        <textarea
          className="schema-preview-textarea"
          value={schemaJson}
          onChange={e => setSchemaJson(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <div className="schema-preview-error">{error}</div>}
      </div>
      <div className="schema-preview-section schema-preview-preview-section">
        <div className="schema-preview-preview-bar">
          <span>实时预览</span>
        </div>
        <div className="schema-preview-ami-container">
          <AmisLivePreview key={renderKey} schema={schema} />
        </div>
      </div>
    </div>
  );
};

export default SchemaPreview;
