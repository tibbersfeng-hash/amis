import React from 'react';

export const LANGUAGES = [
  { value: 'zh' as const, label: '中文' },
  { value: 'en' as const, label: 'English' },
  { value: 'jp' as const, label: '日本語' },
];

export type Language = typeof LANGUAGES[number]['value'];

export interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
}) => {
  return (
    <div className="language-switcher">
      <label className="language-label">Language:</label>
      <select
        className="language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
      >
        {LANGUAGES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
};
