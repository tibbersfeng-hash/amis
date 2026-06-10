import React, { useState } from 'react';
import { PreviewPanel } from './index';
import type { Language } from '@/components/LanguageSwitcher';

const PreviewPanelShowcase: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: 300 }}>
          <div className="showcase-demo-label">Preview Panel with Language Switcher</div>
          <PreviewPanel language={lang} onLanguageChange={setLang} />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanelShowcase;
