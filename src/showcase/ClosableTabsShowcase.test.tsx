import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClosableTabsShowcase, resetNextIndex } from './ClosableTabsShowcase';

describe('ClosableTabsShowcase', () => {
  beforeEach(() => {
    resetNextIndex(3);
  });

  // === Rendering ===

  it('renders initial tabs "Sub Mission 1" and "Sub Mission 2"', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('Sub Mission 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('renders "+ Add" button after tabs', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('shows tab count indicator "2 / 10 tabs"', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('2 / 10 tabs')).toBeInTheDocument();
  });

  // === Styling ===

  it('first tab is active by default (blue top bar, white bg)', () => {
    render(<ClosableTabsShowcase />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveClass('is-active');
    expect(tab1).toHaveStyle({ borderTop: '4px solid #394DB9', background: '#fff' });
  });

  it('inactive tab has #F9FAFA background', () => {
    render(<ClosableTabsShowcase />);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).not.toHaveClass('is-active');
    expect(tab2).toHaveStyle({ background: '#F9FAFA' });
  });

  it('each tab has a close button (×)', () => {
    render(<ClosableTabsShowcase />);
    const closeButtons = screen.getAllByText('×');
    expect(closeButtons).toHaveLength(2);
  });

  it('close button is 10x10 with gray color and no hover change', () => {
    render(<ClosableTabsShowcase />);
    const closeBtn = screen.getAllByText('×')[0];
    expect(closeBtn).toHaveStyle({
      width: '10px',
      height: '10px',
      color: '#9CA3AF',
      opacity: '0.6',
    });
  });

  it('tab text font-size is 18px', () => {
    render(<ClosableTabsShowcase />);
    const tab1Link = screen.getByText('Sub Mission 1');
    expect(tab1Link).toHaveStyle({ fontSize: '18px' });
  });

  it('tab height is 40px', () => {
    render(<ClosableTabsShowcase />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveStyle({ height: '40px' });
  });

  it('tab padding matches spec: 10px right, 10px top, 10px bottom, 20px left', () => {
    render(<ClosableTabsShowcase />);
    const tab1 = screen.getByText('Sub Mission 1').closest('li');
    expect(tab1).toHaveStyle({ padding: '10px 10px 10px 20px' });
  });

  it('divider line before + Add button is 24px tall', () => {
    render(<ClosableTabsShowcase />);
    const addBtn = screen.getByText('+ Add').closest('li');
    const divider = addBtn?.querySelector('span');
    expect(divider).toHaveStyle({ height: '24px', width: '1px', background: '#e0e0e0' });
  });

  // === Tab switching ===

  it('tab content area shows active tab content', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('Sub Mission 1 content area')).toBeInTheDocument();
  });

  it('clicking inactive tab switches active tab and content', () => {
    render(<ClosableTabsShowcase />);
    fireEvent.click(screen.getByText('Sub Mission 2'));
    expect(screen.getByText('Sub Mission 2 content area')).toBeInTheDocument();
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  // === Adding tabs ===

  it('clicking "+ Add" creates "Sub Mission 3"', () => {
    render(<ClosableTabsShowcase />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
  });

  it('newly added tab becomes active', () => {
    render(<ClosableTabsShowcase />);
    fireEvent.click(screen.getByText('+ Add'));
    const newTab = screen.getByText('Sub Mission 3').closest('li');
    expect(newTab).toHaveClass('is-active');
  });

  it('adding multiple tabs increments the number correctly', () => {
    render(<ClosableTabsShowcase />);
    fireEvent.click(screen.getByText('+ Add'));
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('Sub Mission 3')).toBeInTheDocument();
    expect(screen.getByText('Sub Mission 4')).toBeInTheDocument();
  });

  it('tab count indicator updates when adding tabs', () => {
    render(<ClosableTabsShowcase />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByText('3 / 10 tabs')).toBeInTheDocument();
  });

  // === Removing tabs ===

  it('clicking close button removes the tab', () => {
    render(<ClosableTabsShowcase />);
    const closeBtn = screen.getAllByText('×')[0];
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Sub Mission 1')).not.toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });

  it('closing the active tab switches to another tab', () => {
    render(<ClosableTabsShowcase />);
    const closeBtn = screen.getAllByText('×')[0]; // Close "Sub Mission 1"
    fireEvent.click(closeBtn);
    const tab2 = screen.getByText('Sub Mission 2').closest('li');
    expect(tab2).toHaveClass('is-active');
  });

  it('closing all tabs shows only + Add button', () => {
    render(<ClosableTabsShowcase />);
    const closeBtns = screen.getAllByText('×');
    fireEvent.click(closeBtns[0]);
    const remainingCloseBtns = screen.getAllByText('×');
    fireEvent.click(remainingCloseBtns[0]);
    expect(screen.queryByText('×')).not.toBeInTheDocument();
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  // === Max tabs limit ===

  it('cannot add tabs beyond MAX_TABS (10)', () => {
    render(<ClosableTabsShowcase />);
    // Already 2 tabs, add 8 more = 10
    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByText('+ Add'));
    }
    expect(screen.getByText('Sub Mission 10')).toBeInTheDocument();
    // Try to add one more (11th)
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.queryByText('Sub Mission 11')).not.toBeInTheDocument();
  });

  it('+ Add button is disabled (not-allowed cursor) when max reached', () => {
    render(<ClosableTabsShowcase />);
    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByText('+ Add'));
    }
    const addBtn = screen.getByText('+ Add').closest('li');
    expect(addBtn).toHaveStyle({ cursor: 'not-allowed' });
  });

  it('tab count shows "10 / 10 tabs" at max', () => {
    render(<ClosableTabsShowcase />);
    for (let i = 0; i < 8; i++) {
      fireEvent.click(screen.getByText('+ Add'));
    }
    expect(screen.getByText('10 / 10 tabs')).toBeInTheDocument();
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

  // === Tab bar container ===

  it('tab bar container has #F9FAFA background', () => {
    render(<ClosableTabsShowcase />);
    // The tab bar container is the div with position: relative wrapping the scroll container
    const scrollContainer = document.querySelector('.closable-scroll-container');
    const container = scrollContainer?.parentElement;
    expect(container).toHaveStyle({ background: '#F9FAFA' });
  });
});
