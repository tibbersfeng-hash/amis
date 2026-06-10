import React from 'react';
import { Loading, ErrorDisplay } from './index';
import { getComponentI18n } from '@/utils/i18n-config';

const LoadingShowcase: React.FC = () => {
  const t = getComponentI18n();

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Loading (default)</div>
          <Loading />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Loading (custom message)</div>
          <Loading message="正在加载配置..." />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">ErrorDisplay</div>
          <ErrorDisplay message="Failed to load page: mission" />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Current default loading text</div>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.loading}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingShowcase;
