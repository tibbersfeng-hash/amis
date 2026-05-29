import React from 'react';
import { AmisLivePreview } from './AmisLivePreview';

const schema = {
  type: 'tabs',
  className: 'custom-solid-fill-tabs',
  tabs: [
    { title: 'Rule Setup', body: { type: 'input-text', name: 'ruleName', label: '规则名称', placeholder: '请输入规则名称' } },
    { title: 'Display', body: { type: 'input-text', name: 'displayName', label: '显示名称', placeholder: '请输入显示名称' } },
  ],
};

export const SolidFillTabsShowcase: React.FC = () => {
  return <AmisLivePreview schema={schema} />;
};

export default SolidFillTabsShowcase;
