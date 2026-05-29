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
});
