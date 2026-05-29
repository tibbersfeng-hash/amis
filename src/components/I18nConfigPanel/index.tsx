import React, { useCallback } from 'react';
import { getComponentI18n } from '../../utils/i18n-config';
import type { Language } from '../LanguageSwitcher';
import { LANGUAGES } from '../LanguageSwitcher';

export interface I18nConfigPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  label?: string;
}

/**
 * I18n Config Panel — Language switcher for previewing multi-language content.
 *
 * This is the "i18n-config" capability: allows users to switch preview language
 * and see how i18n fields render in different languages without re-rendering
 * the Amis form. All business detail pages that support i18n-config should
 * render this panel.
 */
export const I18nConfigPanel: React.FC<I18nConfigPanelProps> = ({
  language,
  onLanguageChange,
  label,
}) => {
  const t = getComponentI18n();
  const displayLabel = label ?? t.languageLabel;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onLanguageChange(e.target.value as Language);
    },
    [onLanguageChange],
  );

  return (
    <div className="language-switcher">
      <span className="language-label">{displayLabel}</span>
      <select
        className="language-select"
        value={language}
        onChange={handleChange}
      >
        {LANGUAGES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
};
