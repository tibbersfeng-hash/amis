import React, { useRef, useEffect } from 'react';

const AmisPageShowcase: React.FC = () => {
  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">AmisPage</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            AmisPage 是 Amis 渲染器的包装组件。它调用 <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>render()</code> from <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>amis</code> 来渲染 JSON schema。
          </p>
          <pre className="showcase-json-block" style={{ fontSize: 12, padding: 12, marginTop: 8 }}>
{`// Usage in App.tsx
<AmisPage
  schema={data.schema}
  formData={data.formData}
  locale="zh-CN"
  previewLanguage="zh"
/>`}
          </pre>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            支持 props: <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>schema</code>, <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>formData</code>, <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>locale</code>, <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: 3 }}>previewLanguage</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmisPageShowcase;
