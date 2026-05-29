import React from 'react';
import { getComponentI18n } from '../../utils/i18n-config';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message }) => {
  const t = getComponentI18n();
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div style={{ fontSize: 14, color: '#666' }}>{message ?? t.loading}</div>
    </div>
  );
};

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="loading-overlay">
      <div style={{ fontSize: 24 }}>⚠️</div>
      <div style={{ fontSize: 14, color: '#E84545' }}>{message}</div>
    </div>
  );
};
