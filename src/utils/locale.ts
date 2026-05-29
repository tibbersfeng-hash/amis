/**
 * Locale utility: handles language switching and fixes Amis date picker i18n.
 */
export type Locale = 'zh-CN' | 'en';

let currentLocale: Locale = 'zh-CN';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  // Trigger custom event for Amis components to listen
  window.dispatchEvent(
    new CustomEvent('mission-lang-change', { detail: { locale } })
  );
}

/**
 * Initialize locale from URL params or default to zh-CN.
 */
export function initLocale(): Locale {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang === 'en') {
    currentLocale = 'en';
  } else {
    currentLocale = 'zh-CN';
  }
  return currentLocale;
}

/**
 * Fix Amis date picker locale - apply current locale to all date pickers.
 */
export function fixDatePickerLocale(): void {
  const datePickers = document.querySelectorAll(
    '.cxd-DatePicker-input, .cxd-DateRangePicker-input'
  );
  datePickers.forEach((el) => {
    const input = el as HTMLInputElement;
    // Trigger locale update if needed
    if (input.dataset.locale !== currentLocale) {
      input.dataset.locale = currentLocale;
    }
  });
}

/**
 * Translate operation link text based on current locale.
 */
export function translateOpText(text: string): string {
  const translations: Record<string, string> = {
    '查看': 'View',
    '编辑': 'Edit',
    '删除': 'Delete',
    '返回': 'Return',
    '保存': 'Save',
    '取消': 'Cancel',
    '保存草稿': 'Save Draft',
  };

  if (currentLocale === 'en' && translations[text]) {
    return translations[text];
  }
  return text;
}
