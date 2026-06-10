import React, { useState } from 'react';
import { I18nConfigPanel } from './index';
import type { Language } from '@/components/LanguageSwitcher';
import { setComponentLanguage } from '@/utils/i18n-config';

const I18nConfigPanelShowcase: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');

  const handleChange = (newLang: Language) => {
    setLang(newLang);
    setComponentLanguage(newLang);
    window.dispatchEvent(new CustomEvent('previewLanguageChange', { detail: { lang: newLang } }));
  };

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">I18n Config Panel (default label)</div>
          <I18nConfigPanel language={lang} onLanguageChange={handleChange} />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">I18n Config Panel (custom label)</div>
          <I18nConfigPanel
            language={lang}
            onLanguageChange={handleChange}
            label="Preview Language"
          />
        </div>
      </div>
    </div>
  );
};

export default I18nConfigPanelShowcase;
