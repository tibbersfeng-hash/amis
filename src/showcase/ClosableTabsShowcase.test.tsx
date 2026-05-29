import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClosableTabsShowcase, resetNextIndex } from './ClosableTabsShowcase';

describe('ClosableTabsShowcase', () => {
  beforeEach(() => {
    resetNextIndex(3);
  });

  // === Rendering ===

  it('renders initial tabs with default props', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('renders initial tabs with custom titlePrefix', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    expect(screen.getByText('Sub Mission 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('renders "+ Add" button after tabs', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('shows tab count indicator with custom maxTabs', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} maxTabs={5} />);
    expect(screen.getByText('2 / 5 tabs')).toBeInTheDocument();
  });

  // === Styling ===

  it('first tab is active by default (blue top bar, white bg)', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveClass('is-active');
    expect(tab1).toHaveStyle({ borderTop: '4px solid #394DB9', background: '#fff' });
  });

  it('inactive tab has #F9FAFA background', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).not.toHaveClass('is-active');
    expect(tab2).toHaveStyle({ background: '#F9FAFA' });
  });

  it('each tab has a close button (×)', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const closeButtons = screen.getAllByText('×');
    expect(closeButtons).toHaveLength(2);
  });

  it('close button is 10x10 with gray color', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const closeBtn = screen.getAllByText('×')[0];
    expect(closeBtn).toHaveStyle({
      width: '10px',
      height: '10px',
      color: '#9CA3AF',
      opacity: '0.6',
    });
  });

  it('tab text font-size is 18px', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const tab1Link = screen.getByText('Sub Mission 1');
    expect(tab1Link).toHaveStyle({ fontSize: '18px' });
  });

  it('tab height is 40px', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveStyle({ height: '40px' });
  });

  // === Tab switching ===

  it('clicking inactive tab switches active tab', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    fireEvent.click(screen.getByText('Sub Mission 2'));
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  // === Adding tabs ===

  it('clicking "+ Add" creates tab with titlePrefix', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
  });

  it('clicking "+ Add" with custom prefix creates correct title', () => {
    render(<ClosableTabsShowcase titlePrefix="Custom Tab" tabs={['Custom Tab 1', 'Custom Tab 2']} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Custom Tab 3')).toBeInTheDocument();
  });

  it('newly added tab becomes active', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    fireEvent.click(screen.getByText('+ Add'));
    const newTab = screen.getByText('Sub Mission 3').closest('li');
    expect(newTab).toHaveClass('is-active');
  });

  it('tab count indicator updates when adding tabs', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('3 / 10 tabs')).toBeInTheDocument();
  });

  // === Removing tabs ===

  it('clicking close button removes the tab', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const closeBtn = screen.getAllByText('×')[0];
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Sub Mission 1')).not.toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('closing the active tab switches to another tab', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} />);
    const closeBtn = screen.getAllByText('×')[0];
    fireEvent.click(closeBtn);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  // === Max tabs limit ===

  it('cannot add tabs beyond maxTabs', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} maxTabs={3} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
    // Try to add one more (4th)
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.queryByText('Sub Mission 4')).not.toBeInTheDocument();
  });

  it('+ Add button is disabled (not-allowed cursor) when max reached', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} maxTabs={2} />);
    const addBtn = screen.getByText('+ Add').closest('li');
    expect(addBtn).toHaveStyle({ cursor: 'not-allowed' });
  });

  it('tab count shows max correctly at limit', () => {
    render(<ClosableTabsShowcase titlePrefix="Sub Mission" tabs={['Sub Mission 1', 'Sub Mission 2']} maxTabs={2} />);
    expect(screen.getByText('2 / 2 tabs')).toBeInTheDocument();
  });

  // === Scroll ===

  it('scroll container has overflow-x auto', () => {
    render(<ClosableTabsShowcase />);
    const scrollContainer = document.querySelector('.closable-scroll-container');
    expect(scrollContainer).toHaveStyle({ overflowX: 'auto' });
  });

  it('scroll container hides scrollbar', () => {
    render(<ClosableTabsShowcase />);
    const scrollContainer = document.querySelector('.closable-scroll-container');
    expect(scrollContainer).toHaveStyle({ overflowY: 'hidden' });
  });
});
