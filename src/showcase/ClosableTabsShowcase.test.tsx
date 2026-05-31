import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClosableTabsShowcase } from './ClosableTabsShowcase';

const defaultSchema = {
  type: 'tabs',
  className: 'custom-closable-tabs',
  addable: true,
  addBtnText: '+ Add',
  max: 10,
  tabs: [
    { title: 'Sub Mission 1', closable: true, body: { type: 'tpl', tpl: 'Content 1' } },
    { title: 'Sub Mission 2', closable: true, body: { type: 'tpl', tpl: 'Content 2' } },
  ],
};

describe('ClosableTabsShowcase (native Amis)', () => {
  it('renders without crashing', () => {
    const { container } = render(<ClosableTabsShowcase schema={defaultSchema} />);
    expect(container.querySelector('.custom-closable-tabs')).toBeInTheDocument();
  });

  it('renders the AmisLivePreview wrapper', () => {
    const { container } = render(<ClosableTabsShowcase schema={defaultSchema} />);
    expect(container.querySelector('.amis-live-preview')).toBeInTheDocument();
  });

  it('passes schema to AmisLivePreview', () => {
    const { container } = render(<ClosableTabsShowcase schema={defaultSchema} />);
    // Amis renders the tabs container with the custom className
    expect(container.querySelector('.custom-closable-tabs .cxd-Tabs-linksContainer')).toBeInTheDocument();
  });
});
