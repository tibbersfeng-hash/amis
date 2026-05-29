import React from 'react';
import { LanguageSwitcher, Language } from '../LanguageSwitcher';

export interface PreviewPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  children?: React.ReactNode;
}

/**
 * Preview panel with language switcher.
 * Renders the phone mockup with a language dropdown above it.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  language,
  onLanguageChange,
  children,
}) => {
  return (
    <div className="preview-panel">
      <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
      <div className="phone-card">
        {children || (
          <div className="phone-frame">
            <div className="phone-header">
              <div className="phone-notch" />
            </div>
            <div className="phone-screen">
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Preview panel
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
