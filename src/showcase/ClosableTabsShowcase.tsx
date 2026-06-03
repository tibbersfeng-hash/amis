import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

/** Extract schema_format from the external tabs schema. */
function extractSchemaFormat(schema: Record<string, unknown>): Record<string, unknown>[] {
  const tabs = (schema as any).tabs;
  if (!Array.isArray(tabs) || tabs.length === 0) return DEFAULT_SCHEMA_FORMAT;

  // Use the first tab's body as the schema_format template
  const firstBody = tabs[0]?.body;
  if (firstBody?.type === 'form') {
    return [firstBody];
  }
  return [firstBody];
}

/** Extract tab titles and data from the external tabs schema. */
function extractTabData(schema: Record<string, unknown>): Record<string, unknown>[] {
  const tabs = (schema as any).tabs;
  if (!Array.isArray(tabs) || tabs.length === 0) return [];
  return tabs.map((tab: any) => {
    const { title, closable, body, ...rest } = tab;
    const formData = body?.type === 'form' ? (body.data || {}) : {};
    return { title: title || `Tab ${tabs.indexOf(tab) + 1}`, closable: !!closable, ...formData };
  });
}

/** Build tabs schema from schema_format + tab count + tab data. */
function buildTabsSchema(schemaFormat: Record<string, unknown>[], tabCount: number, tabData: Record<string, unknown>[]): Record<string, unknown> {
  const tabs: Record<string, unknown>[] = [];
  for (let i = 0; i < tabCount; i++) {
    const data = tabData[i] || {};
    // Deep clone each schema_format item and inject data
    const items = schemaFormat.map(item => {
      const cloned = JSON.parse(JSON.stringify(item));
      if (cloned.type === 'form') {
        cloned.data = data;
        cloned.wrapWithPanel = false;
      }
      return cloned;
    });

    tabs.push({
      title: data.title || `Tab ${i + 1}`,
      closable: data.closable !== false,
      body: items.length === 1 ? items[0] : { type: 'container', body: items },
    });
  }
  return {
    type: 'tabs',
    className: 'custom-closable-tabs',
    tabs,
  };
}

const DEFAULT_SCHEMA_FORMAT: Record<string, unknown>[] = [
  {
    type: 'form',
    wrapWithPanel: false,
    body: [
      { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
    ],
    actions: [{ type: 'submit', label: '提交', level: 'primary' }],
  },
];

const DEFAULT_TAB_DATA: Record<string, unknown> = { title: 'Tab 1', name: '' };

const INITIAL_TABS = [
  { ...DEFAULT_TAB_DATA },
  { ...DEFAULT_TAB_DATA, title: 'Tab 2', name: 'Bob' },
];

/** Read form data from a single tab pane */
function readTabFormData(scope: Element): Record<string, unknown> {
  const formData: Record<string, unknown> = {};
  const inputs = scope.querySelectorAll('input[name], select[name], textarea[name]');
  inputs.forEach((el: Element) => {
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = input.getAttribute('name');
    if (name && input.value !== undefined && input.value !== '') {
      formData[name] = input.value;
    }
  });
  return formData;
}

export const ClosableTabsShowcase: React.FC<{ schema?: Record<string, unknown>; onDataChange?: (data: Record<string, unknown>) => void }> = ({ schema: externalSchema, onDataChange: externalOnChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabCount, setTabCount] = useState(INITIAL_TABS.length);
  const [renderKey, setRenderKey] = useState(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [submissions, setSubmissions] = useState<Record<string, unknown>[][]>([]);
  const tabDataRef = useRef<Record<string, unknown>[]>(INITIAL_TABS);
  const schemaFormatRef = useRef<Record<string, unknown>[]>(DEFAULT_SCHEMA_FORMAT);
  const lastDataSnapshotRef = useRef<string>('');

  // Track active tab index via DOM
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkActive = () => {
      const links = container.querySelectorAll('.custom-closable-tabs > .cxd-Tabs-linksContainer .cxd-Tabs-link.is-active');
      const allLinks = container.querySelectorAll('.custom-closable-tabs > .cxd-Tabs-linksContainer .cxd-Tabs-link');
      for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i] === links[0]) {
          setActiveTabIndex(i);
          return;
        }
      }
    };

    checkActive();
    const observer = new MutationObserver(checkActive);
    observer.observe(container, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  // Emit data changes to parent (debounced)
  const emitDataChange = useCallback((data: Record<string, unknown>[]) => {
    const snapshot = JSON.stringify(data);
    if (snapshot === lastDataSnapshotRef.current) return;
    lastDataSnapshotRef.current = snapshot;
    externalOnChange?.({ tabs: data });
  }, [externalOnChange]);

  // Sync internal state with external schema prop (from showcase editor + render button)
  useEffect(() => {
    if (!externalSchema) return;

    const format = extractSchemaFormat(externalSchema);
    if (format.length > 0) {
      schemaFormatRef.current = format;
    }

    const data = extractTabData(externalSchema);
    if (data.length > 0) {
      tabDataRef.current = data;
      setTabCount(data.length);
    }

    setRenderKey(k => k + 1);
  }, [externalSchema]);

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

  // Sync form data from AmisLivePreview onChange → emit to parent (real-time, debounced)
  const handleAmisDataChange = useCallback((changedData: Record<string, unknown>) => {
    const container = containerRef.current;
    if (!container) return;

    // Read all tab pane data from DOM
    const panes = container.querySelectorAll('.cxd-Tabs-pane');
    const newData: Record<string, unknown>[] = [];
    panes.forEach((pane) => {
      const data = readTabFormData(pane);
      if (Object.keys(data).length > 0) newData.push(data);
    });

    if (newData.length > 0) {
      tabDataRef.current = newData;
      emitDataChange(newData);
    }
  }, [emitDataChange]);

  // Schema is built from schema_format + tabCount + captured tab data.
  const currentSchema = buildTabsSchema(schemaFormatRef.current, tabCount, tabDataRef.current);

  return (
    <div className="closable-tabs-showcase">
      {/* Preview area */}
      <div className="closable-tabs-preview" ref={containerRef}>
        <AmisLivePreview key={renderKey} schema={currentSchema as Record<string, unknown>} onDataChange={handleAmisDataChange} />
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
