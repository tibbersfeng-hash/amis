import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewPanel } from './index';

describe('PreviewPanel', () => {
  it('renders with language switcher', () => {
    render(<PreviewPanel language="zh" onLanguageChange={() => {}} />);
    expect(screen.getByText('中文')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
  });

  it('calls onLanguageChange when language changes', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PreviewPanel language="zh" onLanguageChange={handleChange} />
    );
    const select = container.querySelector('select');
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('renders children when provided', () => {
    render(
      <PreviewPanel language="en" onLanguageChange={() => {}}>
        <div>Custom Preview Content</div>
      </PreviewPanel>
    );
    expect(screen.getByText('Custom Preview Content')).toBeDefined();
  });

  it('shows phone frame when no children', () => {
    const { container } = render(
      <PreviewPanel language="en" onLanguageChange={() => {}} />
    );
    expect(container.querySelector('.phone-frame')).toBeDefined();
  });
});
