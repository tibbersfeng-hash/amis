import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FieldWithExcludeComponent } from './index';

const defaultProps = {
  label: 'Market Code',
  name: 'marketCodes',
  excludeName: 'marketCodesExclude',
  excludeCheckboxName: 'marketCodeExclude',
  options: [
    { label: 'GDS', value: 'GDS' },
    { label: 'CORPORATE', value: 'CORPORATE' },
    { label: 'BAR', value: 'BAR' },
  ],
  placeholder: 'Please Select',
  multiple: true,
  searchable: true,
  data: {},
  onChange: vi.fn(),
  onBulkChange: vi.fn(),
};

describe('FieldWithExclude (select + exclude checkbox)', () => {
  it('renders label text', () => {
    render(<FieldWithExcludeComponent {...defaultProps} />);
    expect(screen.getByText('Market Code')).toBeInTheDocument();
  });

  it('renders checkbox with Exclude label', () => {
    render(<FieldWithExcludeComponent {...defaultProps} />);
    expect(screen.getByText('Exclude')).toBeInTheDocument();
    expect(document.querySelector('.field-exclude-checkbox')).toBeInTheDocument();
  });

  it('renders dropdown with placeholder', () => {
    render(<FieldWithExcludeComponent {...defaultProps} />);
    expect(screen.getByText('Please Select')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<FieldWithExcludeComponent {...defaultProps} />);
    const dropdown = screen.getByText('Please Select').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    expect(screen.getByText('GDS')).toBeInTheDocument();
    expect(screen.getByText('CORPORATE')).toBeInTheDocument();
  });

  it('calls onBulkChange with checkbox field and preserves selected values when checkbox is toggled', () => {
    const onBulkChange = vi.fn();
    render(<FieldWithExcludeComponent {...defaultProps} onBulkChange={onBulkChange} />);
    fireEvent.click(document.querySelector('.field-exclude-checkbox')!);
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodeExclude: true,
        marketCodesExclude: [], // no selected values, but field is set (not undefined)
      })
    );
  });

  it('calls onBulkChange with exclude field when checkbox checked and option selected', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodeExclude: true }}
        onBulkChange={onBulkChange}
      />
    );
    const dropdown = screen.getByText('Please Select (Exclude)').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    fireEvent.click(screen.getByText('GDS'));
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodesExclude: ['GDS'],
      })
    );
  });

  it('calls onBulkChange with base field when checkbox unchecked', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodeExclude: false }}
        onBulkChange={onBulkChange}
      />
    );
    const dropdown = screen.getByText('Please Select').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    fireEvent.click(screen.getByText('BAR'));
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodes: ['BAR'],
      })
    );
  });

  it('shows exclude indicator when checkbox is checked', () => {
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodeExclude: true }}
      />
    );
    expect(screen.getByText(/Values selected above will be excluded/)).toBeInTheDocument();
  });

  it('does not show exclude indicator when checkbox is unchecked', () => {
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodeExclude: false }}
      />
    );
    expect(screen.queryByText(/Values selected above will be excluded/)).not.toBeInTheDocument();
  });

  it('uses default excludeName when not provided', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        excludeName={undefined}
        data={{ marketCodeExclude: true }}
        onBulkChange={onBulkChange}
      />
    );
    const dropdown = screen.getByText('Please Select (Exclude)').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    fireEvent.click(screen.getByText('GDS'));
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodesExclude: ['GDS'],
      })
    );
  });

  it('uses default excludeCheckboxName when not provided', () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        excludeCheckboxName={undefined}
        onBulkChange={onBulkChange}
      />
    );
    fireEvent.click(document.querySelector('.field-exclude-checkbox')!);
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodesExclude: [], // checkbox toggled, values preserved in target field
      })
    );
  });

  it('single select mode returns string value', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        multiple={false}
        data={{}}
        onBulkChange={onBulkChange}
      />
    );
    const dropdown = screen.getByText('Please Select').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    fireEvent.click(screen.getByText('GDS'));
    expect(onBulkChange).toHaveBeenCalledWith({
      marketCodes: 'GDS',
    });
  });

  it('clears selection on X button click', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodes: ['GDS', 'BAR'] }}
        onBulkChange={onBulkChange}
      />
    );
    const clearBtn = screen.getByText('×');
    fireEvent.click(clearBtn);
    expect(onBulkChange).toHaveBeenCalledWith({
      marketCodes: [],
    });
  });

  it('supports source array as options', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        options={[]}
        source={[
          { label: 'XRAY', value: 'XRAY' },
          { label: 'YANKEE', value: 'YANKEE' },
        ]}
        data={{}}
        onBulkChange={onBulkChange}
      />
    );
    const dropdown = screen.getByText('Please Select').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    expect(screen.getByText('XRAY')).toBeInTheDocument();
    expect(screen.getByText('YANKEE')).toBeInTheDocument();
  });

  it('toggles selection in multiple mode', async () => {
    const onBulkChange = vi.fn();
    render(
      <FieldWithExcludeComponent
        {...defaultProps}
        data={{ marketCodes: ['GDS'] }}
        onBulkChange={onBulkChange}
      />
    );
    // GDS is displayed as selected value
    expect(screen.getByText('GDS')).toBeInTheDocument();
    // Open dropdown
    const dropdown = screen.getByText('GDS').closest('.field-exclude-select');
    fireEvent.click(dropdown!);
    // Click GDS option in dropdown using data attribute
    const gdsOption = document.querySelector('[data-option-value="GDS"]');
    fireEvent.click(gdsOption!);
    expect(onBulkChange).toHaveBeenCalledWith(
      expect.objectContaining({
        marketCodes: [],
      })
    );
  });
});
