import React from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import { useRef, useEffect } from 'react';
import { mockApiFetcher } from './mock-api';
import { getLocale } from '../utils/locale';

function AmisRenderer({ schema }: { schema: Record<string, unknown> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !schema) return;
    ref.current.innerHTML = '';
    const el = renderAmis(schema, { data: {}, locale: getLocale(), theme: 'cxd' }, {
      session: 'compare-' + Math.random(), theme: 'cxd', locale: getLocale(),
      fetcher: mockApiFetcher,
      notify: () => {},
    }, '');
    ReactDOM.render(el, ref.current);
    return () => { ref.current && ReactDOM.unmountComponentAtNode(ref.current); };
  }, [schema]);
  return <div ref={ref} className="amis-scope" />;
}

const CLOSABLE_TABS_SCHEMA = {
  type: 'tabs',
  className: 'custom-closable-tabs',
  tabs: [
    { title: 'Sub Mission 1', closable: true, body: { type: 'form', wrapWithPanel: false, data: { subMissionType: 'Room Stay Prepaid Booking', businessUnit: 'BU1', currency: '积分', targetSpending: '1000', transactionNote: 'test note' }, body: [
      { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [{ label: 'Room Stay Prepaid Booking', value: 'Room Stay Prepaid Booking' }, { label: 'Direct Booking', value: 'Direct Booking' }] },
      { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [{ label: 'BU1', value: 'BU1' }, { label: 'BU2', value: 'BU2' }] },
      { type: 'input-text', name: 'targetSpending', label: 'Target Spending' },
      { type: 'select', name: 'currency', label: 'Currency', options: [{ label: '积分', value: '积分' }, { label: '钻石', value: '钻石' }] },
      { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
    ]}},
    { title: 'Sub Mission 2', closable: true, body: { type: 'form', wrapWithPanel: false, data: { subMissionType: 'Direct Booking', businessUnit: 'BU2', currency: '钻石' }, body: [
      { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [{ label: 'Room Stay Prepaid Booking', value: 'Room Stay Prepaid Booking' }, { label: 'Direct Booking', value: 'Direct Booking' }] },
      { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [{ label: 'BU1', value: 'BU1' }, { label: 'BU2', value: 'BU2' }] },
      { type: 'input-text', name: 'targetSpending', label: 'Target Spending' },
      { type: 'select', name: 'currency', label: 'Currency', options: [{ label: '积分', value: '积分' }, { label: '钻石', value: '钻石' }] },
      { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
    ]}},
  ],
};

const FORM_TEMPLATE = [
  { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [
    { label: 'F&B Spending', value: 'FNB_SPENDING' },
    { label: 'Room Stay Prepaid Booking', value: 'ROOM_STAY_PREPAID' },
    { label: 'Direct Booking', value: 'Direct Booking' },
  ]},
  { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [
    { label: 'Room', value: 'ROOM' }, { label: 'F&B', value: 'FNB' },
  ]},
  { type: 'group', body: [
    { type: 'input-number', name: 'targetSpending', label: 'Target Spending', placeholder: 'Please input' },
    { type: 'select', name: 'currency', label: 'Currency', options: [
      { label: 'HKD', value: 'HKD' }, { label: '积分', value: '积分' },
    ]},
  ]},
  { type: 'input-text', name: 'transactionNote', label: 'Transaction Note', placeholder: 'Please input' },
];

const COMBO_TABS_SCHEMA = {
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
  items: FORM_TEMPLATE,
  value: [
    { title: 'Sub Mission 1', subMissionType: 'Room Stay Prepaid Booking', businessUnit: 'BU1', targetSpending: '1000', currency: '积分', transactionNote: 'test note' },
    { title: 'Sub Mission 2', subMissionType: 'Direct Booking', businessUnit: 'BU2', currency: '钻石', targetSpending: '', transactionNote: '' },
  ],
};

export const ComparePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '32px', padding: '32px', background: '#f5f5f5', minHeight: '100vh', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '400px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '16px', color: '#333' }}>Closable Tabs (tabs component)</h2>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '16px' }}>
          <AmisRenderer schema={CLOSABLE_TABS_SCHEMA} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '400px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '16px', color: '#333' }}>Combo Tab (combo component)</h2>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '16px' }}>
          <AmisRenderer schema={COMBO_TABS_SCHEMA} />
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
