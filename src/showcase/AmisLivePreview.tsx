import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import { getLocale } from '../utils/locale';
import { processSchemaMultiLang, flattenDataMultiLang } from '../utils/multiLang';
import { mockApiFetcher } from './mock-api';
import type { Language } from '../components/LanguageSwitcher';

export interface AmisLivePreviewRef {
  getData: () => Record<string, unknown>;
  syncData: () => void;
  resetModifications: () => void;
}

interface AmisLivePreviewProps {
  schema: Record<string, unknown>;
  data?: Record<string, unknown>;
  lang?: Language;
  label?: string;
  onDataChange?: (data: Record<string, unknown>) => void;
  /** Called when native click interceptor handles combo add/delete — allows parent to force re-render */
  onNativeComboChange?: (items: Record<string, unknown>[]) => void;
}

function extractComboNames(schema: Record<string, unknown>): Set<string> {
  const names = new Set<string>();
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type' && value === 'combo' && typeof schema.name === 'string') {
      names.add(schema.name);
    }
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          for (const n of extractComboNames(item as Record<string, unknown>)) {
            names.add(n);
          }
        }
      });
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const n of extractComboNames(value as Record<string, unknown>)) {
        names.add(n);
      }
    }
  }
  return names;
}

function readComboItemData(pane: Element): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const inputs = pane.querySelectorAll('input[name], select[name], textarea[name]');
  inputs.forEach((el: Element) => {
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = input.getAttribute('name');
    if (name && input.value !== undefined && input.value !== '') {
      data[name] = input.value;
    }
  });
  return data;
}

function schemaStructureKey(schema: Record<string, unknown>): string {
  const keysToIgnore = new Set(['value', 'scaffold', '_clickKey']);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(schema)) {
    if (keysToIgnore.has(k)) continue;
    if (k === 'items' && Array.isArray(v)) {
      parts.push(`items:${(v as any[]).map(item => item?.name || item?.type || '?').join(',')}`);
    } else if (k === 'tabs' && Array.isArray(v)) {
      parts.push(`tabs:${(v as any[]).map(t => t?.title || t?.label || '?').join(',')}`);
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      parts.push(`${k}:${schemaStructureKey(v as Record<string, unknown>)}`);
    } else if (!Array.isArray(v)) {
      parts.push(`${k}:${String(v)}`);
    }
  }
  return parts.join('|');
}

/**
 * AmisLivePreview renders Amis schema for live preview.
 *
 * Uses ReactDOM.render directly into the container div.
 * Amis creates its own React tree via ReactDOM.render, which is separate
 * from the parent React tree. This works because the container is a plain div.
 *
 * For combo add/delete buttons, we intercept clicks natively since Amis's
 * synthetic events don't work in a nested render context.
 */
export const AmisLivePreview = forwardRef<AmisLivePreviewRef, AmisLivePreviewProps>(({
  schema,
  data = {},
  lang = 'zh',
  label,
  onDataChange,
  onNativeComboChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modifiedValues = useRef<Record<string, unknown>>({});
  const lastSyncedRef = useRef<string>('');
  const [userValues, setUserValues] = useState<Record<string, unknown> | null>(null);
  const schemaRef = useRef<Record<string, unknown>>(schema);
  const [currentSchema, setCurrentSchema] = useState<Record<string, unknown>>(schema);
  const isUpdatingSchemaRef = useRef(false);
  const structureRef = useRef<string>('');
  const isRenderingRef = useRef(false);

  // Sync schema prop → currentSchema only if structure changed
  useEffect(() => {
    if (!isUpdatingSchemaRef.current) {
      schemaRef.current = schema;
      const newStructureKey = schemaStructureKey(schema);
      const prevStructure = structureRef.current;
      if (prevStructure && prevStructure === newStructureKey) {
        isUpdatingSchemaRef.current = false;
        return;
      }
      setCurrentSchema(schema);
    }
    isUpdatingSchemaRef.current = false;
  }, [schema]);

  // Update schema value when combo values change
  useEffect(() => {
    if (!currentSchema || isUpdatingSchemaRef.current) return;
    const comboNames = extractComboNames(currentSchema);
    if (comboNames.size === 0) return;

    let changed = false;
    const updated = { ...currentSchema };

    for (const comboName of comboNames) {
      const comboValue = modifiedValues.current[comboName];
      if (comboValue !== undefined && Array.isArray(comboValue)) {
        const currentValue = (updated.value || {})[comboName];
        if (JSON.stringify(currentValue) !== JSON.stringify(comboValue)) {
          updated.value = { ...(updated.value || {}), [comboName]: comboValue };
          changed = true;
        }
      }
    }

    if (changed) {
      isUpdatingSchemaRef.current = true;
      schemaRef.current = updated;
      setCurrentSchema(updated);
    }
  }, [modifiedValues.current, currentSchema]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render Amis directly into the visible container
  useEffect(() => {
    if (!containerRef.current || !currentSchema) return;

    isRenderingRef.current = true;
    const visibleContainer = containerRef.current;

    const baseData = userValues || data;
    const processedSchema = processSchemaMultiLang(currentSchema, lang);
    const processedData = flattenDataMultiLang(baseData, lang);

    const amisScoped = renderAmis(
      processedSchema as any,
      {
        data: { ...processedData, previewLanguage: lang },
        locale: getLocale(),
        theme: 'cxd',
      },
      {
        session: 'showcase-preview',
        theme: 'cxd',
        locale: getLocale(),
        fetcher: mockApiFetcher,
        isCancel: (value: unknown) =>
          (value as Error)?.message === 'cancel',
        notify: (type: string, msg: string) =>
          console.log(`[amis showcase] ${type}: ${msg}`),
        enableAMISDebug: false,
        onChange: (changeValue: Record<string, unknown> | null) => {
          if (changeValue && typeof changeValue === 'object') {
            modifiedValues.current = { ...modifiedValues.current, ...changeValue };
            setUserValues({ ...modifiedValues.current });
            onDataChange?.({ ...modifiedValues.current });
          }
        },
      },
      ''
    );

    let observer: MutationObserver | null = null;

    // Render in rAF to ensure container is attached to DOM
    const rafId = requestAnimationFrame(() => {
      // Unmount old content only if container has React-managed children
      if (visibleContainer.firstChild) {
        try {
          ReactDOM.unmountComponentAtNode(visibleContainer);
        } catch { /* ignore */ }
      }

      // Render fresh into visible container
      ReactDOM.render(amisScoped, visibleContainer);

      // Watch for DOM mutations (custom data-field-data, etc.)
      const syncFieldData = () => {
        const dataEls = visibleContainer.querySelectorAll('[data-field-data]');
        let changed = false;
        dataEls?.forEach((el: Element) => {
          try {
            const parsed = JSON.parse(el.textContent || '{}');
            modifiedValues.current = { ...modifiedValues.current, ...parsed };
            changed = true;
          } catch { /* ignore */ }
        });
        if (changed) {
          const snapshot = JSON.stringify(modifiedValues.current);
          if (snapshot !== lastSyncedRef.current) {
            lastSyncedRef.current = snapshot;
            setUserValues({ ...modifiedValues.current });
            onDataChange?.({ ...modifiedValues.current });
          }
        }
      };

      requestAnimationFrame(() => {
        syncFieldData();
        observer = new MutationObserver(() => {
          syncFieldData();
        });
        observer.observe(visibleContainer, { childList: true, subtree: true, characterData: true });
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      isRenderingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchema, data, lang]);

  // Intercept combo add/delete button clicks natively
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleComboClick = (e: Event) => {
      const target = e.target as HTMLElement;

      const addLink = target.closest('.cxd-ComboTabs-addLink');
      if (addLink) {
        e.preventDefault();
        e.stopPropagation();

        const comboTabs = addLink.closest('.cxd-ComboTabs');
        if (!comboTabs) return;
        const comboCtrl = comboTabs.closest('.cxd-ComboControl');
        if (!comboCtrl) return;

        const panes = comboTabs.querySelectorAll('.cxd-Tabs-pane');
        const items: Record<string, unknown>[] = [];
        panes.forEach((pane) => {
          items.push(readComboItemData(pane));
        });

        const scaffold = (currentSchema as any)?.scaffold || {};
        items.push({ ...scaffold, title: `Sub Mission ${items.length + 1}` });

        // Notify parent to update state and force re-render
        onNativeComboChange?.(items);
        return;
      }

      const deleteBtn = target.closest('[data-role="delete-btn"], .cxd-Combo-tab-delBtn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();

        const comboCtrl = deleteBtn.closest('.cxd-ComboControl');
        if (!comboCtrl) return;
        const comboTabs = comboCtrl.querySelector('.cxd-ComboTabs');
        if (!comboTabs) return;

        const tabLinks = comboTabs.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink)');
        let deleteIndex = -1;
        tabLinks.forEach((tab, i) => {
          if (tab.contains(deleteBtn)) deleteIndex = i;
        });
        if (deleteIndex === -1) return;

        const panes = comboTabs.querySelectorAll('.cxd-Tabs-pane');
        const items: Record<string, unknown>[] = [];
        panes.forEach((pane, i) => {
          if (i !== deleteIndex) {
            items.push(readComboItemData(pane));
          }
        });

        onNativeComboChange?.(items);
      }
    };

    container.addEventListener('click', handleComboClick, true);
    return () => {
      container.removeEventListener('click', handleComboClick, true);
    };
  }, [currentSchema, onDataChange]);

  useImperativeHandle(ref, () => ({
    getData: () => {
      const result: Record<string, unknown> = { ...modifiedValues.current };
      try {
        const dataEls = containerRef.current?.querySelectorAll('[data-field-data]');
        dataEls?.forEach((el: Element) => {
          try {
            const parsed = JSON.parse(el.textContent || '{}');
            Object.assign(result, parsed);
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
      return result;
    },
    syncData: () => {
      if (!containerRef.current) return;
      const result: Record<string, unknown> = { ...modifiedValues.current };
      const comboNames = extractComboNames(currentSchema);

      const allComboCtrls = containerRef.current.querySelectorAll('.cxd-ComboControl');
      const tabsModeCombos: Element[] = [];
      allComboCtrls.forEach(ctrl => {
        if (ctrl.querySelector('.cxd-ComboTabs')) tabsModeCombos.push(ctrl);
      });
      const comboFieldNames = new Set<string>();
      tabsModeCombos.forEach((comboCtrl, idx) => {
        const comboKey = comboNames.size > 0 ? [...comboNames][idx] : `combo_${idx}`;
        const comboTabs = comboCtrl.querySelector('.cxd-ComboTabs');
        if (!comboTabs) return;
        const tabLinks = comboTabs.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink) a');
        tabLinks.forEach(link => (link as HTMLElement).click());
        const inners = comboCtrl.querySelectorAll('.cxd-Combo-itemInner');
        const rows: Record<string, unknown>[] = [];
        inners.forEach((inner) => {
          const inputs = inner.querySelectorAll('input[name], textarea[name], select[name]');
          const rowData: Record<string, unknown> = {};
          inputs.forEach((el: Element) => {
            const name = el.getAttribute('name');
            if (name) {
              comboFieldNames.add(name);
              const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
              if (value !== undefined) rowData[name] = value;
            }
          });
          if (Object.keys(rowData).length > 0) rows.push(rowData);
        });
        if (rows.length > 0) result[comboKey] = rows;
      });

      const classicCombos = containerRef.current.querySelectorAll('.cxd-Combo');
      classicCombos.forEach((comboEl) => {
        const comboControl = comboEl.closest('.cxd-ComboControl');
        if (comboControl && comboControl.querySelector('.cxd-ComboTabs')) return;
        const items = comboEl.querySelectorAll('.cxd-Combo-item');
        const rows: Record<string, unknown>[] = [];
        items.forEach((row) => {
          const inputs = row.querySelectorAll('input[name], textarea[name], select[name]');
          const rowData: Record<string, unknown> = {};
          inputs.forEach((el: Element) => {
            const name = el.getAttribute('name');
            if (name) {
              comboFieldNames.add(name);
              const value = 'value' in el ? (el as HTMLInputElement).value : undefined;
              if (value !== undefined) rowData[name] = value;
            }
          });
          if (Object.keys(rowData).length > 0) rows.push(rowData);
        });
        const comboNamesArr = [...comboNames];
        const idx = tabsModeCombos.length + Array.from(classicCombos).indexOf(comboEl);
        const comboKey = comboNamesArr[idx] || `combo_${idx}`;
        if (rows.length > 0) result[comboKey] = rows;
      });

      const inputs = containerRef.current.querySelectorAll('input[name], textarea[name], select[name]');
      inputs.forEach((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
        const name = el.getAttribute('name');
        if (name && !comboFieldNames.has(name)) {
          const value = 'value' in el ? el.value : undefined;
          if (value !== undefined) result[name] = value;
        }
      });

      try {
        const dataEls = containerRef.current.querySelectorAll('[data-field-data]');
        dataEls?.forEach((el: Element) => {
          try {
            Object.assign(result, JSON.parse(el.textContent || '{}'));
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }

      const snapshot = JSON.stringify(result);
      if (snapshot === lastSyncedRef.current) return;
      lastSyncedRef.current = snapshot;

      modifiedValues.current = result;
      setUserValues(result);
      onDataChange?.(result);
    },
    resetModifications: () => {
      modifiedValues.current = {};
      setUserValues(null);
    },
  }), [onDataChange, currentSchema]);

  return (
    <div>
      {label && <div className="amis-live-preview-label">{label}</div>}
      <div ref={containerRef} className="amis-live-preview amis-scope" />
    </div>
  );
});

AmisLivePreview.displayName = 'AmisLivePreview';
