import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

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
        actions: [],
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

/** Read form data from a single tab pane */
function readTabFormData(scope: Element): Record<string, unknown> {
  const formData: Record<string, unknown> = {};
  const formItems = scope.querySelectorAll('.cxd-Form-item');
  const fieldNameMap: Record<string, string> = {
    'Sub Mission Type': 'subMissionType',
    'Business Unit': 'businessUnit',
    'Currency': 'currency',
    'Payment Method': 'paymentMethod',
    'Target Spending': 'targetSpending',
    'Market Code': 'marketCode',
    'Rate Code': 'rateCode',
    'Source': 'source',
    'Room Type': 'roomType',
    'Room Category': 'roomCategory',
    'Registration Award': 'awardType',
    'Award Points': 'awardPoints',
    'Billing Code': 'billingCode',
    '库存数': 'stockQty',
    'Transaction Note': 'transactionNote',
  };
  formItems.forEach((item: Element) => {
    const label = item.querySelector('.cxd-FieldLabel');
    const labelText = label?.textContent?.trim().replace(/\*$/, '') || '';
    const fieldName = fieldNameMap[labelText];
    if (!fieldName) return;

    // Select component
    const select = item.querySelector('.cxd-Select-value');
    if (select) {
      const valueText = select.textContent?.trim();
      if (valueText && valueText !== '请选择') {
        const valueMap: Record<string, string> = {
          'Room Stay Prepaid Booking': 'Room Stay Prepaid Booking',
          'Direct Booking': 'Direct Booking',
          'BU1': 'BU1', 'BU2': 'BU2', 'BU3': 'BU3',
          '积分': '积分', '钻石': '钻石', '金币': '金币',
          'Credit Card': 'Credit Card', 'Cash': 'Cash',
          'Code A': 'A', 'Code B': 'B',
          'Rate 1': 'R1', 'Rate 2': 'R2',
          'Web': 'Web', 'App': 'App', 'Mini Program': 'MiniProgram',
          'Standard': 'Standard', 'Deluxe': 'Deluxe', 'Suite': 'Suite',
          'Cat A': 'A', 'Cat B': 'B',
          'BC-001': 'BC-001', 'BC-002': 'BC-002',
        };
        formData[fieldName] = valueMap[valueText] || valueText;
      }
      return;
    }

    // Radio component
    const radios = item.querySelector('.cxd-Radios');
    if (radios) {
      const checked = radios.querySelector('.cxd-Radio.is-checked');
      if (checked) {
        const valueText = checked.textContent?.trim();
        const valueMap: Record<string, string> = {
          'Award Points': 'points', 'Voucher': 'voucher', 'No Award': 'none',
        };
        formData[fieldName] = valueMap[valueText || ''] || valueText;
      }
      return;
    }

    // Native input
    const input = item.querySelector('input, textarea');
    if (input && (input as HTMLInputElement).value !== undefined && (input as HTMLInputElement).value !== '') {
      formData[fieldName] = (input as HTMLInputElement).value;
    }
  });
  return formData;
}

export const ComboShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemCount, setItemCount] = useState(2);
  const [itemData, setItemData] = useState<Record<string, unknown>[]>([{}, {}]);

  const handleAddItem = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Sync active tab data from DOM before adding
    const activePane = container.querySelector('.cxd-Tabs-pane.is-active');
    if (activePane) {
      const activeData = readTabFormData(activePane);
      const activeLink = container.querySelector('.cxd-Tabs-links .cxd-Tabs-link.is-active a');
      let activeIndex = 0;
      const tabLinks = container.querySelectorAll('.cxd-Tabs-links .cxd-Tabs-link');
      tabLinks.forEach((link, idx) => {
        if (link.querySelector('a') === activeLink) activeIndex = idx;
      });

      setItemData((prev) => {
        const updated = [...prev];
        if (Object.keys(activeData).length > 0) {
          updated[activeIndex] = { ...(prev[activeIndex] || {}), ...activeData };
        }
        return [...updated, createNewItemData()];
      });
    } else {
      setItemData((prev) => [...prev, createNewItemData()]);
    }
    setItemCount((prev) => prev + 1);
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
        <AmisLivePreview schema={currentSchema} />
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
