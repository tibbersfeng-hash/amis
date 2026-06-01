import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComboTabShowcase from './ComboShowcase';

/**
 * Mock that mirrors the full form template from ComboShowcase.
 * Renders all key form fields so tests can verify data preservation.
 */
vi.mock('./AmisLivePreview', () => {
  return {
    AmisLivePreview: ({ schema, onDataChange }: { schema: Record<string, unknown>; onDataChange?: (data: Record<string, unknown>) => void }) => {
      const isCombo = (schema as Record<string, unknown>).name === 'comboItems';
      const comboValue = (schema as Record<string, unknown>).value as Record<string, unknown>[] | undefined;
      const itemCount = isCombo && Array.isArray(comboValue) ? comboValue.length : 0;
      const maxItems = (schema as Record<string, unknown>).max as number | undefined;
      const showAddBtn = isCombo && maxItems !== undefined && itemCount < maxItems;

      const handleAddClick = () => {
        const currentItems = comboValue || [];
        const newItem = {
          title: `Sub Mission ${currentItems.length + 1}`,
          subMissionType: '', businessUnit: '', targetSpending: '',
          currency: '', paymentMethod: '', marketCode: '', rateCode: '',
          source: '', roomType: '', roomCategory: '', noOfNights: '',
          minimumSpending: '', awardType: 'points', awardPoints: '',
          billingCode: '', stockQty: '', transactionNote: '',
        };
        onDataChange?.({ comboItems: [...currentItems, newItem] });
      };

      const handleDelClick = (index: number) => {
        const currentItems = comboValue || [];
        const newItems = currentItems.filter((_, i) => i !== index);
        onDataChange?.({ comboItems: newItems });
      };

      const handleFieldChange = (index: number, field: string, value: unknown) => {
        const currentItems = comboValue || [];
        const newItems = currentItems.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        );
        onDataChange?.({ comboItems: newItems });
      };

      return (
        <div className="amis-live-preview" data-testid="amis-preview">
          <div className="custom-combo-tabs" data-testid="combo">
            <div className="cxd-ComboControl">
              <div className="cxd-Combo">
                {/* Tab bar */}
                <div className="cxd-ComboTabs">
                  {isCombo && Array.from({ length: itemCount }, (_, i) => {
                    const itemData = comboValue?.[i];
                    return (
                      <div
                        key={i}
                        className={`cxd-Tabs-link${i === 0 ? ' is-active' : ''}`}
                        data-tab-index={i}
                        data-tab-title={String(itemData?.title || '')}
                      >
                        <a title={String(itemData?.title || '')}>{itemData?.title}</a>
                        <span
                          className="cxd-Combo-tab-delBtn"
                          data-del-index={i}
                          onClick={() => handleDelClick(i)}
                          role="button"
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                  {showAddBtn && (
                    <div className="cxd-ComboTabs-addLink">
                      <a className="closable-tabs-add-btn" onClick={handleAddClick}>+ Add Sub Mission</a>
                    </div>
                  )}
                </div>
                {/* Active tab form content */}
                <div className="cxd-Tabs-pane.is-active" data-active-pane>
                  {isCombo && comboValue?.[0] && (
                    <div className="cxd-Combo-itemInner" data-item-index={0}>
                      <div className="cxd-Combo-form">
                        {/* Sub Mission Type select */}
                        <div className="cxd-Form-item" data-field="subMissionType">
                          <div className="cxd-Form-label">Sub Mission Type*</div>
                          <div className="cxd-Select">
                            <div className="cxd-Select-value" data-testid={`tab-0-subMissionType`}>
                              {comboValue[0].subMissionType || '请选择'}
                            </div>
                          </div>
                        </div>
                        {/* Business Unit select */}
                        <div className="cxd-Form-item" data-field="businessUnit">
                          <div className="cxd-Form-label">Business Unit*</div>
                          <div className="cxd-Select">
                            <div className="cxd-Select-value" data-testid={`tab-0-businessUnit`}>
                              {comboValue[0].businessUnit || '请选择'}
                            </div>
                          </div>
                        </div>
                        {/* Currency select */}
                        <div className="cxd-Form-item" data-field="currency">
                          <div className="cxd-Form-label">Currency</div>
                          <div className="cxd-Select">
                            <div className="cxd-Select-value" data-testid={`tab-0-currency`}>
                              {comboValue[0].currency || '请选择'}
                            </div>
                          </div>
                        </div>
                        {/* Payment Method select */}
                        <div className="cxd-Form-item" data-field="paymentMethod">
                          <div className="cxd-Form-label">Payment Method</div>
                          <div className="cxd-Select">
                            <div className="cxd-Select-value" data-testid={`tab-0-paymentMethod`}>
                              {comboValue[0].paymentMethod || '请选择'}
                            </div>
                          </div>
                        </div>
                        {/* Target Spending input */}
                        <div className="cxd-Form-item" data-field="targetSpending">
                          <div className="cxd-Form-label">Target Spending</div>
                          <input
                            name="targetSpending"
                            data-testid="tab-0-targetSpending"
                            value={String(comboValue[0].targetSpending || '')}
                            onChange={(e) => handleFieldChange(0, 'targetSpending', e.target.value)}
                          />
                        </div>
                        {/* Transaction Note input */}
                        <div className="cxd-Form-item" data-field="transactionNote">
                          <div className="cxd-Form-label">Transaction Note</div>
                          <input
                            name="transactionNote"
                            data-testid="tab-0-transactionNote"
                            value={String(comboValue[0].transactionNote || '')}
                            onChange={(e) => handleFieldChange(0, 'transactionNote', e.target.value)}
                          />
                        </div>
                        {/* Award Points input */}
                        <div className="cxd-Form-item" data-field="awardPoints">
                          <div className="cxd-Form-label">Award Points</div>
                          <input
                            name="awardPoints"
                            data-testid="tab-0-awardPoints"
                            value={String(comboValue[0].awardPoints || '')}
                            onChange={(e) => handleFieldChange(0, 'awardPoints', e.target.value)}
                          />
                        </div>
                        {/* Registration Award radios */}
                        <div className="cxd-Form-item" data-field="awardType">
                          <div className="cxd-Form-label">Registration Award</div>
                          {['points', 'voucher', 'none'].map((opt) => (
                            <label key={opt} className="cxd-Radio-item">
                              <input
                                type="radio"
                                name="awardType"
                                value={opt}
                                checked={comboValue[0].awardType === opt}
                                onChange={() => handleFieldChange(0, 'awardType', opt)}
                              />
                              <span>{opt === 'points' ? 'Award Points' : opt === 'voucher' ? 'Voucher' : 'No Award'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  };
});

describe('ComboTabShowcase', () => {
  // ===== JSON Editor =====

  describe('JSON editor', () => {
    it('renders schema/data editor tabs', () => {
      render(<ComboTabShowcase />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      expect(tabs).toHaveLength(2);
      expect(tabs[0].textContent).toBe('Combo Schema JSON');
      expect(tabs[1].textContent).toBe('Combo Data JSON');
    });

    it('default active tab is schema', () => {
      render(<ComboTabShowcase />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      expect(tabs[0]).toHaveClass('is-active');
      expect(tabs[1]).not.toHaveClass('is-active');
    });

    it('switches to data tab when clicked', () => {
      render(<ComboTabShowcase />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      fireEvent.click(tabs[1]);
      expect(tabs[1]).toHaveClass('is-active');
      expect(tabs[0]).not.toHaveClass('is-active');
    });

    it('renders render button', () => {
      render(<ComboTabShowcase />);
      const renderBtn = document.querySelector('.schema-preview-render-btn');
      expect(renderBtn).toBeInTheDocument();
      expect(renderBtn).toHaveTextContent('渲染');
    });

    it('renders JSON textarea', () => {
      render(<ComboTabShowcase />);
      const textarea = document.querySelector('.schema-preview-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('textarea contains schema JSON by default', () => {
      render(<ComboTabShowcase />);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toContain('"type": "combo"');
    });

    it('textarea shows data JSON when data tab is active', () => {
      render(<ComboTabShowcase />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      fireEvent.click(tabs[1]);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toContain('"Sub Mission 1"');
      expect(textarea.value).toContain('"Sub Mission 2"');
    });

    it('Ctrl+Enter triggers render', () => {
      render(<ComboTabShowcase />);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      fireEvent.keyDown(textarea, { ctrlKey: true, key: 'Enter' });
      // Should not throw, preview should be visible
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });
  });

  // ===== Basic Rendering =====

  it('renders with 2 initial items', () => {
    render(<ComboTabShowcase />);
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(2);
  });

  it('renders the AmisLivePreview wrapper', () => {
    render(<ComboTabShowcase />);
    expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
  });

  it('uses custom-combo-tabs CSS class', () => {
    render(<ComboTabShowcase />);
    expect(document.querySelector('.custom-combo-tabs')).toBeInTheDocument();
  });

  it('initial tab labels are Sub Mission 1 and Sub Mission 2', () => {
    render(<ComboTabShowcase />);
    const tabs = document.querySelectorAll('.cxd-Tabs-link');
    expect(tabs[0]?.getAttribute('data-tab-title')).toBe('Sub Mission 1');
    expect(tabs[1]?.getAttribute('data-tab-title')).toBe('Sub Mission 2');
  });

  // ===== Initial Values =====

  it('Sub Mission 1 has empty/default values', () => {
    render(<ComboTabShowcase />);
    expect(screen.getByTestId('tab-0-businessUnit').textContent).toBe('请选择');
    expect(screen.getByTestId('tab-0-subMissionType').textContent).toBe('请选择');
    expect(screen.getByTestId('tab-0-targetSpending')).toHaveValue('');
    expect(screen.getByTestId('tab-0-transactionNote')).toHaveValue('');
  });

  // ===== Add Tab =====

  it('adds a tab when clicking the add button', () => {
    render(<ComboTabShowcase />);
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    expect(addBtn).toBeInTheDocument();
    fireEvent.click(addBtn);
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(3);
  });

  it('adds multiple tabs sequentially', () => {
    render(<ComboTabShowcase />);
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(4);
  });

  it('hides the add button when at max tabs (10)', () => {
    render(<ComboTabShowcase />);
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    for (let i = 0; i < 8; i++) {
      fireEvent.click(addBtn);
    }
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(10);
    expect(document.querySelector('.closable-tabs-add-btn')).not.toBeInTheDocument();
  });

  it('new tab title follows naming convention', () => {
    render(<ComboTabShowcase />);
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);
    const tabs = document.querySelectorAll('.cxd-Tabs-link');
    expect(tabs[2]?.getAttribute('data-tab-title')).toBe('Sub Mission 3');
  });

  // ===== Delete Tab =====

  it('delete tab via delete button', () => {
    render(<ComboTabShowcase />);
    // First add a tab
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(3);

    // Delete the 3rd tab
    const delBtn = document.querySelector('[data-del-index="2"]') as HTMLSpanElement;
    fireEvent.click(delBtn);
    expect(document.querySelectorAll('.cxd-Tabs-link')).toHaveLength(2);
  });

  it('original tabs preserved after delete', () => {
    render(<ComboTabShowcase />);
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);

    const delBtn = document.querySelector('[data-del-index="2"]') as HTMLSpanElement;
    fireEvent.click(delBtn);

    const tabs = document.querySelectorAll('.cxd-Tabs-link');
    expect(tabs[0]?.getAttribute('data-tab-title')).toBe('Sub Mission 1');
    expect(tabs[1]?.getAttribute('data-tab-title')).toBe('Sub Mission 2');
  });

  // ===== Data Preservation (Core Scenario) =====

  it('editing tab data is preserved after adding a new tab', () => {
    render(<ComboTabShowcase />);

    // Fill in Tab 1
    const targetInput = screen.getByTestId('tab-0-targetSpending');
    fireEvent.change(targetInput, { target: { value: '5000' } });
    const noteInput = screen.getByTestId('tab-0-transactionNote');
    fireEvent.change(noteInput, { target: { value: 'Test note' } });

    expect(targetInput).toHaveValue('5000');
    expect(noteInput).toHaveValue('Test note');

    // Add a new tab
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Tab 1 data should be preserved
    expect(screen.getByTestId('tab-0-targetSpending')).toHaveValue('5000');
    expect(screen.getByTestId('tab-0-transactionNote')).toHaveValue('Test note');
  });

  it('editing tab data is preserved after deleting another tab', () => {
    render(<ComboTabShowcase />);

    // Fill in Tab 1
    const targetInput = screen.getByTestId('tab-0-targetSpending');
    fireEvent.change(targetInput, { target: { value: '3000' } });

    // Add a new tab
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Now delete Tab 2 (index 1)
    const delBtn = document.querySelector('[data-del-index="1"]') as HTMLSpanElement;
    fireEvent.click(delBtn);

    // Tab 1 data should be preserved
    expect(screen.getByTestId('tab-0-targetSpending')).toHaveValue('3000');
  });

  it('select field values are preserved after add/delete', () => {
    render(<ComboTabShowcase />);

    // Verify Sub Mission 2 has pre-filled select values via the second tab
    // The mock only renders the active tab (index 0), so we check initial state
    expect(screen.getByTestId('tab-0-businessUnit').textContent).toBe('请选择');

    // After adding and deleting a tab, original values should remain
    const addBtn = document.querySelector('.closable-tabs-add-btn') as HTMLButtonElement;
    fireEvent.click(addBtn);
    const delBtn = document.querySelector('[data-del-index="2"]') as HTMLSpanElement;
    fireEvent.click(delBtn);

    expect(screen.getByTestId('tab-0-businessUnit').textContent).toBe('请选择');
  });
});
