import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AmisLivePreview, AmisLivePreviewRef } from './AmisLivePreview';

/**
 * Form template: all fields that appear inside each combo tab.
 * Matches the Sub Mission Rule tab fields from mission-schema.json.
 */
const FORM_TEMPLATE_BODY = [
  { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [
    { label: 'F&B Spending', value: 'FNB_SPENDING' },
    { label: 'F&B Frequency', value: 'FNB_FREQUENCY' },
    { label: 'Room Stay Nights', value: 'ROOM_STAY_NIGHTS' },
    { label: 'Room Spending', value: 'ROOM_SPENDING' },
    { label: 'Room Stay Prepaid Booking', value: 'ROOM_STAY_PREPAID' },
    { label: 'Direct Booking', value: 'Direct Booking' },
    { label: 'Group Booking', value: 'Group Booking' },
  ]},
  { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [
    { label: 'Room', value: 'ROOM' },
    { label: 'F&B', value: 'FNB' },
    { label: 'Health', value: 'HEALTH' },
  ]},
  { type: 'group', body: [
    { type: 'input-number', name: 'targetSpending', label: 'Target Spending', placeholder: 'Please input' },
    { type: 'select', name: 'currency', label: 'Currency', options: [
      { label: 'HKD', value: 'HKD' },
      { label: 'USD', value: 'USD' },
      { label: 'CNY', value: 'CNY' },
      { label: '积分', value: '积分' },
      { label: '钻石', value: '钻石' },
      { label: '金币', value: '金币' },
    ]},
  ]},
  { type: 'group', body: [
    { type: 'input-number', name: 'noOfNights', label: 'No. of Nights', placeholder: 'Please input' },
    { type: 'input-number', name: 'minimumSpending', label: 'Minimum Spending', placeholder: 'Please input' },
  ]},
  { type: 'group', body: [
    { type: 'select', name: 'paymentMethod', label: 'Payment Method', options: [
      { label: 'Credit Card', value: 'Credit Card' },
      { label: 'Cash', value: 'Cash' },
      { label: 'Wire Transfer', value: 'Wire Transfer' },
    ]},
    { type: 'select', name: 'source', label: 'Source', options: [
      { label: 'Web', value: 'Web' },
      { label: 'App', value: 'App' },
      { label: 'Mini Program', value: 'MiniProgram' },
      { label: 'Direct', value: 'DIRECT' },
      { label: 'OTA', value: 'OTA' },
    ]},
  ]},
  { type: 'group', body: [
    { type: 'select', name: 'marketCode', label: 'Market Code', options: [
      { label: 'GDS', value: 'GDS' },
      { label: 'CORPORATE', value: 'CORPORATE' },
      { label: 'Code A', value: 'A' },
      { label: 'Code B', value: 'B' },
    ]},
    { type: 'select', name: 'rateCode', label: 'Rate Code', options: [
      { label: 'RACK', value: 'RACK' },
      { label: 'BAR', value: 'BAR' },
      { label: 'Rate 1', value: 'R1' },
      { label: 'Rate 2', value: 'R2' },
    ]},
  ]},
  { type: 'group', body: [
    { type: 'select', name: 'roomCategory', label: 'Room Category', options: [
      { label: 'Deluxe', value: 'DELUXE' },
      { label: 'Premier', value: 'PREMIER' },
      { label: 'Cat A', value: 'A' },
      { label: 'Cat B', value: 'B' },
    ]},
    { type: 'select', name: 'roomType', label: 'Room Type', options: [
      { label: 'King', value: 'KING' },
      { label: 'Twin', value: 'TWIN' },
      { label: 'Standard', value: 'Standard' },
      { label: 'Deluxe', value: 'Deluxe' },
      { label: 'Suite', value: 'Suite' },
    ]},
  ]},
  { type: 'tpl', tpl: '<div class="section-title-sm">Registration Award</div>', inline: false },
  { type: 'radios', name: 'awardType', label: '', options: [
    { label: 'Award Points', value: 'points' },
    { label: 'Voucher', value: 'voucher' },
    { label: 'No Award', value: 'none' },
  ]},
  { type: 'wrapper', className: 'award-panel', body: [
    { type: 'input-number', name: 'awardPoints', label: 'Award Points', placeholder: 'Please input' },
    { type: 'select', name: 'billingCode', label: 'Billing Code', options: [
      { label: 'BCODE_ROOM_001', value: 'BCODE_ROOM_001' },
      { label: 'BCODE_FNB_001', value: 'BCODE_FNB_001' },
      { label: 'BC-001', value: 'BC-001' },
      { label: 'BC-002', value: 'BC-002' },
    ]},
    { type: 'input-number', name: 'stockQty', label: '库存数', placeholder: 'Please input' },
    { type: 'input-text', name: 'transactionNote', label: 'Transaction Note', placeholder: 'Please input' },
  ]},
];

/** Scaffold template for a new tab — all fields initialised to empty/default. */
const EMPTY_TAB = {
  title: '',
  subMissionType: '',
  businessUnit: '',
  targetSpending: '',
  currency: '',
  paymentMethod: '',
  marketCode: '',
  rateCode: '',
  source: '',
  roomType: '',
  roomCategory: '',
  noOfNights: '',
  minimumSpending: '',
  awardType: 'points',
  awardPoints: '',
  billingCode: '',
  stockQty: '',
  transactionNote: '',
};

/** Initial tabs shown on page load. */
const INITIAL_ITEMS = [
  { ...EMPTY_TAB, title: 'Sub Mission 1' },
  { ...EMPTY_TAB, title: 'Sub Mission 2', subMissionType: 'Direct Booking', businessUnit: 'BU2', currency: '钻石', paymentMethod: 'Credit Card' },
];

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'combo',
  name: 'comboItems',
  className: 'custom-combo-tabs',
  labelField: 'title',
  tabsLabelTpl: '${title}',
  multiple: true,
  multiLine: false,
  removable: true,
  tabsMode: true,
  max: 10,
  addButtonText: '+ Add Sub Mission',
  items: FORM_TEMPLATE_BODY,
}, null, 2);

const DEFAULT_DATA = JSON.stringify(INITIAL_ITEMS, null, 2);

/** Extract form data from a single combo item pane */
function readComboItemData(scope: Element): Record<string, unknown> {
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

export const ComboTabShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'data'>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [parsedSchema, setParsedSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [comboItems, setComboItems] = useState<Record<string, unknown>[]>(INITIAL_ITEMS);
  const [renderKey, setRenderKey] = useState(0);
  const lastSyncedRef = useRef<string>('');
  const prevStructureRef = useRef<string>('');
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the structural snapshot (titles only)
  const structureKey = JSON.stringify(comboItems.map(item => item.title));

  /** Build the full combo schema with current combo items as value */
  const buildComboSchema = useCallback((): Record<string, unknown> => ({
    ...parsedSchema,
    value: comboItems,
    scaffold: { ...EMPTY_TAB, title: '' },
  }), [parsedSchema, comboItems]);

  /** Handle native combo add/delete button clicks (intercepted by AmisLivePreview) */
  const handleNativeComboChange = useCallback((items: Record<string, unknown>[]) => {
    const snapshot = JSON.stringify(items);
    if (snapshot === lastSyncedRef.current) return;

    lastSyncedRef.current = snapshot;
    setComboItems(items);
    setDataJson(snapshot);
    prevStructureRef.current = JSON.stringify(items.map(d => String((d as Record<string, unknown>).title || '')));
    setRenderKey(k => k + 1); // Force AmisLivePreview re-render
  }, []);

  /** Handle value-only edits (field changes within tabs) AND structural changes from mock.
   * Real Amis combo does NOT fire onChange for structural changes, so MutationObserver
   * handles those. The mock in tests uses onDataChange for add/delete, so we support both. */
  const handleDataChange = useCallback((data: Record<string, unknown>) => {
    const incoming = data.comboItems as Record<string, unknown>[] | undefined;
    if (!incoming) return;

    const snapshot = JSON.stringify(incoming);
    if (snapshot === lastSyncedRef.current) return;

    // Structural change: tab count differs — handle add/delete from mock
    if (incoming.length !== comboItems.length) {
      lastSyncedRef.current = snapshot;
      prevStructureRef.current = JSON.stringify(incoming.map(d => String((d as Record<string, unknown>).title || '')));
      setComboItems(incoming);
      setDataJson(JSON.stringify(incoming, null, 2));
      return;
    }

    // Merge incoming field values into existing items by index
    const merged = incoming.map((item, i) => {
      const existing = comboItems[i];
      if (!existing) return item;
      return { ...existing, ...item };
    });

    lastSyncedRef.current = snapshot;
    setComboItems(merged);
    setDataJson(JSON.stringify(merged, null, 2));
  }, [comboItems]);

  // Sync structure ref when comboItems changes
  useEffect(() => {
    prevStructureRef.current = structureKey;
  }, [structureKey]);

  // Observe DOM mutations to detect tab add/delete (Amis combo doesn't fire onChange for structural changes)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const tabLinks = container.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink)');
        const count = tabLinks.length;
        if (count === 0 || count === comboItems.length) return;

        const isAdd = count > comboItems.length;
        const isDelete = count < comboItems.length;

        if (isAdd) {
          // New tabs added — preserve existing tab data, append new tabs with auto-generated titles
          const panes = container.querySelectorAll('.cxd-Tabs-pane');
          const preservedData: Record<string, unknown>[] = [];
          panes.forEach((pane, i) => {
            if (i < comboItems.length) {
              preservedData.push({ ...comboItems[i], ...readComboItemData(pane) });
            }
          });

          // Add new tabs with sequential titles
          let nextIndex = 1;
          const allTitles = new Set(preservedData.map(d => String(d.title || '')));
          while (allTitles.has(`Sub Mission ${nextIndex}`)) nextIndex++;

          for (let i = comboItems.length; i < count; i++) {
            preservedData.push({ ...EMPTY_TAB, title: `Sub Mission ${nextIndex++}` });
          }

          // Update React state WITHOUT remounting Amis — the DOM already has the correct tabs
          setComboItems(preservedData);
          setDataJson(JSON.stringify(preservedData, null, 2));
          prevStructureRef.current = JSON.stringify(preservedData.map(d => d.title));

          // Update tab titles in the DOM directly so they match our auto-generated titles
          const newTabs = container.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink)');
          for (let i = comboItems.length; i < newTabs.length; i++) {
            const tab = newTabs[i];
            const title = preservedData[i]?.title;
            if (tab && title) {
              const link = tab.querySelector('a');
              if (link) {
                // Update the text content (Amis combo tab title)
                const textNode = link.childNodes[0];
                if (textNode && textNode.nodeType === 3) {
                  textNode.textContent = title;
                } else if (link.textContent) {
                  // Amis may wrap text in spans — try to find the title span
                  link.setAttribute('title', title);
                }
              }
            }
          }
        } else if (isDelete) {
          // Tabs deleted — keep remaining tabs' data
          const panes = container.querySelectorAll('.cxd-Tabs-pane');
          const preservedData: Record<string, unknown>[] = [];
          panes.forEach((pane, i) => {
            if (i < count) {
              preservedData.push({ ...comboItems[i], ...readComboItemData(pane) });
            }
          });

          setComboItems(preservedData);
          setDataJson(JSON.stringify(preservedData, null, 2));
          prevStructureRef.current = JSON.stringify(preservedData.map(d => d.title));
        }
      }, 200);
    });

    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboItems.length]);

  const handleRender = useCallback(() => {
    try {
      const parsed = JSON.parse(schemaJson);
      setParsedSchema(parsed);

      const parsedData = JSON.parse(dataJson);
      if (Array.isArray(parsedData)) {
        setComboItems(parsedData);
        prevStructureRef.current = JSON.stringify(parsedData.map((item: Record<string, unknown>) => item.title));
        lastSyncedRef.current = JSON.stringify(parsedData);
      }
    } catch {
      return;
    }
    setRenderKey((k) => k + 1);
  }, [schemaJson, dataJson]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Combo Schema JSON' : 'Combo Data JSON';
  const schema = buildComboSchema();

  return (
    <div className="combo-showcase">
      {/* Editor Tabs */}
      <div className="schema-preview-editor-tabs">
        <button
          className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Combo Schema JSON
        </button>
        <button
          className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Combo Data JSON
        </button>
      </div>

      {/* Toolbar */}
      <div className="schema-preview-toolbar">
        <span className="schema-preview-toolbar-title">{activeLabel}</span>
        <div className="schema-preview-toolbar-actions">
          <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
          <button className="schema-preview-render-btn" onClick={handleRender}>
            渲染
          </button>
        </div>
      </div>

      {/* JSON Textarea */}
      <textarea
        className="schema-preview-textarea"
        value={activeJson}
        onChange={(e) => setJson(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />

      {/* Preview */}
      <div className="combo-preview-bar">
        <span>实时预览</span>
      </div>
      <div className="combo-preview" ref={containerRef}>
        <AmisLivePreview
          key={renderKey}
          schema={schema}
          onDataChange={handleDataChange}
          onNativeComboChange={handleNativeComboChange}
          ref={previewRef}
        />
      </div>
    </div>
  );
};

export default ComboTabShowcase;
