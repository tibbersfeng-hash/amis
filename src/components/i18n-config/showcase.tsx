import React from 'react';
import { i18nStrings, getComponentI18n, getComponentLanguage, setComponentLanguage } from '@/utils/i18n-config';
import type { Language } from '@/utils/i18n-config';

const I18nConfigShowcase: React.FC = () => {
  const t = getComponentI18n();
  const lang = getComponentLanguage();

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Current Language</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
            {lang === 'zh' ? '中文 (Chinese)' : 'English'}
          </div>
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ flex: 1 }}>
          <div className="showcase-demo-label">中文</div>
          <pre className="showcase-json-block" style={{ fontSize: 12, padding: 12 }}>
            {JSON.stringify(i18nStrings.zh, null, 2)}
          </pre>
        </div>
        <div style={{ flex: 1 }}>
          <div className="showcase-demo-label">English</div>
          <pre className="showcase-json-block" style={{ fontSize: 12, padding: 12 }}>
            {JSON.stringify(i18nStrings.en, null, 2)}
          </pre>
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Live Preview (current lang: {lang})</div>
          <div className="showcase-demo-row">
            <button style={{ padding: '8px 16px' }}>{t.cancel}</button>
            <button style={{ padding: '8px 16px' }}>{t.saveDraft}</button>
            <button style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff' }}>{t.save}</button>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.loading}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default I18nConfigShowcase;
