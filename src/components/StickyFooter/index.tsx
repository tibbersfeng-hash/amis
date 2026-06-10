import React from 'react';
import { getComponentI18n } from '@/utils/i18n-config';

interface StickyFooterProps {
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onSave?: () => void;
  disabled?: boolean;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  onCancel,
  onSaveDraft,
  onSave,
  disabled = false,
}) => {
  const t = getComponentI18n();

  return (
    <div className="sticky-footer">
      <div className="footer-inner">
        <button
          className="footer-btn footer-btn--cancel"
          onClick={onCancel}
          disabled={disabled}
        >
          {t.cancel}
        </button>
        <button
          className="footer-btn footer-btn--draft"
          onClick={onSaveDraft}
          disabled={disabled}
        >
          {t.saveDraft}
        </button>
        <button
          className="footer-btn footer-btn--save"
          onClick={onSave}
          disabled={disabled}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
};
