import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmisLivePreview, AmisLivePreviewRef } from './AmisLivePreview';

const FORM_TEMPLATE = {
  type: 'form',
  data: {
    subMissionType: 'Room Stay Prepaid Booking',
    businessUnit: '',
    currency: '',
    paymentMethod: '',
    targetSpending: '',
    marketCode: '',
    rateCode: '',
    source: '',
    roomType: '',
    roomCategory: '',
    awardType: 'points',
    awardPoints: '',
    billingCode: '',
    stockQty: '',
    transactionNote: '',
  },
  body: [
    { type: 'select', name: 'subMissionType', label: 'Sub Mission Type', required: true, options: [{ label: 'Room Stay Prepaid Booking', value: 'Room Stay Prepaid Booking' }, { label: 'Direct Booking', value: 'Direct Booking' }] },
    { type: 'select', name: 'businessUnit', label: 'Business Unit', required: true, options: [{ label: 'BU1', value: 'BU1' }, { label: 'BU2', value: 'BU2' }, { label: 'BU3', value: 'BU3' }] },
    { type: 'input-text', name: 'targetSpending', label: 'Target Spending' },
    { type: 'select', name: 'currency', label: 'Currency', options: [{ label: '积分', value: '积分' }, { label: '钻石', value: '钻石' }, { label: '金币', value: '金币' }] },
    { type: 'select', name: 'paymentMethod', label: 'Payment Method', options: [{ label: 'Credit Card', value: 'Credit Card' }, { label: 'Cash', value: 'Cash' }] },
    { type: 'select', name: 'marketCode', label: 'Market Code', options: [{ label: 'Code A', value: 'A' }, { label: 'Code B', value: 'B' }] },
    { type: 'select', name: 'rateCode', label: 'Rate Code', options: [{ label: 'Rate 1', value: 'R1' }, { label: 'Rate 2', value: 'R2' }] },
    { type: 'select', name: 'source', label: 'Source', options: [{ label: 'Web', value: 'Web' }, { label: 'App', value: 'App' }, { label: 'Mini Program', value: 'MiniProgram' }] },
    { type: 'select', name: 'roomType', label: 'Room Type', options: [{ label: 'Standard', value: 'Standard' }, { label: 'Deluxe', value: 'Deluxe' }, { label: 'Suite', value: 'Suite' }] },
    { type: 'select', name: 'roomCategory', label: 'Room Category', options: [{ label: 'Cat A', value: 'A' }, { label: 'Cat B', value: 'B' }] },
    { type: 'radios', name: 'awardType', label: 'Registration Award', options: [{ label: 'Award Points', value: 'points' }, { label: 'Voucher', value: 'voucher' }, { label: 'No Award', value: 'none' }] },
    { type: 'input-text', name: 'awardPoints', label: 'Award Points' },
    { type: 'select', name: 'billingCode', label: 'Billing Code', options: [{ label: 'BC-001', value: 'BC-001' }, { label: 'BC-002', value: 'BC-002' }] },
    { type: 'input-text', name: 'stockQty', label: '库存数' },
    { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
  ],
  actions: [{ type: 'submit', label: '提交', level: 'primary' }],
};

/** Build tabs schema with N items, each containing the form template */
function buildSchema(itemCount: number, itemData: Record<string, unknown>[]) {
  const tabs: Record<string, unknown>[] = [];
  for (let i = 0; i < itemCount; i++) {
    const formData = { title: `Sub Mission ${i + 1}`, ...FORM_TEMPLATE.data };
    if (itemData[i]) {
      Object.assign(formData, itemData[i]);
    }
    tabs.push({
      title: `Sub Mission ${i + 1}`,
      closable: true,
      body: {
        type: 'form',
        data: formData,
        body: FORM_TEMPLATE.body,
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      },
    });
  }
  return {
    type: 'tabs',
    className: 'custom-combo-tabs',
    tabs,
  };
}

function createNewItemData(): Record<string, unknown> {
  return {};
}

export const ComboShowcase: React.FC<{ schema: Record<string, unknown> }> = ({ schema }) => {
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemCount, setItemCount] = useState(2);
  const [itemData, setItemData] = useState<Record<string, unknown>[]>([{}, {}]);

  const handleAddItem = useCallback(() => {
    setItemCount((prev) => prev + 1);
    setItemData((prev) => [...prev, createNewItemData()]);
  }, []);

  // Watch for item removal — sync when Amis removes an item
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const tabs = container.querySelectorAll('.custom-combo-tabs .cxd-Tabs-linksContainer .cxd-Tabs-link');
        const currentItemCount = tabs.length;
        if (currentItemCount < itemCount && currentItemCount > 0) {
          setItemCount(currentItemCount);
          setItemData((prev) => prev.slice(0, currentItemCount));
        }
      }, 200);
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [itemCount]);

  const currentSchema = buildSchema(itemCount, itemData);

  return (
    <div className="combo-showcase">
      <div className="combo-preview" ref={containerRef}>
        <AmisLivePreview ref={previewRef} schema={currentSchema as Record<string, unknown>} />
        {itemCount < 10 && (
          <button className="closable-tabs-add-btn" onClick={handleAddItem} type="button">
            <span className="add-icon">+</span>
            <span>Add Sub Mission</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ComboShowcase;
