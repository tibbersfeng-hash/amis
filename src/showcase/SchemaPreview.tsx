import React, { forwardRef, useRef, useState, useCallback, useImperativeHandle, useEffect } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';
import { AIGeneratorDrawer, type AIGeneratorResult } from './AIGeneratorDrawer';

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'page',
  body: {
    type: 'tabs',
    tabsMode: 'line',
    mountOnEnter: false,
    className: 'custom-underline-tabs',
    tabs: [
      {
        title: 'Mission Rule',
        body: {
          type: 'tabs',
          mountOnEnter: false,
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  missionRule: { ruleSetup: { missionName: '每日签到', missionCode: 'DAILY_CHECKIN' } },
                },
                body: [
                  { type: 'input-text', name: 'missionRule.ruleSetup.missionName', label: 'Mission Name' },
                  { type: 'input-text', name: 'missionRule.ruleSetup.missionCode', label: 'Mission Code' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  missionRule: { display: { missionDesc: '完成每日签到可获得积分奖励', missionImage: 'https://cdn.example.com/images/daily-checkin.png' } },
                },
                body: [
                  { type: 'input-text', name: 'missionRule.display.missionDesc', label: 'Mission Description' },
                  { type: 'input-text', name: 'missionRule.display.missionImage', label: 'Mission Image URL' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Registration Rule',
        body: {
          type: 'tabs',
          mountOnEnter: false,
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  registrationRule: { ruleSetup: { registerKeyWord: '签到', limitionKeyWord: '每日限1次' } },
                },
                body: [
                  { type: 'input-text', name: 'registrationRule.ruleSetup.registerKeyWord', label: 'Registration Key Word' },
                  { type: 'input-text', name: 'registrationRule.ruleSetup.limitionKeyWord', label: 'Limitation Key Word' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                data: {
                  registrationRule: { display: { registerSuccessMsg: '签到成功，获得积分', registerFailMsg: '今日已签到，请勿重复' } },
                },
                body: [
                  { type: 'input-text', name: 'registrationRule.display.registerSuccessMsg', label: 'Registration Success Message' },
                  { type: 'input-text', name: 'registrationRule.display.registerFailMsg', label: 'Registration Failure Message' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Sub Mission Rule',
        body: {
          type: 'combo',
          name: 'subMissions',
          className: 'custom-combo-tabs',
          label: false,
          labelField: 'title',
          tabsLabelTpl: '${title}',
          multiple: true,
          multiLine: false,
          removable: true,
          tabsMode: true,
          max: 10,
          addButtonText: '+ Add Sub Mission',
          scaffold: {
            title: '',
            subMissionType: '',
            businessUnit: '',
            targetSpending: '',
            currency: '',
            noOfNights: '',
            minimumSpending: '',
            paymentMethod: '',
            source: '',
            marketCode: '',
            rateCode: '',
            roomCategory: '',
            roomType: '',
            awardType: 'points',
            awardPoints: '',
            billingCode: '',
            stockQty: '',
            transactionNote: '',
          },
          items: [
            {
              type: 'select',
              name: 'subMissionType',
              label: 'Sub Mission Type*',
              required: true,
              options: [
                { label: 'F&B Spending', value: 'FNB_SPENDING' },
                { label: 'F&B Frequency', value: 'FNB_FREQUENCY' },
                { label: 'Room Stay Nights', value: 'ROOM_STAY_NIGHTS' },
                { label: 'Room Spending', value: 'ROOM_SPENDING' },
                { label: 'Room Stay Prepaid Booking', value: 'ROOM_STAY_PREPAID' },
                { label: 'Direct Booking', value: 'Direct Booking' },
                { label: 'Group Booking', value: 'Group Booking' },
              ],
            },
            {
              type: 'select',
              name: 'businessUnit',
              label: 'Business Unit*',
              required: true,
              options: [
                { label: 'Room', value: 'ROOM' },
                { label: 'F&B', value: 'FNB' },
                { label: 'Health', value: 'HEALTH' },
              ],
            },
            {
              type: 'group',
              body: [
                {
                  type: 'input-number',
                  name: 'targetSpending',
                  label: 'Target Spending',
                  placeholder: 'Please input',
                },
                {
                  type: 'select',
                  name: 'currency',
                  label: 'Currency',
                  options: [
                    { label: 'HKD', value: 'HKD' },
                    { label: 'USD', value: 'USD' },
                    { label: 'CNY', value: 'CNY' },
                    { label: '积分', value: '积分' },
                    { label: '钻石', value: '钻石' },
                    { label: '金币', value: '金币' },
                  ],
                },
              ],
            },
            {
              type: 'group',
              body: [
                {
                  type: 'input-number',
                  name: 'noOfNights',
                  label: 'No. of Nights',
                  placeholder: 'Please input',
                },
                {
                  type: 'input-number',
                  name: 'minimumSpending',
                  label: 'Minimum Spending',
                  placeholder: 'Please input',
                },
              ],
            },
            {
              type: 'group',
              body: [
                {
                  type: 'select',
                  name: 'paymentMethod',
                  label: 'Payment Method',
                  options: [
                    { label: 'Credit Card', value: 'Credit Card' },
                    { label: 'Cash', value: 'Cash' },
                    { label: 'Wire Transfer', value: 'Wire Transfer' },
                  ],
                },
                {
                  type: 'select',
                  name: 'source',
                  label: 'Source',
                  options: [
                    { label: 'Web', value: 'Web' },
                    { label: 'App', value: 'App' },
                    { label: 'Mini Program', value: 'MiniProgram' },
                    { label: 'Direct', value: 'DIRECT' },
                    { label: 'OTA', value: 'OTA' },
                  ],
                },
              ],
            },
            {
              type: 'group',
              body: [
                {
                  type: 'select',
                  name: 'marketCode',
                  label: 'Market Code',
                  options: [
                    { label: 'GDS', value: 'GDS' },
                    { label: 'CORPORATE', value: 'CORPORATE' },
                    { label: 'Code A', value: 'A' },
                    { label: 'Code B', value: 'B' },
                  ],
                },
                {
                  type: 'select',
                  name: 'rateCode',
                  label: 'Rate Code',
                  options: [
                    { label: 'RACK', value: 'RACK' },
                    { label: 'BAR', value: 'BAR' },
                    { label: 'Rate 1', value: 'R1' },
                    { label: 'Rate 2', value: 'R2' },
                  ],
                },
              ],
            },
            {
              type: 'group',
              body: [
                {
                  type: 'select',
                  name: 'roomCategory',
                  label: 'Room Category',
                  options: [
                    { label: 'Deluxe', value: 'DELUXE' },
                    { label: 'Premier', value: 'PREMIER' },
                    { label: 'Cat A', value: 'A' },
                    { label: 'Cat B', value: 'B' },
                  ],
                },
                {
                  type: 'select',
                  name: 'roomType',
                  label: 'Room Type',
                  options: [
                    { label: 'King', value: 'KING' },
                    { label: 'Twin', value: 'TWIN' },
                    { label: 'Standard', value: 'Standard' },
                    { label: 'Deluxe', value: 'Deluxe' },
                    { label: 'Suite', value: 'Suite' },
                  ],
                },
              ],
            },
            {
              type: 'tpl',
              tpl: '<div class="section-title-sm">Registration Award</div>',
              inline: false,
            },
            {
              type: 'radios',
              name: 'awardType',
              label: '',
              options: [
                { label: 'Award Points', value: 'points' },
                { label: 'Voucher', value: 'voucher' },
                { label: 'No Award', value: 'none' },
              ],
            },
            {
              type: 'wrapper',
              className: 'award-panel',
              body: [
                {
                  type: 'input-number',
                  name: 'awardPoints',
                  label: 'Award Points',
                  placeholder: 'Please input',
                },
                {
                  type: 'select',
                  name: 'billingCode',
                  label: 'Billing Code',
                  options: [
                    { label: 'BCODE_ROOM_001', value: 'BCODE_ROOM_001' },
                    { label: 'BCODE_FNB_001', value: 'BCODE_FNB_001' },
                    { label: 'BC-001', value: 'BC-001' },
                    { label: 'BC-002', value: 'BC-002' },
                  ],
                },
                {
                  type: 'input-number',
                  name: 'stockQty',
                  label: '库存数',
                  placeholder: 'Please input',
                },
                {
                  type: 'input-text',
                  name: 'transactionNote',
                  label: 'Transaction Note',
                  placeholder: 'Please input',
                },
              ],
            },
          ],
          value: [
            {
              title: '连续签到7天',
              subMissionType: 'Direct Booking',
              businessUnit: 'ROOM',
              targetSpending: 1000,
              currency: '积分',
              noOfNights: 7,
              minimumSpending: 200,
              paymentMethod: 'Credit Card',
              source: 'Web',
              marketCode: 'GDS',
              rateCode: 'RACK',
              roomCategory: 'DELUXE',
              roomType: 'King',
              awardType: 'points',
              awardPoints: 500,
              billingCode: 'BCODE_ROOM_001',
              stockQty: 100,
              transactionNote: '连续7天签到奖励',
            },
            {
              title: '连续签到30天',
              subMissionType: 'Room Stay Nights',
              businessUnit: 'ROOM',
              targetSpending: 5000,
              currency: '钻石',
              noOfNights: 30,
              minimumSpending: 500,
              paymentMethod: 'Wire Transfer',
              source: 'App',
              marketCode: 'CORPORATE',
              rateCode: 'BAR',
              roomCategory: 'PREMIER',
              roomType: 'Suite',
              awardType: 'voucher',
              awardPoints: 2000,
              billingCode: 'BCODE_FNB_001',
              stockQty: 50,
              transactionNote: '连续30天签到奖励',
            },
          ],
        },
      },
    ],
  },
}, null, 2);

const DEFAULT_DATA = JSON.stringify({
  missionRule: {
    ruleSetup: {
      missionName: '每日签到',
      missionCode: 'DAILY_CHECKIN',
    },
    display: {
      missionDesc: '完成每日签到可获得积分奖励',
      missionImage: 'https://cdn.example.com/images/daily-checkin.png',
    },
  },
  registrationRule: {
    ruleSetup: {
      registerKeyWord: '签到',
      limitionKeyWord: '每日限1次',
    },
    display: {
      registerSuccessMsg: '签到成功，获得积分',
      registerFailMsg: '今日已签到，请勿重复',
    },
  },
  subMissions: [
    {
      title: '连续签到7天',
      subMissionType: 'Direct Booking',
      businessUnit: 'ROOM',
      targetSpending: 1000,
      currency: '积分',
      noOfNights: 7,
      minimumSpending: 200,
      paymentMethod: 'Credit Card',
      source: 'Web',
      marketCode: 'GDS',
      rateCode: 'RACK',
      roomCategory: 'DELUXE',
      roomType: 'King',
      awardType: 'points',
      awardPoints: 500,
      billingCode: 'BCODE_ROOM_001',
      stockQty: 100,
      transactionNote: '连续7天签到奖励',
    },
    {
      title: '连续签到30天',
      subMissionType: 'Room Stay Nights',
      businessUnit: 'ROOM',
      targetSpending: 5000,
      currency: '钻石',
      noOfNights: 30,
      minimumSpending: 500,
      paymentMethod: 'Wire Transfer',
      source: 'App',
      marketCode: 'CORPORATE',
      rateCode: 'BAR',
      roomCategory: 'PREMIER',
      roomType: 'Suite',
      awardType: 'voucher',
      awardPoints: 2000,
      billingCode: 'BCODE_FNB_001',
      stockQty: 50,
      transactionNote: '连续30天签到奖励',
    },
  ],
}, null, 2);

export interface SchemaPreviewRef {
  /** Read current form values from DOM and update Data JSON */
  getData: () => Promise<Record<string, unknown>>;
  /** Programmatically set form data and update Data JSON */
  setData: (data: Record<string, unknown>) => void;
}

/**
 * Set a nested value on an object by dot-separated path.
 * e.g. setByPath(obj, 'a.b.c', 'x') → { a: { b: { c: 'x' } } }
 */
function setByPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in target) || typeof target[part] !== 'object' || Array.isArray(target[part])) {
      target[part] = {};
    }
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = value;
}

/**
 * Walk the schema and update form.data / combo value.
 * form.data receives the top-level nested keys (missionRule, registrationRule, subMissions).
 * Amis handles the dot-notation name mapping internally.
 */
function injectFormData(schema: Record<string, unknown>, data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...schema };

  // If this is a form without a data property, create one from the provided data.
  // Amis uses form.data as the initial values for fields.
  if (result.type === 'form' && !('data' in result)) {
    result.data = { ...data };
  }

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (key === 'data' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Merge top-level data keys into form.data for Amis dot-notation mapping
      const merged = { ...(value as Record<string, unknown>) };
      for (const [k, v] of Object.entries(data)) {
        merged[k] = v;
      }
      result[key] = merged;
    } else if (key === 'value' && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && result.type === 'combo') {
      // Combo value: replace with data[name] if available, otherwise keep original
      const comboName = result.name as string | undefined;
      if (comboName && Array.isArray(data[comboName])) {
        result[key] = data[comboName];
      }
      // If no matching data, keep original value (don't merge unrelated keys)
    } else if (key === 'body' && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? injectFormData(item, data) : item
      );
    } else if (key === 'tabs' && Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item !== 'object' || item === null) return item;
        const updated = injectFormData(item as Record<string, unknown>, data);
        if (updated.body && typeof updated.body === 'object' &&
            (updated.body as Record<string, unknown>).type === 'combo' &&
            typeof (updated.body as Record<string, unknown>).name === 'string' &&
            Array.isArray(data[(updated.body as Record<string, unknown>).name as string])) {
          const body = updated.body as Record<string, unknown>;
          body.value = data[(body as Record<string, unknown>).name as string];
        }
        return updated;
      });
    } else if (key === 'items' && Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'object' && item !== null ? injectFormData(item, data) : item
      );
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = injectFormData(value as Record<string, unknown>, data);
    }
  }
  return result;
}

/**
 * Extract combo names from schema for DOM-based data reading.
 */
function getComboNames(s: Record<string, unknown>): string[] {
  const names: string[] = [];
  const visited = new WeakSet<object>();
  function walk(obj: Record<string, unknown>) {
    if (!obj || typeof obj !== 'object' || visited.has(obj)) return;
    visited.add(obj);
    if (obj.type === 'combo' && typeof obj.name === 'string') {
      names.push(obj.name);
    }
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) {
        val.forEach(item => { if (typeof item === 'object' && item !== null) walk(item as Record<string, unknown>); });
      } else if (typeof val === 'object' && val !== null) {
        walk(val as Record<string, unknown>);
      }
    }
  }
  walk(s);
  return names;
}

/**
 * Read combo items from a tabsMode combo (.cxd-ComboControl with .cxd-ComboTabs).
 * Clicks through all tabs to ensure all panes are mounted, then reads from .cxd-Combo-itemInner.
 */
async function readTabsModeCombo(comboCtrl: Element, comboKey: string): Promise<Record<string, unknown>[]> {
  const comboTabs = comboCtrl.querySelector('.cxd-ComboTabs');
  if (!comboTabs) return [];
  const tabLinks = comboTabs.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink) a');
  if (tabLinks.length === 0) return [];

  // Click through all tabs to mount all panes
  for (let i = 0; i < tabLinks.length; i++) {
    (tabLinks[i] as HTMLElement).click();
    // Small delay for DOM update
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Read all .cxd-Combo-itemInner elements
  const inners = comboCtrl.querySelectorAll('.cxd-Combo-itemInner');
  const rows: Record<string, unknown>[] = [];
  inners.forEach((inner) => {
    const inputs = inner.querySelectorAll('input[name], textarea[name], select[name]');
    const rowData: Record<string, unknown> = {};
    inputs.forEach((el: Element) => {
      const name = (el as HTMLInputElement).getAttribute('name');
      if (name) {
        const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
        if (value !== undefined) rowData[name] = value;
      }
    });
    if (Object.keys(rowData).length > 0) rows.push(rowData);
  });
  return rows;
}

/**
 * Read DOM inputs and build nested data structure.
 * Dot-notation names like 'missionRule.ruleSetup.missionName' are converted
 * to nested objects: { missionRule: { ruleSetup: { missionName: 'value' } } }
 */
async function readInputs(container: HTMLDivElement, schema: Record<string, unknown>): Promise<Record<string, unknown>> {
  const comboNames = getComboNames(schema);
  const comboResult: Record<string, unknown> = {};
  const comboFieldNames = new Set<string>();

  // Read tabsMode combos (.cxd-ComboControl with .cxd-ComboTabs inside)
  const allComboCtrls = container.querySelectorAll('.cxd-ComboControl');
  const tabsModeCombos: Element[] = [];
  allComboCtrls.forEach(ctrl => {
    if (ctrl.querySelector('.cxd-ComboTabs')) tabsModeCombos.push(ctrl);
  });

  for (let i = 0; i < tabsModeCombos.length; i++) {
    const comboKey = comboNames[i] || `combo_${i}`;
    const rows = await readTabsModeCombo(tabsModeCombos[i], comboKey);
    if (rows.length > 0) {
      comboResult[comboKey] = rows;
      rows.forEach(row => Object.keys(row).forEach(k => comboFieldNames.add(k)));
    }
  }

  // Read classic combos (.cxd-Combo that are NOT inside a tabsMode combo control)
  const classicCombos = container.querySelectorAll('.cxd-Combo');
  classicCombos.forEach((comboEl) => {
    // Skip if inside a tabsMode combo control
    const comboControl = comboEl.closest('.cxd-ComboControl');
    if (comboControl && comboControl.querySelector('.cxd-ComboTabs')) return;
    const idx = tabsModeCombos.length + Array.from(classicCombos).indexOf(comboEl);
    const comboKey = comboNames[idx] || `combo_${idx}`;
    const items = comboEl.querySelectorAll('.cxd-Combo-item');
    const rows: Record<string, unknown>[] = [];
    items.forEach((row) => {
      const inputs = row.querySelectorAll('input[name], textarea[name], select[name]');
      const rowData: Record<string, unknown> = {};
      inputs.forEach((el: Element) => {
        const name = (el as HTMLInputElement).getAttribute('name');
        if (name) {
          comboFieldNames.add(name);
          const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
          if (value !== undefined) rowData[name] = value;
        }
      });
      if (Object.keys(rowData).length > 0) rows.push(rowData);
    });
    if (rows.length > 0) comboResult[comboKey] = rows;
  });

  // Read non-combo inputs, convert dot-names to nested structure
  const nestedData: Record<string, unknown> = {};
  const inputs = container.querySelectorAll('input[name], textarea[name], select[name]');
  inputs.forEach((el: Element) => {
    const name = (el as HTMLInputElement).getAttribute('name');
    if (name && !comboFieldNames.has(name)) {
      const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
      if (value !== undefined) setByPath(nestedData, name, value);
    }
  });

  // Merge combo data
  for (const [key, val] of Object.entries(comboResult)) {
    nestedData[key] = val;
  }

  return nestedData;
}

type EditorTab = 'schema' | 'data';

export const SchemaPreview = forwardRef<SchemaPreviewRef, {}>((_props, ref) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [data, setData] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_DATA));
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI Generator state
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIDrawerOpen = useCallback(() => {
    setAiDrawerVisible(true);
    setAiError(null);
  }, []);

  const handleAIDrawerClose = useCallback(() => {
    setAiDrawerVisible(false);
  }, []);

  const handleAIApply = useCallback((result: AIGeneratorResult) => {
    if (result.schema) {
      try {
        const parsedSchema = JSON.parse(result.schema);
        setSchemaJson(result.schema);
        if (result.data) {
          try {
            const parsedData = JSON.parse(result.data);
            setDataJson(result.data);
            setData(parsedData);
            const injected = injectFormData(parsedSchema, parsedData);
            setSchema(injected);
            setError(null);
            setRenderKey(k => k + 1);

            // Check for Vite error overlay after hot update
            setTimeout(() => {
              const overlay = document.querySelector('vite-error-overlay');
              if (overlay) {
                const message = overlay.shadowRoot?.querySelector('.message')?.textContent || '编译错误';
                setAiError(`生成成功但存在编译错误: ${message}`);
              }
            }, 1500);
          } catch (e) {
            setAiError(`Data JSON 解析失败: ${(e as Error).message}`);
          }
        } else {
          setSchema(parsedSchema);
          setError(null);
          setRenderKey(k => k + 1);
        }
      } catch (e) {
        setAiError(`Schema JSON 解析失败: ${(e as Error).message}`);
      }
    }
  }, []);

  const handleRender = useCallback(() => {
    let parsedSchema: Record<string, unknown>;
    try {
      parsedSchema = JSON.parse(schemaJson);
    } catch (e: unknown) {
      setError(`Schema: ${(e as Error).message}`);
      return;
    }

    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(dataJson);
    } catch (e: unknown) {
      setError(`Data: ${(e as Error).message}`);
      return;
    }

    setData(parsedData);
    parsedSchema = injectFormData(parsedSchema, parsedData);
    setSchema(parsedSchema);
    setError(null);
    setRenderKey(k => k + 1);
  }, [schemaJson, dataJson]);

  const handleSyncData = useCallback(() => {
    previewRef.current?.syncData();
  }, []);

  // Auto-sync: watch for DOM changes (user input + structural changes) and update Data JSON.
  // syncData in AmisLivePreview has a snapshot check to prevent unnecessary re-renders.
  useEffect(() => {
    if (!containerRef.current) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        previewRef.current?.syncData();
      }, 300);
    });
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Expose getData / setData via ref and on window for programmatic access
  useImperativeHandle(ref, () => ({
    getData: async () => {
      if (!containerRef.current) return {};
      const nestedData = await readInputs(containerRef.current, schema);
      previewRef.current?.syncData();
      return nestedData;
    },
    setData: (newData: Record<string, unknown>) => {
      previewRef.current?.resetModifications();
      const newDataJson = JSON.stringify(newData, null, 2);
      const updatedSchema = injectFormData(schema, newData);
      setDataJson(newDataJson);
      setData(newData);
      setSchema(updatedSchema);
      setSchemaJson(JSON.stringify(updatedSchema, null, 2));
      setRenderKey(k => k + 1);
    },
  }), [data]);

  // Expose on window for external programmatic access
  useEffect(() => {
    const api = {
      getData: async () => {
        if (!containerRef.current) return {};
        return readInputs(containerRef.current, schema);
      },
      setData: (newData: Record<string, unknown>) => {
        previewRef.current?.resetModifications();
        const newDataJson = JSON.stringify(newData, null, 2);
        const updatedSchema = injectFormData(schema, newData);
        setDataJson(newDataJson);
        setData(newData);
        setSchema(updatedSchema);
        setSchemaJson(JSON.stringify(updatedSchema, null, 2));
        setRenderKey(k => k + 1);
      },
    };
    (window as any).__schemaPreviewAPI = api;
    return () => { delete (window as any).__schemaPreviewAPI; };
  }, [data, schema]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Amis Schema JSON' : 'Data JSON';

  return (
    <div className="schema-preview-full">
      <div className="schema-preview-section">
        {/* Editor Tabs */}
        <div className="schema-preview-editor-tabs">
          <button
            className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            Amis Schema JSON
          </button>
          <button
            className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data JSON
          </button>
        </div>

        {/* Toolbar */}
        <div className="schema-preview-toolbar">
          <span className="schema-preview-toolbar-title">{activeLabel}</span>
          <div className="schema-preview-toolbar-actions">
            <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
            <button className="schema-preview-sync-btn" onClick={handleSyncData}>
              同步数据
            </button>
            <button
              data-testid="ai-generate-btn"
              style={{
                padding: '6px 16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba1 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-family)',
              }}
              onClick={handleAIDrawerOpen}
            >
              AI 生成
            </button>
            <button className="schema-preview-render-btn" onClick={handleRender}>
              渲染
            </button>
          </div>
        </div>

        {/* JSON Textarea */}
        <textarea
          className="schema-preview-textarea"
          value={activeJson}
          onChange={e => setJson(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <div className="schema-preview-error">{error}</div>}
      </div>

      {/* Preview */}
      <div className="schema-preview-section schema-preview-preview-section">
        <div className="schema-preview-preview-bar">
          <span>实时预览</span>
        </div>
        <div className="schema-preview-ami-container" ref={containerRef}>
          <AmisLivePreview
            ref={previewRef}
            key={renderKey}
            schema={schema}
            data={data}
            onDataChange={(merged) => {
              // Convert flat dot-notation keys to nested structure
              const nested: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(merged)) {
                if (k.includes('.')) {
                  setByPath(nested, k, v);
                } else {
                  nested[k] = v;
                }
              }
              setDataJson(JSON.stringify(nested, null, 2));
            }}
          />
        </div>
      </div>

      {/* AI Generator Drawer */}
      <AIGeneratorDrawer
        visible={aiDrawerVisible}
        onClose={handleAIDrawerClose}
        onApply={handleAIApply}
        currentSchema={schemaJson}
        currentData={dataJson}
      />

      {/* AI Error toast */}
      {aiError && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: 'var(--danger)',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1001,
            cursor: 'pointer',
            maxWidth: '90vw',
          }}
          onClick={() => setAiError(null)}
        >
          {aiError}
        </div>
      )}
    </div>
  );
});

SchemaPreview.displayName = 'SchemaPreview';

export default SchemaPreview;
