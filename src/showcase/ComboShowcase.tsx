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
export function buildSchema(items: Record<string, unknown>[]) {
  const tabs: Record<string, unknown>[] = [];
  for (let i = 0; i < items.length; i++) {
    const formData = { ...FORM_TEMPLATE.data };
    if (items[i]) {
      Object.assign(formData, items[i]);
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

/** Read form data from a single tab pane */
export function readTabFormData(scope: Element): Record<string, unknown> {
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
        formData[fieldName] = valueText;
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

/**
 * Sync ALL tab data from DOM.
 * Amis only mounts the active tab pane, so we must click through each tab
 * to mount its DOM, read the data, then restore the original active tab.
 */
async function syncAllTabsData(container: Element, items: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  const tabLinks = container.querySelectorAll('.custom-combo-tabs .cxd-Tabs-links .cxd-Tabs-link');
  const totalCount = tabLinks.length;
  if (totalCount === 0) return items;

  // Find originally active tab index
  const activeLink = container.querySelector('.custom-combo-tabs .cxd-Tabs-links .cxd-Tabs-link.is-active a');
  let originalIndex = 0;
  tabLinks.forEach((link, idx) => {
    if (link.querySelector('a') === activeLink) originalIndex = idx;
  });

  const allData: Record<string, unknown>[] = [];

  // Read CURRENT active tab FIRST (its DOM is already mounted)
  const currentActivePane = container.querySelector('.cxd-Tabs-pane.is-active');
  if (currentActivePane) {
    allData[originalIndex] = readTabFormData(currentActivePane);
  }

  // Click through remaining tabs to mount their DOM
  for (let i = 0; i < totalCount; i++) {
    if (i === originalIndex) continue;

    tabLinks[i].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    tabLinks[i].dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Wait for pane to become active
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => { resolve(); }, 3000);
      const observer = new MutationObserver(() => {
        const activePane = container.querySelector('.cxd-Tabs-pane.is-active');
        if (activePane && activePane.querySelectorAll('.cxd-Form-item').length > 0) {
          clearTimeout(timeout);
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const activePane = container.querySelector('.cxd-Tabs-pane.is-active');
    if (activePane) {
      allData[i] = readTabFormData(activePane);
    }
  }

  // Restore original active tab
  if (tabLinks[originalIndex]) {
    tabLinks[originalIndex].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    tabLinks[originalIndex].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  // Merge with existing items (fallback for tabs that couldn't be read)
  return allData.map((d, i) => d ?? items[i] ?? {});
}

export const ComboShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([{}, {}]);

  const handleAddItem = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // Sync ALL tabs data from DOM before adding new item
    const syncedData = await syncAllTabsData(container, items);
    setItems([...syncedData, {}]);
  }, [items]);

  // Watch for tab removal — sync when Amis removes a tab
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const tabLinks = container.querySelectorAll('.custom-combo-tabs .cxd-Tabs-linksContainer .cxd-Tabs-link');
        if (tabLinks.length > 0 && tabLinks.length < items.length) {
          setItems((prev) => prev.slice(0, tabLinks.length));
        }
      }, 200);
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [items.length]);

  const currentSchema = buildSchema(items);

  return (
    <div className="combo-showcase">
      <div className="combo-preview" ref={containerRef}>
        <AmisLivePreview schema={currentSchema} />
        {items.length < 10 && (
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
