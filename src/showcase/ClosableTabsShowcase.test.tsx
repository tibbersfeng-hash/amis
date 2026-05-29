import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClosableTabsShowcase, resetNextIndex } from './ClosableTabsShowcase';

const defaultSchema = {
  type: 'tabs',
  className: 'custom-closable-tabs',
  addable: true,
  addBtnText: '+ Add',
  maxTabs: 10,
  titlePrefix: 'Sub Mission',
  tabs: [
    { title: 'Sub Mission 1', closable: true, body: 'Content 1' },
    { title: 'Sub Mission 2', closable: true, body: 'Content 2' },
  ],
};

const minimalSchema = {
  type: 'tabs',
  className: 'custom-closable-tabs',
  tabs: [
    { title: 'Tab 1', body: 'Content 1' },
    { title: 'Tab 2', body: 'Content 2' },
  ],
};

describe('ClosableTabsShowcase', () => {
  beforeEach(() => {
    resetNextIndex(3);
  });

  // === Rendering ===

  it('renders initial tabs from schema', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    expect(screen.getByText('Sub Mission 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('uses defaults when schema has no optional fields', () => {
    render(<ClosableTabsShowcase schema={minimalSchema} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('renders "+ Add" button', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('shows tab count indicator with schema maxTabs', () => {
    render(<ClosableTabsShowcase schema={{ ...defaultSchema, maxTabs: 5 }} />);
    expect(screen.getByText('2 / 5 tabs')).toBeInTheDocument();
  });

  // === Styling ===

  it('first tab is active by default (blue top bar, white bg)', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveClass('is-active');
    expect(tab1).toHaveStyle({ borderTop: '4px solid #394DB9', background: '#fff' });
  });

  it('inactive tab has #F9FAFA background', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).not.toHaveClass('is-active');
    expect(tab2).toHaveStyle({ background: '#F9FAFA' });
  });

  it('each tab has a close button (×)', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const closeButtons = screen.getAllByText('×');
    expect(closeButtons).toHaveLength(2);
  });

  it('close button is 10x10 with gray color', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const closeBtn = screen.getAllByText('×')[0];
    expect(closeBtn).toHaveStyle({
      width: '10px',
      height: '10px',
      color: '#9CA3AF',
      opacity: '0.6',
    });
  });

  it('tab text font-size is 18px', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const tab1Link = screen.getByText('Sub Mission 1');
    expect(tab1Link).toHaveStyle({ fontSize: '18px' });
  });

  it('tab height is 40px', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveStyle({ height: '40px' });
  });

  // === Tab switching ===

  it('clicking inactive tab switches active tab', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    fireEvent.click(screen.getByText('Sub Mission 2'));
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  // === Adding tabs ===

  it('clicking "+ Add" creates tab with titlePrefix from schema', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
  });

  it('clicking "+ Add" with custom prefix creates correct title', () => {
    render(<ClosableTabsShowcase schema={{ ...defaultSchema, titlePrefix: 'Custom Tab' }} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Custom Tab 3')).toBeInTheDocument();
  });

  it('newly added tab becomes active', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    fireEvent.click(screen.getByText('+ Add'));
    const newTab = screen.getByText('Sub Mission 3').closest('li');
    expect(newTab).toHaveClass('is-active');
  });

  it('tab count indicator updates when adding tabs', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('3 / 10 tabs')).toBeInTheDocument();
  });

  // === Removing tabs ===

  it('clicking close button removes the tab', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const closeBtn = screen.getAllByText('×')[0];
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Sub Mission 1')).not.toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('closing the active tab switches to another tab', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const closeBtn = screen.getAllByText('×')[0];
    fireEvent.click(closeBtn);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  // === Max tabs limit ===

  it('cannot add tabs beyond schema maxTabs', () => {
    render(<ClosableTabsShowcase schema={{ ...defaultSchema, maxTabs: 3 }} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
    // Try to add one more (4th)
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.queryByText('Sub Mission 4')).not.toBeInTheDocument();
  });

  it('+ Add button is disabled (not-allowed cursor) when max reached', () => {
    render(<ClosableTabsShowcase schema={{ ...defaultSchema, maxTabs: 2 }} />);
    const addBtn = screen.getByText('+ Add').closest('li');
    expect(addBtn).toHaveStyle({ cursor: 'not-allowed' });
  });

  it('tab count shows max correctly at limit', () => {
    render(<ClosableTabsShowcase schema={{ ...defaultSchema, maxTabs: 2 }} />);
    expect(screen.getByText('2 / 2 tabs')).toBeInTheDocument();
  });

  // === Scroll ===

  it('scroll container has overflow-x auto', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const scrollContainer = document.querySelector('.closable-scroll-container');
    expect(scrollContainer).toHaveStyle({ overflowX: 'auto' });
  });

  it('scroll container hides scrollbar', () => {
    render(<ClosableTabsShowcase schema={defaultSchema} />);
    const scrollContainer = document.querySelector('.closable-scroll-container');
    expect(scrollContainer).toHaveStyle({ overflowY: 'hidden' });
  });
});
