import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { registerRenderer } from 'amis';
import { observer } from 'mobx-react';
import { configure } from 'mobx';
import type { FormControlProps } from 'amis';

configure({ isolateGlobalState: true });

/**
 * FieldWithExclude — Amis custom form control with select + Exclude checkbox.
 *
 * Renders a label row with an "Exclude" checkbox on the right,
 * and a custom dropdown select below. When Exclude is checked,
 * selected values are written to the exclude field name.
 *
 * Schema usage:
 * {
 *   "type": "field-with-exclude",
 *   "name": "marketCodes",
 *   "label": "Market Code",
 *   "excludeName": "marketCodesExclude",
 *   "excludeCheckboxName": "marketCodeExclude",
 *   "multiple": true,
 *   "searchable": true,
 *   "options": [...]
 * }
 */

interface FieldWithExcludeSchema {
  type: 'field-with-exclude';
  /** Field name when Exclude is checked */
  excludeName?: string;
  /** Checkbox field name */
  excludeCheckboxName?: string;
  /** Label text */
  label?: string;
  name?: string;
  options?: Array<{ label: string; value: string }>;
  source?: unknown;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  valueField?: string;
  labelField?: string;
  joinValues?: boolean;
  delimiter?: string;
  className?: string;
  [key: string]: unknown;
}

interface FieldWithExcludeProps extends FormControlProps, FieldWithExcludeSchema {}

const FieldWithExcludeInner = forwardRef<HTMLDivElement, FieldWithExcludeProps>((props, _ref) => {
  const {
    label = '',
    name = '',
    excludeName,
    excludeCheckboxName,
    options = [],
    source,
    multiple = false,
    searchable = false,
    placeholder = 'Please Select',
    value,
    onChange,
    onBulkChange,
    formStore,
    data,
    valueField = 'value',
    labelField = 'label',
  } = props;

  const checkboxName = excludeCheckboxName || `${name}Exclude`;
  const excludeFieldName = excludeName || `${name}Exclude`;

  // Extract just the boolean we need from data (stable across renders unless value changes)
  const dataExcluded = !!(data as Record<string, unknown>)?.[checkboxName];

  // Local state for immediate UI feedback; initialized from data
  const [localExcluded, setLocalExcluded] = useState(dataExcluded);
  const lastDataExcludedRef = useRef(dataExcluded);

  // Sync local state only when data value actually changes (not ref)
  useEffect(() => {
    if (dataExcluded !== lastDataExcludedRef.current) {
      lastDataExcludedRef.current = dataExcluded;
      setLocalExcluded(dataExcluded);
    }
  }, [dataExcluded]);

  const isExcluded = localExcluded;
  const activeFieldName = isExcluded ? excludeFieldName : name;

  // Normalize value
  const currentValue = (data as Record<string, unknown>)?.[activeFieldName] ?? value;
  const selectedValues: string[] = Array.isArray(currentValue)
    ? currentValue
    : currentValue
      ? [String(currentValue)]
      : [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resolve options (support source as array or static options)
  const resolvedOptions = Array.isArray(source)
    ? source.map((item: any) => ({
        label: item[labelField] || item.label,
        value: String(item[valueField] ?? item.value),
      }))
    : options;

  const selectedOptions = resolvedOptions.filter(o => selectedValues.includes(o.value));
  const baseDisplayText = selectedOptions.length > 0
    ? selectedOptions.map(o => o.label).join(', ')
    : placeholder;
  const displayText = isExcluded ? `${baseDisplayText} (Exclude)` : baseDisplayText;

  const filteredOptions = searchable && search
    ? resolvedOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : resolvedOptions;

  const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

  // Emit form change event to ensure Amis propagates store updates
  // to parent onChange callbacks (needed because onBulkChange doesn't call emitChange).
  // Read current data directly from formStore (which is already updated by onBulkChange).
  const emitFormChange = useCallback((newValues: Record<string, unknown>) => {
    if (onChange && typeof onChange === 'function') {
      const primaryKey = Object.keys(newValues)[0];
      if (primaryKey) {
        // Read the full current data from formStore (already updated by onBulkChange)
        const currentData = formStore ? (formStore as any).data : {};
        // onChange(value, name) triggers handleChange → emitChange
        // emitChange reads store.data which now has the updated values
        onChange(newValues[primaryKey], primaryKey);
      }
    }
  }, [onChange, formStore]);

  const handleCheckboxChange = useCallback(() => {
    const next = !isExcluded;
    const excludeTarget = next ? excludeFieldName : name;
    const bulkValues = {
      [checkboxName]: next,
      [excludeTarget]: selectedValues, // preserve selected values in the target field
    };
    setLocalExcluded(next);
    if (onBulkChange) {
      onBulkChange(bulkValues);
      emitFormChange(bulkValues);
    }
    setOpen(false);
  }, [checkboxName, isExcluded, excludeFieldName, name, selectedValues, onBulkChange, emitFormChange]);

  const toggleOption = useCallback((optValue: string) => {
    console.log('[toggleOption] called with:', optValue);
    if (multiple) {
      const newValues = selectedValues.includes(optValue)
        ? selectedValues.filter(v => v !== optValue)
        : [...selectedValues, optValue];
      const bulkValues = { [activeFieldName]: newValues };
      if (onBulkChange) {
        onBulkChange(bulkValues);
        emitFormChange(bulkValues);
      }
    } else {
      const bulkValues = { [activeFieldName]: optValue };
      if (onBulkChange) {
        onBulkChange(bulkValues);
        emitFormChange(bulkValues);
      }
      setOpen(false);
    }
  }, [multiple, selectedValues, activeFieldName, onBulkChange, emitFormChange]);

  const clearSelection = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const bulkValues = { [activeFieldName]: multiple ? [] : undefined };
    if (onBulkChange) {
      onBulkChange(bulkValues);
      emitFormChange(bulkValues);
    }
    setOpen(false);
    setSearch('');
  }, [activeFieldName, multiple, onBulkChange, emitFormChange]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="field-with-exclude" style={{ marginBottom: 16 }}>
      {/* Label row: label + Exclude checkbox */}
      <div className="field-exclude-row">
        <span className="field-exclude-label">{label}</span>
        <label
          className="field-exclude-checkbox-label"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: 14,
            color: '#666666',
          }}
        >
          <div
            className="field-exclude-checkbox"
            onClick={() => handleCheckboxChange()}
            style={{
              width: 16,
              height: 16,
              border: isExcluded ? 'none' : '1.5px solid #D9DDE6',
              borderRadius: 3,
              backgroundColor: isExcluded ? '#4A5CBF' : 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.1s',
            }}
          >
            {isExcluded && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
          </div>
          Exclude
        </label>
      </div>

      {/* Custom dropdown */}
      <div className="field-exclude-select" ref={dropdownRef} onClick={toggleOpen} style={{
        position: 'relative',
        width: '100%',
        height: 36,
        border: '1px solid #D9DDE6',
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px 0 12px',
        fontSize: 14,
        color: selectedValues.length > 0 ? '#333333' : '#9CA3AF',
        transition: 'border-color 0.15s',
      }}>
        <div style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {displayText}
        </div>

        {selectedValues.length > 0 && (
          <span
            data-clear-btn
            onClick={clearSelection}
            style={{
              marginRight: 4,
              fontSize: 16,
              color: '#9CA3AF',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >×</span>
        )}

        <span style={{
          position: 'absolute',
          right: 12,
          fontSize: 12,
          color: '#666666',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s',
        }}>▼</span>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            border: '1px solid #D9DDE6',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 1000,
            maxHeight: 240,
            overflow: 'auto',
          }}>
            {searchable && (
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #E8E8E8' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    height: 28,
                    padding: '0 8px',
                    border: '1px solid #D9DDE6',
                    borderRadius: 4,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {filteredOptions.map(opt => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  data-option-value={opt.value}
                  onClick={e => { e.stopPropagation(); toggleOption(opt.value); }}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    padding: '8px 12px',
                    fontSize: 14,
                    color: isSelected ? '#4A5CBF' : '#333333',
                    backgroundColor: isSelected ? '#F0F1FF' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget.style.backgroundColor = '#F5F6FA');
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget.style.backgroundColor = 'transparent');
                  }}
                >
                  {multiple && (
                    <span style={{
                      width: 16,
                      height: 16,
                      border: isSelected ? 'none' : '1.5px solid #D9DDE6',
                      borderRadius: 3,
                      backgroundColor: isSelected ? '#4A5CBF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                    </span>
                  )}
                  {opt.label}
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div style={{ padding: '12px', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                No results
              </div>
            )}
          </div>
        )}
      </div>

      {isExcluded && (
        <div style={{ marginTop: 4, fontSize: 12, color: '#E84545', display: 'flex', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 6px',
            border: '1px solid #E84545',
            borderRadius: 3,
            marginRight: 6,
            fontSize: 11,
            fontWeight: 500,
            lineHeight: 1.4,
          }}>Exclude</span>
          Values selected above will be excluded
        </div>
      )}

      {/* Hidden data sink for showcase form submission — AmisLivePreview MutationObserver reads this */}
      <div
        data-field-data
        data-field-name={name}
        style={{ display: 'none' }}
      >
        {JSON.stringify({ [activeFieldName]: selectedValues.length > 0 ? (multiple ? selectedValues : selectedValues[0]) : undefined, [checkboxName]: isExcluded })}
      </div>
    </div>
  );
});

export const FieldWithExcludeComponent = observer(FieldWithExcludeInner);
FieldWithExcludeComponent.displayName = 'FieldWithExclude';

export const FieldWithExcludeRenderer = registerRenderer({
  type: 'field-with-exclude',
  name: 'field-with-exclude',
  component: FieldWithExcludeComponent,
});

export type { FieldWithExcludeProps, FieldWithExcludeSchema };
