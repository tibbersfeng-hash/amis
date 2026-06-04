import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps, RenderSchema } from 'amis';

/**
 * FieldWithExcludeV2 — Amis custom form control built from native Amis components.
 *
 * Uses render() to compose a native checkbox (Exclude toggle) + native select.
 * When Exclude is checked, selected values are written to excludeName instead of name.
 *
 * Schema usage:
 * {
 *   "type": "field-with-exclude-v2",
 *   "name": "marketCodes",
 *   "label": "Market Code",
 *   "excludeName": "marketCodesExclude",
 *   "excludeLabel": "Exclude",
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
    value,
    onChange,
    data,
    render,
    valueField = 'value',
    labelField = 'label',
    className,
  } = props;

  const checkboxName = excludeCheckboxName || `${name}Exclude`;
  const effectiveExcludeName = excludeName || `${name}Exclude`;

  // Determine exclude state from data
  const dataExcluded = !!(data as Record<string, unknown>)?.[checkboxName];
  const [isExcluded, setIsExcluded] = useState(dataExcluded);
  const lastDataExcludedRef = useRef(dataExcluded);

  // Sync when data changes externally
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

  // Determine which field name to use based on exclude state
  const activeFieldName = isExcluded ? effectiveExcludeName : name;

  // Build select schema — use Amis native select
  const selectSchema: RenderSchema = {
    type: 'select',
    name: activeFieldName,
    label: false, // we render our own label row
    placeholder,
    multiple,
    searchable,
    options: resolvedOptions,
    className: className,
  };

  // Build checkbox schema — use Amis native checkbox
  const checkboxSchema: RenderSchema = {
    type: 'checkbox',
    name: checkboxName,
    label: excludeLabel,
    className: 'field-with-exclude-v2-checkbox',
    option: excludeLabel,
    trueValue: true,
    falseValue: false,
  };

  const handleCheckboxChange = useCallback((newValue: unknown, fieldName: string) => {
    const next = !!newValue;
    setIsExcluded(next);
    // Also update the checkbox field in data
    if (onChange) {
      onChange(newValue, fieldName);
    }
  }, [onChange]);

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
        {render ? (
          <div className="field-with-exclude-v2-checkbox-wrap">
            {render('checkbox', checkboxSchema, {
              data: { [checkboxName]: isExcluded },
              onChange: handleCheckboxChange,
            })}
          </div>
        ) : (
          <div style={{ color: 'red' }}>ERROR: render not available</div>
        )}
      </div>

      {/* Amis native select */}
      {render ? (
        <div className="field-with-exclude-v2-select-wrap">
          {render('select', selectSchema, {
            data: {
              ...(data as Record<string, unknown>),
              [activeFieldName]: value,
            },
          })}
        </div>
      ) : (
        <div style={{ color: 'red' }}>ERROR: render not available</div>
      )}

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
