import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmisLivePreview, AmisLivePreviewRef } from './AmisLivePreview';

/**
 * Base form schema template — reused for each tab.
 */
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

/** Build schema with N tabs, each containing the form template */
function buildSchema(tabCount: number, tabData: Record<string, unknown>[]) {
  const tabs: Record<string, unknown>[] = [];
  for (let i = 0; i < tabCount; i++) {
    const formData = { ...FORM_TEMPLATE.data };
    if (tabData[i]) {
      Object.assign(formData, tabData[i]);
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
    className: 'custom-closable-tabs',
    tabs,
  };
}

/** Create fresh data for a new tab */
function createNewTabData(): Record<string, unknown> {
  return {};
}

/** Read form data from a single tab pane */
function readTabFormData(scope: Element): Record<string, unknown> {
  const formData: Record<string, unknown> = {};

  // Native inputs
  const nativeInputs = scope.querySelectorAll('input[name], select[name], textarea[name]');
  nativeInputs.forEach((el: Element) => {
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = input.getAttribute('name');
    if (name && input.value !== undefined && input.value !== '') {
      formData[name] = input.value;
    }
  });

  // Amis select components
  const formItems = scope.querySelectorAll('.cxd-Form-item');
  const fieldNameMap: Record<string, string> = {
    'Sub Mission Type': 'subMissionType',
    'Business Unit': 'businessUnit',
    'Currency': 'currency',
    'Payment Method': 'paymentMethod',
    'Market Code': 'marketCode',
    'Rate Code': 'rateCode',
    'Source': 'source',
    'Room Type': 'roomType',
    'Room Category': 'roomCategory',
    'Billing Code': 'billingCode',
  };
  formItems.forEach((item: Element) => {
    const select = item.querySelector('.cxd-Select');
    if (!select) return;
    const valueEl = select.querySelector('.cxd-Select-value');
    const displayValue = valueEl?.textContent?.trim();
    if (!displayValue || displayValue === '请选择') return;

    const children = Array.from(item.children);
    for (const child of children) {
      if (child.classList.contains('cxd-Select')) continue;
      const text = child.textContent?.trim().replace(/\*$/, '');
      if (text && fieldNameMap[text]) {
        const fieldName = fieldNameMap[text];
        if (!formData[fieldName]) {
          formData[fieldName] = displayValue;
        }
        break;
      }
    }
  });

  // Amis radio components
  const radioGroups = scope.querySelectorAll('.cxd-Radios');
  radioGroups.forEach((radiosEl: Element) => {
    const checkedRadio = radiosEl.querySelector('.cxd-Radio.is-checked');
    if (checkedRadio) {
      const valueText = checkedRadio.textContent?.trim();
      const valueMap: Record<string, string> = {
        'Award Points': 'points',
        'Voucher': 'voucher',
        'No Award': 'none',
      };
      formData['awardType'] = valueMap[valueText || ''] || valueText;
    }
  });

  return formData;
}

export const ClosableTabsShowcase: React.FC<{ schema: Record<string, unknown> }> = ({ schema }) => {
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [submissions, setSubmissions] = useState<Record<string, unknown>[][]>([]);
  const [tabCount, setTabCount] = useState(2);
  const [tabData, setTabData] = useState<Record<string, unknown>[]>([{}, {}]);

  const handleSubmit = useCallback((rows: Record<string, unknown>[]) => {
    setSubmissions((prev) => {
      const exists = prev.some((p) => JSON.stringify(p) === JSON.stringify(rows));
      if (!exists) return [...prev, rows];
      return prev;
    });
  }, []);

  const handleAddTab = useCallback(() => {
    setTabCount((prev) => prev + 1);
    setTabData((prev) => [...prev, createNewTabData()]);
  }, []);

  // Watch for tab close (closable) — sync when Amis removes a tab
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const closableTabs = container.querySelectorAll('.custom-closable-tabs > .cxd-Tabs-linksContainer .cxd-Tabs-link');
        const currentTabCount = closableTabs.length;
        if (currentTabCount < tabCount && currentTabCount > 0) {
          setTabCount(currentTabCount);
          setTabData((prev) => prev.slice(0, currentTabCount));
        }
      }, 200);
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [tabCount]);

  // Listen for form submit button clicks and capture ALL tab data as array
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isProcessing = false;

    const handleClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      const submitBtn = target.closest('button[type="submit"]');
      if (!submitBtn || !container.contains(submitBtn)) return;

      // Prevent Amis's own form submission from firing
      e.stopImmediatePropagation();

      // Avoid double-processing if click fires multiple times
      if (isProcessing) return;
      isProcessing = true;

      const tabLinks = container.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      const totalCount = tabLinks.length;

      // Find the originally active tab index
      const activeLink = container.querySelector('.custom-closable-tabs .cxd-Tabs-link.is-active a');
      let originalIndex = 0;
      tabLinks.forEach((link, idx) => {
        if (link === activeLink) originalIndex = idx;
      });

      const allRows: Record<string, unknown>[] = [];

      // IMPORTANT: Read the CURRENT active tab FIRST before any tab switching.
      // Switching tabs causes Amis to unmount the current pane's DOM, losing
      // any user-entered values that haven't been synced to Amis form state.
      // By reading the active tab first, we capture the data while it's in the DOM.
      const currentActivePane = container.querySelector('.cxd-Tabs-pane.is-active');
      if (currentActivePane) {
        const rowData = readTabFormData(currentActivePane);
        if (Object.keys(rowData).length > 0) {
          allRows[originalIndex] = rowData;
        }
      }

      // Now switch to and read the remaining tabs
      for (let i = 0; i < totalCount; i++) {
        if (i === originalIndex) continue; // Already read above

        tabLinks[i].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabLinks[i].dispatchEvent(new MouseEvent('click', { bubbles: true }));

        // Wait for the pane to become active
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => { observer.disconnect(); resolve(); }, 3000);
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

        await new Promise((resolve) => setTimeout(resolve, 200));

        const activePane = container.querySelector('.cxd-Tabs-pane.is-active');
        if (activePane) {
          const rowData = readTabFormData(activePane);
          if (Object.keys(rowData).length > 0) {
            allRows[i] = rowData;
          }
        }
      }

      // Restore original active tab
      if (tabLinks[originalIndex]) {
        tabLinks[originalIndex].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabLinks[originalIndex].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      isProcessing = false;

      // Filter out any undefined entries and submit
      const filteredRows = allRows.filter(Boolean);
      if (filteredRows.length > 0) {
        handleSubmit(filteredRows);
      }
    };

    container.addEventListener('click', handleClick, true);
    return () => container.removeEventListener('click', handleClick, true);
  }, [handleSubmit]);

  const currentSchema = buildSchema(tabCount, tabData);

  return (
    <div className="closable-tabs-showcase">
      {/* Preview area */}
      <div className="closable-tabs-preview" ref={containerRef}>
        <AmisLivePreview ref={previewRef} schema={currentSchema as Record<string, unknown>} />
        {tabCount < 10 && (
          <button className="closable-tabs-add-btn" onClick={handleAddTab} type="button">
            <span className="add-icon">+</span>
            <span>Add Sub Mission</span>
          </button>
        )}
      </div>

      {/* Form submission data display */}
      <div className="closable-tabs-submissions">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#3F476A' }}>
          表单提交记录 ({submissions.length})
        </h3>
        {submissions.length === 0 ? (
          <div style={{ color: '#999', fontSize: '13px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
            暂无提交记录，请在上方表单中填写并提交
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {submissions.map((rows, idx) => (
              <div key={idx} style={{ marginBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <div style={{ background: '#f5f5f5', padding: '6px 12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #e0e0e0' }}>
                  提交 #{idx + 1}（{rows.length} 条）
                </div>
                <pre style={{ margin: 0, padding: '12px', fontSize: '12px', background: '#fafafa' }}>
                  {JSON.stringify(rows, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosableTabsShowcase;
