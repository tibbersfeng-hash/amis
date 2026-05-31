import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComboShowcase, { buildSchema, readTabFormData } from './ComboShowcase';

// Mock AmisLivePreview to render a simple DOM structure
vi.mock('./AmisLivePreview', () => ({
  AmisLivePreview: ({ schema }: { schema: Record<string, unknown> }) => {
    const tabsSchema = schema as { tabs: { title: string; body?: { data?: Record<string, unknown> } }[] };
    return (
      <div className="amis-live-preview" data-testid="amis-preview">
        <div className="custom-combo-tabs">
          <div className="cxd-Tabs-linksContainer">
            <div className="cxd-Tabs-links" data-tab-count={tabsSchema.tabs?.length || 0}>
              {tabsSchema.tabs?.map((tab, idx) => (
                <div key={idx} className="cxd-Tabs-link" data-tab-title={tab.title}>
                  <a>{tab.title}</a>
                  <div className="cxd-Tabs-link-close" data-testid={`close-${idx}`}>×</div>
                </div>
              ))}
            </div>
          </div>
          <div className="cxd-Tabs-content">
            {tabsSchema.tabs?.map((tab, idx) => (
              <div key={idx} className={`cxd-Tabs-pane${idx === 0 ? ' is-active' : ''}`}>
                <div className="cxd-Form-item">
                  <div className="cxd-FieldLabel">{tab.title}</div>
                  <input name={`input-${idx}`} defaultValue={String(tab.body?.data?.targetSpending || '')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
}));

describe('ComboShowcase', () => {
  it('renders with 2 initial items', () => {
    render(<ComboShowcase />);
    const tabs = document.querySelector('.cxd-Tabs-links');
    expect(tabs?.getAttribute('data-tab-count')).toBe('2');
  });

  it('shows the add button when items < 10', () => {
    render(<ComboShowcase />);
    expect(screen.getByText('Add Sub Mission')).toBeInTheDocument();
  });

  it('adds a new item when clicking the add button', () => {
    render(<ComboShowcase />);
    const addBtn = screen.getByText('Add Sub Mission');
    fireEvent.click(addBtn);
    const tabs = document.querySelector('.cxd-Tabs-links');
    expect(tabs?.getAttribute('data-tab-count')).toBe('3');
  });

  it('hides the add button when items reach 10', () => {
    render(<ComboShowcase />);
    const addBtn = screen.getByText('Add Sub Mission');
    for (let i = 0; i < 8; i++) {
      fireEvent.click(addBtn);
    }
    expect(screen.queryByText('Add Sub Mission')).not.toBeInTheDocument();
  });

  it('preserves all existing items when adding a new item', () => {
    render(<ComboShowcase />);
    const addBtn = screen.getByText('Add Sub Mission');
    fireEvent.click(addBtn);
    const tabs = document.querySelector('.cxd-Tabs-links');
    expect(tabs?.getAttribute('data-tab-count')).toBe('3');
    // Verify all 3 tab titles exist
    expect(document.querySelectorAll('[data-tab-title]')).toHaveLength(3);
  });

  it('preserves all existing items when adding multiple items', () => {
    render(<ComboShowcase />);
    const addBtn = screen.getByText('Add Sub Mission');
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    const tabs = document.querySelector('.cxd-Tabs-links');
    expect(tabs?.getAttribute('data-tab-count')).toBe('5');
  });
});

describe('buildSchema', () => {
  it('generates tabs from items array', () => {
    const schema = buildSchema([{ targetSpending: '100' }, { targetSpending: '200' }]);
    expect(schema.type).toBe('tabs');
    expect(schema.tabs).toHaveLength(2);
    expect(schema.tabs[0].title).toBe('Sub Mission 1');
    expect(schema.tabs[1].title).toBe('Sub Mission 2');
  });

  it('merges item data with form template defaults', () => {
    const schema = buildSchema([{ businessUnit: 'BU1' }, {}]);
    const tab0Data = (schema.tabs[0].body as any).data;
    expect(tab0Data.businessUnit).toBe('BU1');
    expect(tab0Data.subMissionType).toBe('Room Stay Prepaid Booking');
  });

  it('uses template defaults for empty items', () => {
    const schema = buildSchema([{}, {}]);
    const tab0Data = (schema.tabs[0].body as any).data;
    expect(tab0Data.subMissionType).toBe('Room Stay Prepaid Booking');
    expect(tab0Data.awardType).toBe('points');
  });
});

describe('readTabFormData', () => {
  it('reads select values from DOM', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Business Unit</div>
        <div class="cxd-Select"><div class="cxd-Select-value">BU2</div></div>
      </div>
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Currency</div>
        <div class="cxd-Select"><div class="cxd-Select-value">钻石</div></div>
      </div>
    `;
    const data = readTabFormData(container);
    expect(data.businessUnit).toBe('BU2');
    expect(data.currency).toBe('钻石');
  });

  it('reads radio values from DOM', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Registration Award</div>
        <div class="cxd-Radios"><div class="cxd-Radio is-checked">Voucher</div></div>
      </div>
    `;
    const data = readTabFormData(container);
    expect(data.awardType).toBe('voucher');
  });

  it('reads native input values from DOM', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Target Spending</div>
        <input value="5000" />
      </div>
    `;
    const data = readTabFormData(container);
    expect(data.targetSpending).toBe('5000');
  });

  it('ignores "请选择" placeholder values', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Business Unit</div>
        <div class="cxd-Select"><div class="cxd-Select-value">请选择</div></div>
      </div>
    `;
    const data = readTabFormData(container);
    expect(data.businessUnit).toBeUndefined();
  });

  it('ignores fields not in the field name map', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="cxd-Form-item">
        <div class="cxd-FieldLabel">Unknown Field</div>
        <div class="cxd-Select"><div class="cxd-Select-value">value</div></div>
      </div>
    `;
    const data = readTabFormData(container);
    expect(Object.keys(data)).toHaveLength(0);
  });
});
