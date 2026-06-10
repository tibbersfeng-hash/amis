/**
 * i18n configuration for non-business UI components.
 *
 * "i18n-config" provides translation strings for infrastructure components
 * (Loading, DateRangePicker, etc.) that are NOT page-specific
 * business content. Business i18n fields (mission descriptions, promotion
 * content, etc.) are handled separately via schema sourcePath's {zh, en} objects.
 *
 * This config is consumed by components to translate their static UI labels
 * based on the current preview language.
 */

export type Language = 'zh' | 'en' | 'jp';

export interface ComponentI18nStrings {
  cancel: string;
  saveDraft: string;
  save: string;

  // Loading / Error
  loading: string;

  // DateRangePicker
  selectDateRange: string;
  startLabel: string;
  endLabel: string;
  confirm: string;
  months: string[];
  weekdays: string[];
  endAfterStart: string;

  // LanguageSwitcher
  languageLabel: string;
}

export const i18nStrings: Record<Language, ComponentI18nStrings> = {
  zh: {
    cancel: '取消',
    saveDraft: '保存草稿',
    save: '保存',
    loading: '加载中...',
    selectDateRange: '选择日期范围',
    startLabel: '开始',
    endLabel: '结束',
    confirm: '确认',
    months: [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月',
    ],
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    endAfterStart: '结束时间必须晚于开始时间',
    languageLabel: '语言：',
  },
  en: {
    cancel: 'Cancel',
    saveDraft: 'Save Draft',
    save: 'Save',
    loading: 'Loading...',
    selectDateRange: 'Select date range',
    startLabel: 'Start',
    endLabel: 'End',
    confirm: 'Confirm',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    endAfterStart: 'End time must be after start time',
    languageLabel: 'Language:',
  },
  jp: {
    cancel: 'キャンセル',
    saveDraft: '下書き保存',
    save: '保存',
    loading: '読み込み中...',
    selectDateRange: '日付範囲を選択',
    startLabel: '開始',
    endLabel: '終了',
    confirm: '確認',
    months: [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月',
    ],
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    endAfterStart: '終了時間は開始時間より後である必要があります',
    languageLabel: '言語：',
  },
};

/**
 * Current component i18n language.
 * Defaults to 'zh', set via initComponentI18n or setComponentI18n.
 */
let componentLang: Language = 'zh';

export function getComponentI18n(): ComponentI18nStrings {
  return i18nStrings[componentLang];
}

export function getComponentLanguage(): Language {
  return componentLang;
}

export function setComponentLanguage(lang: Language): void {
  componentLang = lang;
}

export function initComponentI18n(lang?: Language): Language {
  if (lang) {
    componentLang = lang;
  }
  return componentLang;
}
