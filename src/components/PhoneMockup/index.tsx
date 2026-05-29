import React, { useEffect, useState, useCallback } from 'react';
import { registerRenderer } from 'amis-core';
import { LANGUAGES } from '../LanguageSwitcher';

/**
 * Check if a value is an i18n JSON object {zh, en, ...}
 */
function isI18nValue(val: unknown): val is { zh: string; en: string } {
  if (!val || typeof val !== 'object') return false;
  const keys = Object.keys(val as object);
  return keys.includes('zh') && keys.length >= 2;
}

/**
 * Extract i18n value for the given language, with fallback chain.
 * Falls back: requested lang → other lang → raw string.
 */
function resolveI18n(val: unknown, lang: 'zh' | 'en'): string {
  if (isI18nValue(val)) {
    return val[lang] || (lang === 'zh' ? val.en : val.zh);
  }
  if (typeof val === 'string') return val;
  return '';
}

/**
 * Collect all display-relevant i18n fields from the Amis data context.
 * Falls back to window.__i18nData (original i18n JSON objects) when
 * Amis data has been flattened to single-language values.
 * Returns an object with { zh, en } pairs for each field.
 */
function getPreviewFields(data: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  // Mission i18n fields
  const missionFields = [
    'missionShortName',
    'missionLongName',
    'missionDescription',
    'awardDescription',
    'missionDetail',
    'tcContent',
    'startMission',
    'missionSegmentDescription',
  ];

  // Promotion i18n fields
  const promotionFields = [
    'bannerTitle',
    'bannerSubtitle',
    'ctaText',
    'richContent',
  ];

  const allFields = [...missionFields, ...promotionFields];

  // Try to get original i18n objects from global store first
  const globalI18n = (typeof window !== 'undefined' && (window as any).__i18nData) || {};

  for (const field of allFields) {
    const val = globalI18n[field] || data[field];
    if (val) {
      result[field] = val as string;
    }
  }

  return result;
}

export interface PhoneMockupProps {
  data?: Record<string, unknown>;
  previewLanguage?: 'zh' | 'en';
  onLanguageChange?: (lang: 'zh' | 'en') => void;
  schema?: Record<string, unknown>;
  children?: React.ReactNode;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({
  data,
  previewLanguage,
  onLanguageChange,
  schema,
  children,
}) => {
  const [lang, setLang] = useState<'zh' | 'en'>(
    (previewLanguage as 'zh' | 'en') || (data?.previewLanguage as 'zh' | 'en') || 'zh'
  );
  const previewFields = getPreviewFields(data || {});

  useEffect(() => {
    const externalLang = (previewLanguage as 'zh' | 'en') || (data?.previewLanguage as 'zh' | 'en');
    if (externalLang) setLang(externalLang);
  }, [previewLanguage, data?.previewLanguage]);

  // Listen to global language change event from the HTML language switcher
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lang: 'zh' | 'en' };
      if (detail?.lang) setLang(detail.lang);
    };
    window.addEventListener('previewLanguageChange', handler);
    return () => window.removeEventListener('previewLanguageChange', handler);
  }, []);

  const handleLangChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'zh' | 'en';
    setLang(newLang);
    window.dispatchEvent(new CustomEvent('previewLanguageChange', { detail: { lang: newLang } }));
    onLanguageChange?.(newLang);
  }, [onLanguageChange]);

  // Check if there are i18n fields to display
  const hasI18n = Object.keys(previewFields).length > 0;

  // Resolve display values from global i18n data (original JSON objects)
  // so language switching works without re-rendering Amis
  const globalI18n = (typeof window !== 'undefined' && (window as any).__i18nData) || {};
  const resolveGlobal = (field: string): string => {
    const val = globalI18n[field];
    return resolveI18n(val, lang);
  };

  const displayName = resolveGlobal('missionShortName') ||
                      resolveGlobal('missionLongName') ||
                      resolveGlobal('bannerTitle') ||
                      resolveI18n(data?.missionShortName, lang) ||
                      resolveI18n(data?.missionLongName, lang) ||
                      resolveI18n(data?.bannerTitle, lang) ||
                      'Mission Preview';
  const displayDesc = resolveGlobal('missionDescription') ||
                      resolveGlobal('awardDescription') ||
                      resolveGlobal('bannerSubtitle') ||
                      resolveI18n(data?.missionDescription, lang) ||
                      resolveI18n(data?.awardDescription, lang) ||
                      resolveI18n(data?.bannerSubtitle, lang) ||
                      '';

  return (
    <div className="phone-frame">
      <div className="phone-header">
        <div className="phone-notch" />
        <div className="phone-header-title">{displayName}</div>
        <div className="phone-lang-btn" style={{ position: 'relative' }}>
          {lang === 'zh' ? '中文' : 'EN'}
          <select
            className="phone-lang-dropdown-visible"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              fontSize: '11px',
            }}
            value={lang}
            onChange={handleLangChange}
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="phone-body" style={{
        padding: '12px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        overflow: 'auto',
      }}>
        {hasI18n ? (
          <>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#333',
              marginBottom: '8px',
              width: '100%',
            }}>
              {displayName}
            </div>
            {displayDesc && (
              <div style={{
                fontSize: '10px',
                color: '#666',
                lineHeight: '1.5',
                width: '100%',
              }} dangerouslySetInnerHTML={{ __html: displayDesc }} />
            )}
          </>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Preview panel
          </div>
        )}
      </div>
    </div>
  );
};

export const PhoneMockupRenderer = registerRenderer({
  type: 'phone-mockup',
  name: 'phone-mockup',
  component: PhoneMockup,
});

export { PhoneMockup };
