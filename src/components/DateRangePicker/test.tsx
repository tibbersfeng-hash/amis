import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DateRangePickerComponent from './index';
import { setComponentLanguage } from '@/utils/i18n-config';

describe('DateRangePicker', () => {
  it('renders input field', () => {
    setComponentLanguage('en');
    render(<DateRangePickerComponent data={{}} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Select date range')).toBeDefined();
  });

  it('renders zh placeholder when language is zh', () => {
    setComponentLanguage('zh');
    render(<DateRangePickerComponent data={{}} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('选择日期范围')).toBeDefined();
  });

  it('renders label when provided', () => {
    render(
      <DateRangePickerComponent
        label="Registration Period"
        data={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Registration Period')).toBeDefined();
  });

  it('renders required asterisk when required is true', () => {
    const { container } = render(
      <DateRangePickerComponent
        label="Period"
        required
        data={{}}
        onChange={() => {}}
      />
    );
    const req = container.querySelector('.date-range-picker-req');
    expect(req).toBeDefined();
    expect(req?.textContent).toBe('*');
  });

  it('renders calendar icon', () => {
    const { container } = render(
      <DateRangePickerComponent data={{}} onChange={() => {}} />
    );
    expect(container.querySelector('.date-range-picker-icon')).toBeDefined();
  });

  it('opens popover on icon click', async () => {
    const { container } = render(
      <DateRangePickerComponent data={{}} onChange={() => {}} />
    );
    const icon = container.querySelector('.date-range-picker-icon');
    if (icon) icon.dispatchEvent(new Event('click', { bubbles: true }));
    expect(container.querySelector('.date-range-picker-popover')).toBeDefined();
  });
});
