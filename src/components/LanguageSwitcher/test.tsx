import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageSwitcher } from './index';

describe('LanguageSwitcher', () => {
  it('renders language label and select', () => {
    render(<LanguageSwitcher language="zh" onLanguageChange={() => {}} />);
    expect(screen.getByText('中文')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
  });

  it('shows correct selected value', () => {
    const { container } = render(<LanguageSwitcher language="en" onLanguageChange={() => {}} />);
    const select = container.querySelector('select');
    expect(select?.value).toBe('en');
  });

  it('calls onLanguageChange when selection changes', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={handleChange} />
    );
    const select = container.querySelector('select');
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('renders button variant when variant="button"', () => {
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={() => {}} variant="button" />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3); // zh, en, jp
    expect(buttons[0].classList.contains('is-active')).toBe(true);
  });

  it('renders tab variant when variant="tab"', () => {
    const { container } = render(
      <LanguageSwitcher language="en" onLanguageChange={() => {}} variant="tab" />
    );
    const tabs = container.querySelectorAll('.language-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[1].classList.contains('is-active')).toBe(true);
  });

  it('hides label when showLabel={false}', () => {
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={() => {}} showLabel={false} />
    );
    const label = container.querySelector('.language-label');
    expect(label).toBeNull();
  });

  it('calls onLanguageChange on button click', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={handleChange} variant="button" />
    );
    const buttons = container.querySelectorAll('button');
    buttons[1].click(); // click "English"
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('uses custom languages when provided', () => {
    const { container } = render(
      <LanguageSwitcher
        language="zh"
        onLanguageChange={() => {}}
        languages={[{ value: 'zh' as const, label: '中文' }]}
      />
    );
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(1);
    expect(options[0].value).toBe('zh');
  });
});
