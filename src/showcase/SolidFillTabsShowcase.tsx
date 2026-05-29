import React from 'react';
import { AmisLivePreview } from './AmisLivePreview';

const schema = {
  type: 'tabs',
  className: 'custom-solid-fill-tabs',
  tabs: [
    { title: 'Rule Setup', body: { type: 'tpl', tpl: '<div style="padding:24px;color:#5a607a;font-size:14px;">Rule Setup content area. White background, no extra styling.</div>' } },
    { title: 'Display', body: { type: 'tpl', tpl: '<div style="padding:24px;color:#5a607a;font-size:14px;">Display content area. Same white background.</div>' } },
  ],
};

export const SolidFillTabsShowcase: React.FC = () => {
  return <AmisLivePreview schema={schema} />;
};

export default SolidFillTabsShowcase;
