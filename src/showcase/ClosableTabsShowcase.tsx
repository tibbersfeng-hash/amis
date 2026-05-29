import React from 'react';
import { AmisLivePreview } from './AmisLivePreview';

/**
 * Closable Tabs — driven entirely by Amis schema.
 * Tab titles, closable flag, add button text, and max tabs are all configurable in JSON.
 */
const schema = {
  type: 'tabs',
  className: 'custom-closable-tabs',
  addable: true,
  addBtnText: '+ Add',
  maxTabs: 10,
  tabs: [
    { title: 'Sub Mission 1', closable: true, body: { type: 'tpl', tpl: '<div style="padding:12px;">Sub Mission 1 content area</div>' } },
    { title: 'Sub Mission 2', closable: true, body: { type: 'tpl', tpl: '<div style="padding:12px;">Sub Mission 2 content area</div>' } },
  ],
};

export const ClosableTabsShowcase: React.FC = () => {
  return <AmisLivePreview schema={schema} />;
};

export default ClosableTabsShowcase;
