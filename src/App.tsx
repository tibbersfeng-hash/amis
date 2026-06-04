import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePageLoader } from './hooks/usePageLoader';
// Lazy load AmisPage so the Amis SDK (~4MB) is only loaded when a page needs it
const AmisPage = React.lazy(() =>
  import('./components/AmisPage').then((m) => ({ default: m.AmisPage }))
);
import { Loading, ErrorDisplay } from './components/Loading';
import { StickyFooter } from './components/StickyFooter';
import { I18nConfigPanel } from './components/I18nConfigPanel';
import { PhoneMockup } from './components/PhoneMockup';
import { initLocale, getLocale } from './utils/locale';
import { getPageMeta } from './utils/pageRegistry';
import { setComponentLanguage, initComponentI18n } from './utils/i18n-config';
import type { Language } from './components/LanguageSwitcher';
import ShowcaseApp from './showcase/ShowcaseApp';
import ListPage from './pages/ListPage';

const RemotePage = React.lazy(() => import('./pages/RemotePage'));

const MISSION_PAGES = ['mission', 'promotion'];

/**
 * Check if a value is an i18n JSON object {zh, en, ...}
 */
function isI18nValue(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false;
  const keys = Object.keys(val as object);
  return keys.includes('zh') && keys.length >= 2;
}

/**
 * Flatten i18n objects to single-language values based on previewLanguage
 */
function flattenI18nFields(
  formData: Record<string, unknown>,
  i18nFields: string[],
  lang: Language
): Record<string, unknown> {
  const result = { ...formData };
  for (const field of i18nFields) {
    const val = result[field];
    if (isI18nValue(val)) {
      result[field] = (val as Record<string, string>)[lang] || (val as Record<string, string>)['zh'];
    }
  }
  return result;
}

/**
 * Collect all i18n values from form data (for logging)
 */
function collectI18nData(formData: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(formData)) {
    if (isI18nValue(val)) {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Read a field's current value — tries DOM first, then Amis store as fallback
 * for custom components (FieldWithExclude, DateRangePicker, etc.) that don't
 * render native <input> elements with a name attribute.
 */
function readI18nFieldValue(field: string): string | undefined {
  // Try native input/textarea first (covers native Amis form components)
  const input = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement;
  if (input) return input.value;

  // Fallback: read from Amis form store (covers custom components)
  const store = (window as any).amisStore;
  if (store?.data && field in store.data) {
    const val = store.data[field];
    if (val !== null && val !== undefined) return String(val);
  }

  return undefined;
}

/**
 * Write a field's value — tries DOM first, then Amis store as fallback.
 */
function writeI18nFieldValue(field: string, value: string): void {
  // Try native input/textarea first
  const input = document.querySelector(`input[name="${field}"], textarea[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement;
  if (input) {
    const proto = input instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  // Fallback: update Amis form store directly
  const store = (window as any).amisStore;
  if (store?.changeValue) {
    store.changeValue(field, value);
  }
}

/**
 * Persist current field values back to the i18n map for the given language.
 * Uses readI18nFieldValue to support custom components.
 */
function persistI18nFieldValues(
  i18nFields: string[],
  i18nLookup: Record<string, unknown>,
  lang: Language
) {
  for (const field of i18nFields) {
    const i18nObj = i18nLookup[field];
    if (!isI18nValue(i18nObj)) continue;

    const i18nMap = i18nObj as Record<string, string>;
    const currentValue = readI18nFieldValue(field);
    if (currentValue !== undefined) {
      i18nMap[lang] = currentValue;
    }
  }
}

/**
 * Update i18n field values for the new language.
 * Uses writeI18nFieldValue to support custom components.
 */
function updateI18nFieldValues(
  i18nFields: string[],
  originalI18nData: Record<string, unknown>,
  lang: Language
) {
  for (const field of i18nFields) {
    const i18nObj = originalI18nData[field];
    if (!isI18nValue(i18nObj)) continue;

    const i18nMap = i18nObj as Record<string, string>;
    const newValue = i18nMap[lang] || i18nMap['zh'];

    writeI18nFieldValue(field, newValue);
  }
}

/**
 * Build a lookup of original i18n field values from the config data.
 */
function buildI18nLookup(
  formData: Record<string, unknown>,
  i18nFields: string[]
): Record<string, unknown> {
  const lookup: Record<string, unknown> = {};
  for (const field of i18nFields) {
    const val = formData[field];
    if (isI18nValue(val)) {
      lookup[field] = val;
    }
  }
  return lookup;
}

function App() {
  // Showcase route — bypass page loading, render showcase directly
  if (window.location.pathname === '/showcase') {
    return <ShowcaseApp />;
  }

  // Remote page route — fetch schema + data from API URLs (lazy loaded, Amis SDK loaded on demand)
  if (window.location.pathname === '/remote') {
    return (
      <React.Suspense fallback={<div className="lazy-loading"><Loading /></div>}>
        <RemotePage />
      </React.Suspense>
    );
  }

  // List page route — show searchable table for a data type
  if (window.location.pathname === '/list') {
    return <ListPage />;
  }

  const [pageName, setPageName] = useState<string>('');
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [previewLanguage, setPreviewLanguage] = useState<Language>('zh');

  useEffect(() => {
    initLocale();
    initComponentI18n();
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'list';
    const urlMode = params.get('mode') as 'view' | 'edit' | null;

    setPageName(page);
    if (urlMode === 'view') setMode('view');
  }, []);

  const { data, loading, error } = usePageLoader(pageName);
  const pageMeta = getPageMeta(pageName);
  const isMissionPage = MISSION_PAGES.includes(pageName);

  // Build i18n lookup from original config data
  const i18nLookup = useMemo(() => {
    return data?.formData && pageMeta.i18nFields?.length
      ? buildI18nLookup(data.formData, pageMeta.i18nFields)
      : {};
  }, [data?.formData, pageMeta.i18nFields]);

  // Flatten i18n fields to single-language values for initial Amis render.
  // IMPORTANT: previewLanguage is intentionally NOT a dependency - language
  // switching is handled via DOM manipulation (updateI18nFieldValues) to avoid
  // re-rendering Amis and losing user input. We use zh as the initial language.
  const initialFormData = useMemo(() => {
    if (!data?.formData) return {};
    if (!pageMeta.i18nFields?.length) return data.formData;
    return flattenI18nFields(data.formData, pageMeta.i18nFields, 'zh');
  }, [data?.formData, pageMeta.i18nFields]);

  // Expose original i18n data globally so PhoneMockup (rendered inside Amis)
  // can access original i18n objects for language switching without re-rendering Amis.
  useEffect(() => {
    if (data?.formData && pageMeta.i18nFields?.length) {
      const lookup = buildI18nLookup(data.formData, pageMeta.i18nFields);
      (window as any).__i18nData = lookup;
    }
    return () => { delete (window as any).__i18nData; };
  }, [data?.formData, pageMeta.i18nFields]);

  // Register global language change handler
  useEffect(() => {
    // Use a ref-like pattern to track current language without causing re-renders
    let currentLang = 'zh';

    (window as any).__onPreviewLanguageChange = (lang: Language) => {
      // Guard: ignore if same language (prevents accidental triggers from
      // Amis select/radio events bubbling or being misinterpreted)
      if (lang === currentLang) return;

      if (pageMeta.i18nFields?.length) {
        // Get (or lazily build) the i18n lookup from global store.
        // Reuse the existing lookup so user edits persist across language switches.
        let lookup = (window as any).__i18nData as Record<string, unknown>;
        if (!lookup) {
          lookup = data?.formData
            ? buildI18nLookup(data.formData, pageMeta.i18nFields!)
            : {};
          (window as any).__i18nData = lookup;
        }
        // Persist current DOM values back to the i18n map for the CURRENT language
        // before switching — this preserves user edits.
        persistI18nFieldValues(pageMeta.i18nFields!, lookup, currentLang);
        // Now apply the new language's values
        updateI18nFieldValues(pageMeta.i18nFields!, lookup, lang);
      }

      currentLang = lang;
      setPreviewLanguage(lang);
      setComponentLanguage(lang);
      window.dispatchEvent(new CustomEvent('previewLanguageChange', { detail: { lang } }));
      // Update all HTML language select elements in the schema
      document.querySelectorAll('.language-switcher .language-select').forEach((el) => {
        (el as HTMLSelectElement).value = lang;
      });
    };

    return () => {
      delete (window as any).__onPreviewLanguageChange;
    };
  }, [data?.formData, pageMeta.i18nFields]);

  // After initial render, sync i18n fields to the current language.
  // This handles the case where hidden tab inputs were updated to a different
  // language — when the user switches back, we restore the correct language.
  useEffect(() => {
    if (!pageMeta.i18nFields?.length) return;

    const tabsContainer = document.querySelector('.cxd-Tabs');
    if (!tabsContainer) return;

    const syncVisibleTab = () => {
      const activeTab = document.querySelector('.cxd-Tabs-pane.is-active');
      if (!activeTab) return;
      const lookup = (window as any).__i18nData as Record<string, unknown>;
      if (!lookup) return;
      // Use the latest language from the language selector
      const langSelect = document.querySelector('.language-switcher .language-select') as HTMLSelectElement;
      const lang = langSelect?.value || 'zh';
      for (const field of pageMeta.i18nFields!) {
        const i18nObj = lookup[field];
        if (!isI18nValue(i18nObj)) continue;
        // Only sync fields within the active tab
        const input = activeTab.querySelector(`input[name="${field}"], textarea[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement;
        if (!input) continue;
        const i18nMap = i18nObj as Record<string, string>;
        const newValue = i18nMap[lang] || i18nMap['zh'];
        if (input.value !== newValue) {
          input.value = newValue;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };

    // Use a debounce to avoid syncing multiple times during a single tab transition
    let syncTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedSync = () => {
      if (syncTimer) clearTimeout(syncTimer);
      syncTimer = setTimeout(syncVisibleTab, 100);
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target as Element;
          // Check if this is a tab pane and the class change involves is-active
          if (target.classList?.contains('cxd-Tabs-pane') &&
              target.classList?.contains('is-active')) {
            debouncedSync();
            return;
          }
        }
      }
    });

    observer.observe(tabsContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      if (syncTimer) clearTimeout(syncTimer);
    };
  }, [pageMeta.i18nFields]); // Only depends on fields config, not previewLanguage

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!data) {
    return null;
  }

  const handleSave = () => {
    // Read current values for i18n fields (supports both native inputs and custom components)
    const fullData: Record<string, unknown> = { ...data.formData };
    for (const field of pageMeta.i18nFields || []) {
      const original = i18nLookup[field];
      if (!isI18nValue(original)) continue;

      const i18nMap = original as Record<string, string>;
      // Read current value from DOM or Amis store
      const currentVal = readI18nFieldValue(field) ?? i18nMap[previewLanguage];

      fullData[field] = {
        ...i18nMap,
        [previewLanguage]: currentVal,
      };
    }

    const allI18n = collectI18nData(fullData);
    console.log('=== Save: All i18n Content ===');
    console.log(JSON.stringify(allI18n, null, 2));
    console.log('=== Full Form Data ===');
    console.log(JSON.stringify(fullData, null, 2));
  };

  const handleSaveDraft = () => {
    console.log('Save Draft clicked');
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <React.Suspense fallback={<div className="lazy-loading"><Loading /></div>}>
      <AmisPage
        schema={data.schema}
        formData={initialFormData}
        locale={getLocale()}
        previewLanguage={previewLanguage}
      />
      {isMissionPage && mode === 'edit' && (
        <StickyFooter
          onSave={handleSave}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancel}
        />
      )}
    </React.Suspense>
  );
}

export default App;
