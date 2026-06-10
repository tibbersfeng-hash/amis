import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nConfigPanel } from './index';
import { setComponentLanguage } from '@/utils/i18n-config';

describe('I18nConfigPanel', () => {
  it('renders with language switcher', () => {
    render(<I18nConfigPanel language="zh" onLanguageChange={() => {}} />);
    expect(screen.getByText('中文')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
  });

  it('uses i18n-config label by default', () => {
    setComponentLanguage('en');
    render(<I18nConfigPanel language="zh" onLanguageChange={() => {}} />);
    expect(screen.getByText('Language:')).toBeDefined();
  });

  it('uses custom label when provided', () => {
    render(
      <I18nConfigPanel
        language="zh"
        onLanguageChange={() => {}}
        label="Preview Language"
      />
    );
    expect(screen.getByText('Preview Language')).toBeDefined();
  });

  it('calls onLanguageChange when selection changes', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <I18nConfigPanel language="zh" onLanguageChange={handleChange} />
    );
    const select = container.querySelector('select');
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('shows zh text for language label when language is zh', () => {
    setComponentLanguage('zh');
    render(<I18nConfigPanel language="en" onLanguageChange={() => {}} />);
    expect(screen.getByText('语言：')).toBeDefined();
  });
});
