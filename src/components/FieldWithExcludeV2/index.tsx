import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps } from 'amis';

/**
 * FieldWithExcludeV2 — Amis custom form control with select + Exclude checkbox.
 *
 * Renders a custom label row with Exclude checkbox, then uses Amis native select
 * for the dropdown. When Exclude is toggled, values are written to excludeName
 * instead of the base name field.
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
  label?: string;
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
    label = '',
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

  const handleCheckboxToggle = useCallback(() => {
    const next = !isExcluded;
    setIsExcluded(next);

    if (onBulkChange) {
      onBulkChange({ [checkboxName]: next });
    }
    if (onChange) {
      onChange(next, checkboxName);
    }
  }, [isExcluded, checkboxName, onBulkChange, onChange]);

  if (!render) {
    return <div style={{ color: 'red' }}>ERROR: render function not available</div>;
  }

  return (
    <div className="field-with-exclude-v2" style={{ marginBottom: 16 }}>
      {/* Label row: label + Exclude checkbox */}
      <div className="field-with-exclude-v2-label-row" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <label className="field-with-exclude-v2-label" style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#2D3348',
        }}>
          {label}
        </label>
        <label
          className="field-with-exclude-v2-checkbox-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: 14,
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

      {/* Amis native select — uses activeFieldName to switch between name and excludeName */}
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
        }, {
          data: data as Record<string, unknown>,
        })}
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

// Register the renderer
console.log('[FieldWithExcludeV2] Registering field-with-exclude-v2 renderer...');
registerRenderer({
  type: 'field-with-exclude-v2',
  name: 'field-with-exclude-v2',
  component: FieldWithExcludeV2Inner,
});
console.log('[FieldWithExcludeV2] Renderer registered successfully');

export { FieldWithExcludeV2Inner as FieldWithExcludeV2 };
export default FieldWithExcludeV2Inner;
export type { FieldWithExcludeV2Props, FieldWithExcludeV2Schema };
