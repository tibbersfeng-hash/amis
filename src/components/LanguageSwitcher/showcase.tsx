import React from 'react';
import { LanguageSwitcher } from './index';
import type { Language } from './index';

const LanguageSwitcherShowcase: React.FC = () => {
  const [lang, setLang] = React.useState<Language>('zh');

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Select variant (default)</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            Current: <strong>{lang}</strong>
          </p>
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Button variant</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} variant="button" />
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Tab variant (no label)</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} variant="tab" showLabel={false} />
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Custom languages (zh only)</div>
          <LanguageSwitcher
            language={lang}
            onLanguageChange={setLang}
            languages={[{ value: 'zh' as const, label: '中文' }]}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcherShowcase;
