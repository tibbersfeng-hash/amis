import React from 'react';

const FieldWithExcludeShowcase: React.FC = () => {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        使用 <code>"type": "field-with-exclude"</code> 即可在标签行右侧显示 Exclude 复选框。
        勾选后，下拉选中的值写入 <code>excludeName</code> 字段而非 <code>name</code> 字段。
      </p>
      <pre style={{ fontSize: 12, background: '#F5F6FA', padding: 12, borderRadius: 6, marginTop: 12 }}>
{`// 最简用法（excludeName 默认 {name}Exclude）
{
  "type": "field-with-exclude",
  "name": "marketCodes",
  "label": "Market Code",
  "multiple": true,
  "options": [...]
}
// → 勾选后写入 marketCodesExclude

// 完整用法
{
  "type": "field-with-exclude",
  "name": "marketCodes",
  "label": "Market Code",
  "excludeName": "marketCodesExclude",        // 排除模式下的值字段（可选，默认 {name}Exclude）
  "excludeCheckboxName": "marketCodeExclude",  // 复选框状态字段（可选，默认 {name}Exclude）
  "multiple": true,
  "options": [...]
}`}
      </pre>
    </div>
  );
};

export default FieldWithExcludeShowcase;
