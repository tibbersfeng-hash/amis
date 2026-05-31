import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComboTabShowcase from './ComboShowcase';

// Mock AmisLivePreview
vi.mock('./AmisLivePreview', () => ({
  AmisLivePreview: ({ schema }: { schema: Record<string, unknown> }) => {
    const formSchema = schema as { body: { type: string; name: string }[] };
    return (
      <div className="amis-live-preview" data-testid="amis-preview">
        <div className="custom-combo-tabs" data-testid="combo">
          <div className="cxd-ComboControl">
            <div className="cxd-Combo">
              <div className="cxd-Combo-items">
                {(formSchema.body?.[0]?.name === 'comboItems') && (
                  <>
                    <div className="cxd-Combo-item" data-item-index="0">
                      <div className="cxd-Combo-itemInner">
                        <div className="cxd-Combo-form">
                          <div className="cxd-Form-item">
                            <div className="cxd-FieldLabel">Sub Mission Type</div>
                            <div className="cxd-Select"><div className="cxd-Select-value">Room Stay Prepaid Booking</div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cxd-Combo-item" data-item-index="1">
                      <div className="cxd-Combo-itemInner">
                        <div className="cxd-Combo-form">
                          <div className="cxd-Form-item">
                            <div className="cxd-FieldLabel">Sub Mission Type</div>
                            <div className="cxd-Select"><div className="cxd-Select-value">Direct Booking</div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
}));

describe('ComboTabShowcase', () => {
  it('renders with 2 initial items', () => {
    render(<ComboTabShowcase />);
    expect(document.querySelectorAll('.cxd-Combo-item')).toHaveLength(2);
  });

  it('renders the AmisLivePreview wrapper', () => {
    render(<ComboTabShowcase />);
    expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
  });

  it('uses custom-combo-tabs CSS class', () => {
    render(<ComboTabShowcase />);
    expect(document.querySelector('.custom-combo-tabs')).toBeInTheDocument();
  });
});
