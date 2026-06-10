import React from 'react';
import { StickyFooter } from './index';
import { getComponentI18n } from '@/utils/i18n-config';

const StickyFooterShowcase: React.FC = () => {
  const t = getComponentI18n();

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Default (enabled)</div>
          <StickyFooter
            onCancel={() => alert('Cancel')}
            onSaveDraft={() => alert('Save Draft')}
            onSave={() => alert('Save')}
          />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Disabled</div>
          <StickyFooter
            onCancel={() => {}}
            onSaveDraft={() => {}}
            onSave={() => {}}
            disabled
          />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Current i18n labels</div>
          <pre className="showcase-json-block" style={{ fontSize: 12, padding: 12 }}>
            {JSON.stringify({ cancel: t.cancel, saveDraft: t.saveDraft, save: t.save }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default StickyFooterShowcase;
