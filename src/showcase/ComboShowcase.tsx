import React, { useRef } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

const FORM_TEMPLATE_BODY = [
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
];

const schema = {
  type: 'form',
  data: {
    comboItems: [
      { title: 'Sub Mission 1', subMissionType: 'Room Stay Prepaid Booking', businessUnit: '', currency: '', paymentMethod: '' },
      { title: 'Sub Mission 2', subMissionType: 'Direct Booking', businessUnit: '', currency: '', paymentMethod: '' },
    ],
  },
  body: [
    {
      type: 'combo',
      name: 'comboItems',
      className: 'custom-combo-tabs',
      labelField: 'title',
      multiple: true,
      multiLine: true,
      removable: true,
      max: 10,
      addButtonText: '+ Add Sub Mission',
      items: FORM_TEMPLATE_BODY,
    },
  ],
  actions: [],
};

export const ComboTabShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="combo-showcase">
      <div className="combo-preview" ref={containerRef}>
        <AmisLivePreview schema={schema} />
      </div>
    </div>
  );
};

export default ComboTabShowcase;
