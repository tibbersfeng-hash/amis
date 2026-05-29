import React from 'react';
import { LanguageSwitcher } from './index';
import type { Language } from './index';

const LanguageSwitcherShowcase: React.FC = () => {
  const [lang, setLang] = React.useState<Language>('zh');

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Interactive Language Switcher</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            Current: <strong>{lang}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcherShowcase;
