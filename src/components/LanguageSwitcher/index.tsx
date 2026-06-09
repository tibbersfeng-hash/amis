import React from 'react';

// ── Language constants — single source of truth ─────────────

/**
 * All supported language keys. Add new languages here only.
 * These keys are used in multi-language value objects like { zh: "中文", en: "English", jp: "日本語" }
 */
export const LANGUAGE_KEYS = ['zh', 'en', 'jp'] as const;

export type LanguageKey = typeof LANGUAGE_KEYS[number];

/**
 * Check if a value is a language-keyed object (e.g. {zh: "..."} or {zh: "...", en: "..."}).
 * This identifies values that are structured with language keys, regardless of completeness.
 * It does NOT determine whether a field is multiLang — that comes from schema `multiLang: true`.
 */
export function isI18nValue(val: unknown): val is Record<string, unknown> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  const keys = Object.keys(val);
  // At least one key matches a known language key
  return keys.some((key) => (LANGUAGE_KEYS as readonly string[]).includes(key));
}

// ── Language switcher UI ────────────────────────────────────

export const LANGUAGES = [
  { value: 'zh' as const, label: '中文' },
  { value: 'en' as const, label: 'English' },
  { value: 'jp' as const, label: '日语' },
];

export type Language = typeof LANGUAGES[number]['value'];

export type LanguageSwitcherVariant = 'select' | 'button' | 'tab';

export interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  /** Appearance mode. Default: 'select' */
  variant?: LanguageSwitcherVariant;
  /** Whether to show the "Language:" label. Default: true */
  showLabel?: boolean;
  /** Custom language list. Default: LANGUAGES (zh/en/jp) */
  languages?: typeof LANGUAGES;
  /** Additional CSS class */
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
  variant = 'select',
  showLabel = true,
  languages = LANGUAGES,
  className,
}) => {
  const baseClass = 'language-switcher';
  const cls = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div className={cls}>
      {showLabel && (
        <label className="language-label">Language:</label>
      )}
      {variant === 'select' && (
        <select
          className="language-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
        >
          {languages.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}
      {variant === 'button' && (
        <div className="language-buttons">
          {languages.map(({ value, label }) => (
            <button
              key={value}
              className={`language-btn ${value === language ? 'is-active' : ''}`}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {variant === 'tab' && (
        <div className="language-tabs">
          {languages.map(({ value, label }) => (
            <div
              key={value}
              className={`language-tab ${value === language ? 'is-active' : ''}`}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
