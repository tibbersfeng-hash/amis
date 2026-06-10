import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickyFooter } from './index';
import { setComponentLanguage } from '@/utils/i18n-config';

describe('StickyFooter', () => {
  it('renders three buttons with i18n text', () => {
    setComponentLanguage('en');
    render(
      <StickyFooter
        onCancel={() => {}}
        onSaveDraft={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByText('Cancel')).toBeDefined();
    expect(screen.getByText('Save Draft')).toBeDefined();
    expect(screen.getByText('Save')).toBeDefined();
  });

  it('renders zh text when language is zh', () => {
    setComponentLanguage('zh');
    render(
      <StickyFooter
        onCancel={() => {}}
        onSaveDraft={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByText('取消')).toBeDefined();
    expect(screen.getByText('保存草稿')).toBeDefined();
    expect(screen.getByText('保存')).toBeDefined();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    setComponentLanguage('en');
    const { container } = render(
      <StickyFooter
        onCancel={handleCancel}
        onSaveDraft={() => {}}
        onSave={() => {}}
      />
    );
    const buttons = container.querySelectorAll('button');
    buttons[0].click();
    expect(handleCancel).toHaveBeenCalled();
  });

  it('disables all buttons when disabled prop is true', () => {
    setComponentLanguage('en');
    const { container } = render(
      <StickyFooter
        onCancel={() => {}}
        onSaveDraft={() => {}}
        onSave={() => {}}
        disabled
      />
    );
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      expect(btn.disabled).toBe(true);
    });
  });
});
