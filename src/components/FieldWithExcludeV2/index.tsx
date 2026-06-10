import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { FormItem } from 'amis';
import type { FormControlProps } from 'amis-core';

/**
 * FieldWithExcludeV2 — Amis custom form control with select + Exclude checkbox.
 *
 * Renders Amis native select with an Exclude checkbox below. When Exclude is
 * toggled, selected values are transferred between the base name field and
 * the excludeName field.
 *
 * Registered via FormItem for proper form integration (label, validation, layout modes).
 *
 * Schema usage:
 * {
 *   "type": "field-with-exclude-v2",
 *   "name": "marketCodes",
 *   "label": "Market Code",
 *   "excludeName": "marketCodesExclude",
 *   "excludeCheckboxName": "marketCodeExclude",
 *   "multiple": true,
 *   "searchable": true,
 *   "options": [...]
 * }
 */

interface FieldWithExcludeV2Schema {
  type: 'field-with-exclude-v2';
  excludeName?: string;
  excludeLabel?: string;
  excludeCheckboxName?: string;
  name?: string;
  options?: Array<{ label: string; value: string }>;
  source?: unknown;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  valueField?: string;
  labelField?: string;
  className?: string;
  [key: string]: unknown;
}

interface FieldWithExcludeV2Props extends FormControlProps, FieldWithExcludeV2Schema {}

const FieldWithExcludeV2Inner: React.FC<FieldWithExcludeV2Props> = (props) => {
  const {
    name = '',
    excludeName,
    excludeLabel = 'Exclude',
    excludeCheckboxName,
    options = [],
    source,
    multiple = false,
    searchable = false,
    placeholder = 'Please Select',
    onChange,
    onBulkChange,
    data,
    render,
    valueField = 'value',
    labelField = 'label',
    className,
  } = props;

  const checkboxName = excludeCheckboxName || `${name}Exclude`;
  const effectiveExcludeName = excludeName || `${name}Exclude`;

  // Read exclude state from data
  const dataExcluded = !!(data as Record<string, unknown>)?.[checkboxName];
  const [isExcluded, setIsExcluded] = useState(dataExcluded);
  const lastDataExcludedRef = useRef(dataExcluded);

  // Sync when data changes externally (language switch, etc.)
  useEffect(() => {
    if (dataExcluded !== lastDataExcludedRef.current) {
      lastDataExcludedRef.current = dataExcluded;
      setIsExcluded(dataExcluded);
    }
  }, [dataExcluded]);

  // Resolve options
  const resolvedOptions = useMemo(() => {
    return Array.isArray(source)
      ? source.map((item: any) => ({
          label: item[labelField] || item.label,
          value: String(item[valueField] ?? item.value),
        }))
      : options;
  }, [source, options, labelField, valueField]);

  // Determine active field name based on exclude state
  const activeFieldName = isExcluded ? effectiveExcludeName : name;

  // Read current value from the active field
  const activeFieldValue = (data as Record<string, unknown>)?.[activeFieldName];

  const handleCheckboxToggle = useCallback(() => {
    const next = !isExcluded;
    const sourceField = isExcluded ? effectiveExcludeName : name;
    const targetField = next ? effectiveExcludeName : name;

    // Copy current values to target field to preserve selection
    const currentValues = (data as Record<string, unknown>)?.[sourceField];

    const bulkUpdate: Record<string, unknown> = {
      [checkboxName]: next,
    };
    if (currentValues !== undefined) {
      bulkUpdate[targetField] = currentValues;
    }

    setIsExcluded(next);

    if (onBulkChange) {
      onBulkChange(bulkUpdate);
    }
    if (onChange) {
      onChange(bulkUpdate[checkboxName], checkboxName);
    }
  }, [isExcluded, name, effectiveExcludeName, checkboxName, data, onBulkChange, onChange]);

  if (!render) {
    return <div style={{ color: 'red' }}>ERROR: render function not available</div>;
  }

  return (
    <div className="field-with-exclude-v2">
      {/* Amis native select (label handled by FormItem wrapper) */}
      <div className="field-with-exclude-v2-select-wrap">
        {render('select', {
          type: 'select',
          name: activeFieldName,
          label: false,
          placeholder,
          multiple,
          searchable,
          options: resolvedOptions,
          className: className || '',
          value: activeFieldValue,
        }, {
          data: data as Record<string, unknown>,
        })}
      </div>

      {/* Exclude checkbox row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        marginTop: 4,
      }}>
        <label
          className="field-with-exclude-v2-checkbox-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: 13,
            color: '#666',
            userSelect: 'none',
          }}
          onClick={handleCheckboxToggle}
        >
          <input
            type="checkbox"
            checked={isExcluded}
            readOnly
            style={{ margin: 0, cursor: 'pointer' }}
          />
          {excludeLabel}
        </label>
      </div>

      {/* Exclude indicator */}
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
    </div>
  );
};

// Register as FormItem (proper form integration: label, validation, layout modes)
FormItem({
  type: 'field-with-exclude-v2',
  name: 'field-with-exclude-v2',
  strictMode: false,  // close strict mode for better re-rendering
})(FieldWithExcludeV2Inner);

export { FieldWithExcludeV2Inner as FieldWithExcludeV2 };
export default FieldWithExcludeV2Inner;
export type { FieldWithExcludeV2Props, FieldWithExcludeV2Schema };
