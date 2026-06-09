import React from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps } from 'amis';
import { LanguageSwitcher, LANGUAGES } from './index';
import type { Language } from './index';

/**
 * Amis schema props for language-switcher component.
 */
interface LanguageSwitcherSchema {
  type: 'language-switcher';
  /** Appearance mode: 'select' | 'button' | 'tab'. Default: 'select' */
  variant?: 'select' | 'button' | 'tab';
  /** Whether to show the label. Default: true */
  showLabel?: boolean;
  /** Custom language options. Default: LANGUAGES */
  languages?: Array<{ value: Language; label: string }>;
  /** Initial language value. Default: 'zh' */
  value?: Language;
  /** Additional CSS class */
  className?: string;
}

interface LanguageSwitcherRendererProps extends FormControlProps, LanguageSwitcherSchema {}

/**
 * LanguageSwitcherRenderer — Amis custom renderer for language switching.
 *
 * Renders inside the Amis scope. On language change:
 * 1. dispatchEvent('change') → other Amis components can listen via onEvent
 * 2. window.dispatchEvent('amis-language-change') → AmisPage (React layer) listens and handles persist
 *
 * Usage in schema:
 * {
 *   "type": "language-switcher",
 *   "variant": "select",
 *   "showLabel": true,
 *   "onEvent": {
 *     "change": {
 *       "actions": [{ "actionType": "toast", "args": { "msg": "Switched to ${event.data.value}" } }]
 *     }
 *   }
 * }
 */
const LanguageSwitcherRenderer: React.FC<LanguageSwitcherRendererProps> = ({
  variant,
  showLabel,
  languages,
  value,
  className,
  dispatchEvent,
}) => {
  const lang = value || 'zh';
  const langs = languages || LANGUAGES;

  const handleChange = React.useCallback(
    (newLang: Language) => {
      // 1. Amis event system — other Amis components can listen via onEvent
      dispatchEvent?.('change', { value: newLang });

      // 2. Bridge to React layer — AmisPage listens to this for persist + re-render
      window.dispatchEvent(
        new CustomEvent('amis-language-change', { detail: { lang: newLang } })
      );
    },
    [dispatchEvent],
  );

  return (
    <LanguageSwitcher
      language={lang}
      onLanguageChange={handleChange}
      variant={variant || 'select'}
      showLabel={showLabel !== false}
      languages={langs}
      className={className}
    />
  );
};

registerRenderer({
  type: 'language-switcher',
  name: 'language-switcher',
  component: LanguageSwitcherRenderer,
});

export { LanguageSwitcherRenderer };
export default LanguageSwitcherRenderer;
