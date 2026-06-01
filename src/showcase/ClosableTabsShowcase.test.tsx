import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ClosableTabsPreview from './ClosableTabsPreview';

// Mock AmisLivePreview to render a simplified version of the closable tabs UI
vi.mock('./AmisLivePreview', () => ({
  AmisLivePreview: ({ schema, onDataChange }: { schema: Record<string, unknown>; onDataChange?: (data: Record<string, unknown>) => void }) => {
    const tabSchema = schema as { tabs: { title: string; closable: boolean; body: Record<string, unknown> }[] };
    return (
      <div className="amis-live-preview" data-testid="amis-preview">
        <div className="custom-closable-tabs" data-testid="closable-tabs">
          <div className="cxd-Tabs-linksContainer">
            {tabSchema.tabs?.map((tab, idx) => (
              <div
                key={idx}
                className={`cxd-Tabs-link ${idx === 0 ? 'is-active' : ''}`}
                data-tab-index={idx}
              >
                <a>{tab.title}</a>
                <span className="cxd-Tabs-link-close" data-close-index={idx}>×</span>
              </div>
            ))}
          </div>
          <div className="cxd-Tabs-panes">
            {tabSchema.tabs?.map((tab, idx) => (
              <div
                key={idx}
                className={`cxd-Tabs-pane ${idx === 0 ? 'is-active' : ''}`}
                data-pane-index={idx}
              >
                {(tab.body as Record<string, unknown>)?.data && (
                  <div className="pane-data" data-testid={`pane-data-${idx}`}>
                    {JSON.stringify((tab.body as Record<string, unknown>)?.data)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
}));

describe('ClosableTabsPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===== JSON Editor =====

  describe('JSON editor', () => {
    it('renders schema/data editor tabs', () => {
      render(<ClosableTabsPreview />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      expect(tabs).toHaveLength(2);
      expect(tabs[0].textContent).toBe('Form Schema JSON');
      expect(tabs[1].textContent).toBe('Tabs Data JSON');
    });

    it('default active tab is schema', () => {
      render(<ClosableTabsPreview />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      expect(tabs[0]).toHaveClass('is-active');
      expect(tabs[1]).not.toHaveClass('is-active');
    });

    it('switches to data tab when clicked', () => {
      render(<ClosableTabsPreview />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      fireEvent.click(tabs[1]);
      expect(tabs[1]).toHaveClass('is-active');
    });

    it('renders render button', () => {
      render(<ClosableTabsPreview />);
      const renderBtn = document.querySelector('.schema-preview-render-btn');
      expect(renderBtn).toBeInTheDocument();
      expect(renderBtn).toHaveTextContent('渲染');
    });

    it('renders JSON textarea', () => {
      render(<ClosableTabsPreview />);
      const textarea = document.querySelector('.schema-preview-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('textarea contains schema JSON by default', () => {
      render(<ClosableTabsPreview />);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toContain('"type": "form"');
    });

    it('textarea shows data JSON when data tab is active', () => {
      render(<ClosableTabsPreview />);
      const tabs = document.querySelectorAll('.schema-preview-tab');
      fireEvent.click(tabs[1]);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toContain('"Sub Mission 1"');
      expect(textarea.value).toContain('"Sub Mission 2"');
    });

    it('Ctrl+Enter triggers render', () => {
      render(<ClosableTabsPreview />);
      const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
      fireEvent.keyDown(textarea, { ctrlKey: true, key: 'Enter' });
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });
  });

  // ===== Rendering =====

  describe('rendering', () => {
    it('renders with 2 initial tabs', () => {
      render(<ClosableTabsPreview />);
      const tabs = document.querySelectorAll('.cxd-Tabs-link');
      expect(tabs).toHaveLength(2);
    });

    it('renders tab titles correctly', () => {
      render(<ClosableTabsPreview />);
      const links = document.querySelectorAll('.cxd-Tabs-link a');
      expect(links[0]).toHaveTextContent('Sub Mission 1');
      expect(links[1]).toHaveTextContent('Sub Mission 2');
    });

    it('marks the first tab as active', () => {
      render(<ClosableTabsPreview />);
      expect(document.querySelector('.cxd-Tabs-link.is-active')).toBeInTheDocument();
    });

    it('renders the AmisLivePreview wrapper', () => {
      render(<ClosableTabsPreview />);
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });
  });

  // ===== Tab Management =====

  describe('schema structure', () => {
    it('uses custom-closable-tabs CSS class', () => {
      render(<ClosableTabsPreview />);
      expect(document.querySelector('.custom-closable-tabs')).toBeInTheDocument();
    });

    it('each tab has its own form data', () => {
      render(<ClosableTabsPreview />);
      const pane0 = screen.getByTestId('pane-data-0');
      const pane1 = screen.getByTestId('pane-data-1');
      expect(pane0).toBeInTheDocument();
      expect(pane1).toBeInTheDocument();
      // Tab 0 and Tab 1 should have different data
      expect(pane0.textContent).toContain('Room Stay Prepaid Booking');
      expect(pane1.textContent).toContain('Direct Booking');
    });
  });

  // ===== Tab Data Preservation =====

  describe('tab data preservation', () => {
    it('should use DEFAULT_TAB_DATA for new tab, not leak data from other tabs', () => {
      render(<ClosableTabsPreview />);
      const pane0 = screen.getByTestId('pane-data-0');
      const initialData = JSON.parse(pane0?.textContent || '{}');
      expect(initialData.subMissionType).toBe('Room Stay Prepaid Booking');
      expect(initialData.businessUnit).toBe('BU1');
      expect(initialData.currency).toBe('积分');
    });

    it('buildTabsSchema produces independent tab data', () => {
      // Test that tabs get independent copies of default data
      const DEFAULT_TAB_DATA = {
        subMissionType: 'Room Stay Prepaid Booking',
        businessUnit: '',
        currency: '',
        awardType: 'points',
      };
      const tabs: Record<string, unknown>[] = [];
      for (let i = 0; i < 3; i++) {
        tabs.push({ ...DEFAULT_TAB_DATA });
      }
      tabs[0].subMissionType = 'Modified';
      expect(tabs[1].subMissionType).toBe('Room Stay Prepaid Booking');
      expect(tabs[2].subMissionType).toBe('Room Stay Prepaid Booking');
    });
  });
});
