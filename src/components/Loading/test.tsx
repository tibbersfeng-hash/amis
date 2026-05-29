import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, ErrorDisplay } from './index';
import { setComponentLanguage } from '../../utils/i18n-config';

describe('Loading', () => {
  it('renders spinner with default loading text', () => {
    setComponentLanguage('en');
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('renders custom message when provided', () => {
    render(<Loading message="Custom loading..." />);
    expect(screen.getByText('Custom loading...')).toBeDefined();
  });

  it('renders zh text when language is zh', () => {
    setComponentLanguage('zh');
    render(<Loading />);
    expect(screen.getByText('加载中...')).toBeDefined();
  });
});

describe('ErrorDisplay', () => {
  it('renders error message', () => {
    render(<ErrorDisplay message="Network error" />);
    expect(screen.getByText('Network error')).toBeDefined();
  });

  it('renders with danger color', () => {
    const { container } = render(<ErrorDisplay message="Error" />);
    const el = container.querySelector('[style*="color: #E84545"]');
    expect(el).toBeDefined();
  });
});
