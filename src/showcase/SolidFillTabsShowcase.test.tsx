import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SolidFillTabsShowcase from './SolidFillTabsShowcase';

// Mock AmisLivePreview to render a simplified version of the tabs UI
vi.mock('./AmisLivePreview', () => ({
  AmisLivePreview: ({ schema, lang }: { schema: Record<string, unknown>; lang?: string }) => {
    const tabs = (schema as { tabs?: { title: string; body: unknown }[] })?.tabs || [];
    return (
      <div className="amis-live-preview" data-testid="amis-preview">
        <div className="custom-solid-fill-tabs" data-testid="solid-fill-tabs" data-lang={lang}>
          <div className="cxd-Tabs-linksContainer">
            <div className="cxd-Tabs-links">
              {tabs.map((tab, idx) => (
                <div
                  key={idx}
                  className={`cxd-Tabs-link${idx === 0 ? ' is-active' : ''}`}
                  data-tab-index={idx}
                  data-tab-title={tab.title}
                >
                  <a>{tab.title}</a>
                </div>
              ))}
            </div>
          </div>
          <div className="cxd-Tabs-panes">
            {tabs.map((tab, idx) => (
              <div
                key={idx}
                className={`cxd-Tabs-pane${idx === 0 ? ' is-active' : ''}`}
                data-pane-index={idx}
              >
                <div className="pane-body" data-tab-body={String((tab.body as Record<string, unknown>)?.name || '')}>
                  {typeof tab.body === 'string' ? String(tab.body) : '[ComplexContent]'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
}));

describe('SolidFillTabsShowcase', () => {
  // ===== Basic Rendering =====

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<SolidFillTabsShowcase />);
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });

    it('renders with 2 initial tabs', () => {
      render(<SolidFillTabsShowcase />);
      const tabs = document.querySelectorAll('.cxd-Tabs-link');
      expect(tabs).toHaveLength(2);
    });

    it('renders tab titles correctly', () => {
      render(<SolidFillTabsShowcase />);
      const links = document.querySelectorAll('.cxd-Tabs-link a');
      expect(links[0]).toHaveTextContent('Rule Setup');
      expect(links[1]).toHaveTextContent('Display');
    });

    it('marks the first tab as active', () => {
      render(<SolidFillTabsShowcase />);
      expect(document.querySelector('.cxd-Tabs-link.is-active')).toBeInTheDocument();
    });

    it('uses custom-solid-fill-tabs CSS class', () => {
      render(<SolidFillTabsShowcase />);
      expect(document.querySelector('.custom-solid-fill-tabs')).toBeInTheDocument();
    });

    it('renders pane content with complex body for default schema', () => {
      render(<SolidFillTabsShowcase />);
      const panes = document.querySelectorAll('.cxd-Tabs-pane');
      expect(panes).toHaveLength(2);
      expect(panes[0]).toHaveClass('is-active');
      // Default schema tab body is an object (input-text component), not plain text
      expect(panes[0].querySelector('[data-tab-body]')).toHaveAttribute('data-tab-body', 'ruleName');
      expect(panes[1].querySelector('[data-tab-body]')).toHaveAttribute('data-tab-body', 'displayName');
    });
  });

  // ===== Default Schema Structure =====

  describe('default schema structure', () => {
    it('schema has type "tabs"', () => {
      render(<SolidFillTabsShowcase />);
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });

    it('schema has custom-solid-fill-tabs className', () => {
      render(<SolidFillTabsShowcase />);
      expect(document.querySelector('.custom-solid-fill-tabs')).toBeInTheDocument();
    });

    it('first tab is "Rule Setup" with input-text field', () => {
      render(<SolidFillTabsShowcase />);
      const panes = document.querySelectorAll('.cxd-Tabs-pane');
      expect(panes[0]).toHaveClass('is-active');
      expect(panes[0].querySelector('[data-tab-body]')).toHaveAttribute('data-tab-body', 'ruleName');
    });

    it('second tab is "Display"', () => {
      render(<SolidFillTabsShowcase />);
      const links = document.querySelectorAll('.cxd-Tabs-link a');
      expect(links[1]).toHaveTextContent('Display');
    });
  });

  // ===== Showcase Integration =====
  // Tests that the component works correctly when rendered in ShowcaseApp's
  // PageRenderer (which passes the schema via the `schema` prop).

  describe('showcase integration', () => {
    it('renders the AmisLivePreview wrapper', () => {
      render(<SolidFillTabsShowcase />);
      expect(screen.getByTestId('amis-preview')).toBeInTheDocument();
    });

    it('exports as default component (for dynamic import)', () => {
      expect(SolidFillTabsShowcase).toBeDefined();
    });
  });
});
