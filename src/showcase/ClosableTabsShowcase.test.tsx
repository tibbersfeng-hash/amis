import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClosableTabsShowcase } from './ClosableTabsShowcase';

describe('ClosableTabsShowcase (Amis-driven)', () => {
  it('renders closable tabs via Amis schema', () => {
    render(<ClosableTabsShowcase />);
    expect(screen.getByText('Sub Mission 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Mission 2')).toBeInTheDocument();
  });
});
