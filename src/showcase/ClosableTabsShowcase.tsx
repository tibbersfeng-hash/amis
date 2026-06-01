import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

/**
 * Base form schema template — the ONLY source of form structure.
 * All tabs share this same schema. Data (initial values) are separate.
 */
const FORM_SCHEMA = {
  type: 'form',
  wrapWithPanel: false,
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

/** Default initial data for a new tab. */
const DEFAULT_TAB_DATA = {
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
};

/** Build tabs schema with N tabs. Each tab gets the SAME form schema + its own initial data. */
function buildTabsSchema(tabCount: number, tabData: Record<string, unknown>[]) {
  const tabs: Record<string, unknown>[] = [];
  for (let i = 0; i < tabCount; i++) {
    const data = { ...DEFAULT_TAB_DATA, ...(tabData[i] || {}) };
    tabs.push({
      title: `Sub Mission ${i + 1}`,
      closable: true,
      body: {
        ...FORM_SCHEMA,
        data,
      },
    });
  }
  return {
    type: 'tabs',
    className: 'custom-closable-tabs',
    tabs,
  };
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

  // Amis select components — map label to field name
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

  // Amis radio components — derive field name from label
  const radioGroups = scope.querySelectorAll('.cxd-Radios');
  radioGroups.forEach((radiosEl: Element) => {
    const checkedRadio = radiosEl.querySelector('.cxd-Radio.is-checked');
    if (!checkedRadio) return;

    const valueText = checkedRadio.textContent?.trim() || '';
    const valueMap: Record<string, string> = {
      'Award Points': 'points',
      'Voucher': 'voucher',
      'No Award': 'none',
    };

    const labelEl = radiosEl.querySelector('.cxd-FieldLabel');
    let fieldName = 'awardType';
    if (labelEl) {
      const labelText = labelEl.textContent?.trim().replace(/\*$/, '');
      if (labelText === 'Registration Award') {
        fieldName = 'awardType';
      } else if (labelText && fieldNameMap[labelText]) {
        fieldName = fieldNameMap[labelText];
      } else if (labelText) {
        fieldName = labelText.toLowerCase().replace(/[^a-zA-Z]/g, '').replace(/ ([a-z])/g, (_, c) => c.toUpperCase());
      }
    }

    formData[fieldName] = valueMap[valueText] || valueText;
  });

  return formData;
}

export const ClosableTabsShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabCount, setTabCount] = useState(2);
  const [submissions, setSubmissions] = useState<Record<string, unknown>[][]>([]);
  // Store latest form data from each tab index — survives schema rebuilds
  const tabDataRef = useRef<Record<string, unknown>[]>([]);

  const handleSubmit = useCallback((rows: Record<string, unknown>[]) => {
    setSubmissions((prev) => {
      const exists = prev.some((p) => JSON.stringify(p) === JSON.stringify(rows));
      if (!exists) return [...prev, rows];
      return prev;
    });
  }, []);

  // Watch for tab add/close via Amis DOM mutations.
  // Use a ref for tabCount to avoid stale closures in the observer callback.
  const tabCountRef = useRef(tabCount);
  tabCountRef.current = tabCount;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Capture form data from all current tab panes before any DOM change
    const captureFormData = () => {
      const panes = container.querySelectorAll('.cxd-Tabs-pane');
      const newTabData: Record<string, unknown>[] = [];
      panes.forEach((pane) => {
        const data = readTabFormData(pane);
        if (Object.keys(data).length > 0) newTabData.push(data);
      });
      if (newTabData.length > 0) {
        tabDataRef.current = newTabData;
      }
    };

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const closableTabs = container.querySelectorAll('.custom-closable-tabs > .cxd-Tabs-linksContainer .cxd-Tabs-link');
        const count = closableTabs.length;
        if (count > 0 && count !== tabCountRef.current) {
          // Capture data before updating count
          captureFormData();
          setTabCount(count);
        }
      }, 300);
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Listen for form submit button clicks — read ALL tabs' data at submit time
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isProcessing = false;

    const handleClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      const submitBtn = target.closest('button[type="submit"]');
      if (!submitBtn || !container.contains(submitBtn)) return;

      e.stopImmediatePropagation();
      if (isProcessing) return;
      isProcessing = true;

      const tabLinks = container.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      const totalCount = tabLinks.length;

      const activeLink = container.querySelector('.custom-closable-tabs .cxd-Tabs-link.is-active a');
      let originalIndex = 0;
      tabLinks.forEach((link, idx) => {
        if (link === activeLink) originalIndex = idx;
      });

      const allRows: Record<string, unknown>[] = [];

      // Read current active tab first (DOM is already mounted)
      const currentActivePane = container.querySelector('.cxd-Tabs-pane.is-active');
      if (currentActivePane) {
        const rowData = readTabFormData(currentActivePane);
        if (Object.keys(rowData).length > 0) {
          allRows[originalIndex] = rowData;
        }
      }

      // Switch to and read remaining tabs
      for (let i = 0; i < totalCount; i++) {
        if (i === originalIndex) continue;

        tabLinks[i].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabLinks[i].dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => { resolve(); }, 3000);
          const paneObserver = new MutationObserver(() => {
            const activePane = container.querySelector('.cxd-Tabs-pane.is-active');
            if (activePane && activePane.querySelectorAll('.cxd-Form-item').length > 0) {
              clearTimeout(timeout);
              paneObserver.disconnect();
              resolve();
            }
          });
          paneObserver.observe(container, { childList: true, subtree: true, attributes: true });
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

      const filteredRows = allRows.filter(Boolean);
      if (filteredRows.length > 0) {
        handleSubmit(filteredRows);
      }
    };

    container.addEventListener('click', handleClick, true);
    return () => container.removeEventListener('click', handleClick, true);
  }, [handleSubmit]);

  // Schema is built from tabCount + captured tab data.
  // Use stored tab data so user-entered values survive schema rebuilds.
  const currentSchema = buildTabsSchema(tabCount, tabDataRef.current);

  return (
    <div className="closable-tabs-showcase">
      {/* Preview area */}
      <div className="closable-tabs-preview" ref={containerRef}>
        <AmisLivePreview schema={currentSchema as Record<string, unknown>} />
        {tabCount < 10 && (
          <button className="closable-tabs-add-btn" onClick={() => setTabCount((prev) => prev + 1)} type="button">
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
