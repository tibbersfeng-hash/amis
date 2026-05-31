import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import { getLocale } from '../utils/locale';
import { processSchemaMultiLang, flattenDataMultiLang } from '../utils/multiLang';
import { mockApiFetcher } from './mock-api';
import type { Language } from '../components/LanguageSwitcher';

export interface AmisLivePreviewRef {
  /** Returns the current form data (latest user values) */
  getData: () => Record<string, unknown>;
  /** Reads DOM input values and calls onDataChange */
  syncData: () => void;
  /** Resets tracked user modifications so new data from props takes effect */
  resetModifications: () => void;
}

interface AmisLivePreviewProps {
  schema: Record<string, unknown>;
  data?: Record<string, unknown>;
  /**
   * Language for multiLang content values.
   * When set, flattens {zh,en} objects to the specified language.
   * Default: 'zh'
   */
  lang?: Language;
  /** Optional label to display above the preview */
  label?: string;
  /** Called with merged form data whenever form values change */
  onDataChange?: (data: Record<string, unknown>) => void;
}

/**
 * Recursively extracts combo names from the schema.
 * Returns a Set of combo `name` values found in the schema tree.
 */
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

/**
 * Renders an arbitrary Amis schema for live preview in the showcase.
 * Processes multiLang content values ({zh,en} → single language) before rendering.
 *
 * Preserves user modifications across language switches by storing mutated values
 * in a ref and merging them with the processed data on each re-render.
 */
export const AmisLivePreview = forwardRef<AmisLivePreviewRef, AmisLivePreviewProps>(({
  schema,
  data = {},
  lang = 'zh',
  label,
  onDataChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Store user-modified values — survives language switch and re-mount
  const modifiedValues = useRef<Record<string, unknown>>({});
  // Track last synced values to prevent infinite re-render loop
  const lastSyncedRef = useRef<string>('');
  // Track if we've received an onChange callback (means user has modified something)
  const [userValues, setUserValues] = useState<Record<string, unknown> | null>(null);

  // Expose getData and syncData via ref
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

      // Read combo names from schema
      const comboNames = extractComboNames(schema);

      // Handle tabsMode combos (.cxd-ComboControl with .cxd-ComboTabs inside)
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
        // Click through all tabs to mount all panes
        const tabLinks = comboTabs.querySelectorAll('.cxd-Tabs-link:not(.cxd-ComboTabs-addLink) a');
        tabLinks.forEach(link => (link as HTMLElement).click());
        // Read all .cxd-Combo-itemInner elements
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

      // Read classic combos (.cxd-Combo not inside a tabsMode combo control)
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

      // Read non-combo inputs (dot-notation names preserved)
      const inputs = containerRef.current.querySelectorAll('input[name], textarea[name], select[name]');
      inputs.forEach((el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
        const name = el.getAttribute('name');
        if (name && !comboFieldNames.has(name)) {
          const value = 'value' in el ? el.value : undefined;
          if (value !== undefined) result[name] = value;
        }
      });

      // Also read data-field-data divs
      try {
        const dataEls = containerRef.current.querySelectorAll('[data-field-data]');
        dataEls?.forEach((el: Element) => {
          try {
            Object.assign(result, JSON.parse(el.textContent || '{}'));
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }

      // Only update state if values actually changed — prevents unnecessary re-renders
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
  }), [onDataChange, schema]);

  useEffect(() => {
    if (!containerRef.current || !schema) return;

    // Merge user-modified values with initial data
    // When user modified something, those values take precedence
    const baseData = userValues || data;

    // Process schema: flatten {zh,en} content values based on language
    const processedSchema = processSchemaMultiLang(schema, lang);

    // Process data: flatten {zh,en} values based on language
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
        // Capture form value changes and store them
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

    ReactDOM.render(amisScoped, containerRef.current);

    // Watch for custom data-field-data divs that custom components write
    const syncFieldData = () => {
      const dataEls = containerRef.current?.querySelectorAll('[data-field-data]');
      let changed = false;
      dataEls?.forEach((el: Element) => {
        try {
          const parsed = JSON.parse(el.textContent || '{}');
          modifiedValues.current = { ...modifiedValues.current, ...parsed };
          changed = true;
        } catch { /* ignore */ }
      });
      // Only update state if values actually changed — prevents infinite re-render loop
      if (changed) {
        const snapshot = JSON.stringify(modifiedValues.current);
        if (snapshot !== lastSyncedRef.current) {
          lastSyncedRef.current = snapshot;
          setUserValues({ ...modifiedValues.current });
          onDataChange?.({ ...modifiedValues.current });
        }
      }
    };
    // Run after Amis renders
    let observer: MutationObserver | null = null;
    requestAnimationFrame(() => {
      syncFieldData();
      // Watch for DOM mutations (custom data-field-data, pagination, etc.)
      observer = new MutationObserver(() => {
        syncFieldData();
      });
      if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
      }
    });

    return () => {
      observer?.disconnect();
      if (containerRef.current) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, data, lang]);

  return (
    <div className="amis-live-preview-wrapper">
      {label && <div className="amis-live-preview-label">{label}</div>}
      <div ref={containerRef} className="amis-live-preview amis-scope" />
    </div>
  );
});

AmisLivePreview.displayName = 'AmisLivePreview';
