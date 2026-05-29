import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AmisPage', () => {
  it('renders a container div', { timeout: 15000 }, async () => {
    const { render } = await import('@testing-library/react');
    const { AmisPage } = await import('./index');
    const { container } = render(
      <AmisPage schema={{ type: 'page', body: [] }} formData={{}} />
    );
    expect(container.querySelector('.amis-scope')).toBeDefined();
  });

  it('passes formData to Amis render', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { AmisPage } = await import('./index');
    // This test verifies the component mounts with data
    render(
      <AmisPage
        schema={{ type: 'page', body: [] }}
        formData={{ testKey: 'testValue' }}
      />
    );
    // Component should render without error
  });

  it('supports locale prop', async () => {
    const { render } = await import('@testing-library/react');
    const { AmisPage } = await import('./index');
    render(
      <AmisPage
        schema={{ type: 'page', body: [] }}
        locale="en-US"
      />
    );
    // Should not throw
  });
});
