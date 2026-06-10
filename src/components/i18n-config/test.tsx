import { describe, it, expect, beforeEach } from 'vitest';
import {
  i18nStrings,
  getComponentI18n,
  getComponentLanguage,
  setComponentLanguage,
  initComponentI18n,
} from '@/utils/i18n-config';

describe('i18n-config', () => {
  beforeEach(() => {
    setComponentLanguage('zh');
  });
  it('has both zh and en strings', () => {
    expect(i18nStrings.zh).toBeDefined();
    expect(i18nStrings.en).toBeDefined();
  });

  it('zh strings contain expected keys', () => {
    const zh = i18nStrings.zh;
    expect(zh.cancel).toBe('取消');
    expect(zh.saveDraft).toBe('保存草稿');
    expect(zh.save).toBe('保存');
    expect(zh.loading).toBe('加载中...');
    expect(zh.confirm).toBe('确认');
  });

  it('en strings contain expected keys', () => {
    const en = i18nStrings.en;
    expect(en.cancel).toBe('Cancel');
    expect(en.saveDraft).toBe('Save Draft');
    expect(en.save).toBe('Save');
    expect(en.loading).toBe('Loading...');
    expect(en.confirm).toBe('Confirm');
  });

  it('months arrays have 12 entries', () => {
    expect(i18nStrings.zh.months).toHaveLength(12);
    expect(i18nStrings.en.months).toHaveLength(12);
  });

  it('weekdays arrays have 7 entries', () => {
    expect(i18nStrings.zh.weekdays).toHaveLength(7);
    expect(i18nStrings.en.weekdays).toHaveLength(7);
  });

  it('getComponentI18n returns strings for current language', () => {
    setComponentLanguage('zh');
    expect(getComponentI18n().cancel).toBe('取消');
    setComponentLanguage('en');
    expect(getComponentI18n().cancel).toBe('Cancel');
  });

  it('setComponentLanguage changes the current language', () => {
    initComponentI18n('zh');
    expect(getComponentLanguage()).toBe('zh');
    setComponentLanguage('en');
    expect(getComponentLanguage()).toBe('en');
  });

  it('initComponentI18n initializes language', () => {
    const result = initComponentI18n('en');
    expect(result).toBe('en');
    expect(getComponentLanguage()).toBe('en');
  });

  it('initComponentI18n defaults to zh when no arg', () => {
    const result = initComponentI18n();
    expect(result).toBe('zh');
    expect(getComponentLanguage()).toBe('zh');
  });
});
