import { amisPage } from "./helpers";

export default [
  ...amisPage('field-with-exclude', '高级组件', 'Select + Exclude — 带排除复选框的下拉选择',
      '使用 `type: "field-with-exclude"` 即可在标签行右侧显示 Exclude 复选框。选中后表单 key 自动切换为 exclude 字段。',
      {
        type: 'form',
        mode: 'normal',
        wrapWithPanel: false,
        body: [
          {
            type: 'field-with-exclude',
            name: 'marketCodes',
            label: 'Market Code',
            multiLang: true,
            excludeName: 'marketCodesExclude',
            excludeCheckboxName: 'marketCodeExclude',
            multiple: true,
            searchable: true,
            placeholder: 'Please Select',
            options: [
              { label: 'GDS', value: 'GDS' },
              { label: 'CORPORATE', value: 'CORPORATE' },
              { label: 'BAR', value: 'BAR' },
              { label: 'PACKAGE', value: 'PACKAGE' },
              { label: 'WHOLESALE', value: 'WHOLESALE' },
            ],
          },
          {
            type: 'divider',
          },
          {
            type: 'field-with-exclude',
            name: 'rateCodes',
            label: 'Rate Code',
            multiLang: true,
            excludeName: 'rateCodesExclude',
            excludeCheckboxName: 'rateCodeExclude',
            multiple: true,
            searchable: true,
            placeholder: 'Please Select',
            options: [
              { label: 'RACK', value: 'RACK' },
              { label: 'BAR', value: 'BAR' },
              { label: 'ADVANCE', value: 'ADVANCE' },
              { label: 'PACKAGE', value: 'PACKAGE' },
              { label: 'CORPORATE', value: 'CORPORATE' },
            ],
          },
        ],
      },
      {
        marketCodes: { zh: 'GDS,BAR', en: 'GDS,BAR' },
        rateCodes: { zh: 'RACK,BAR', en: 'RACK,BAR' },
      },
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `Option[]` | - | 选项列表 |\n| `multiple` | `boolean` | `false` | 是否多选 |\n| `excludeName` | `string` | - | 排除字段名 |\n| `excludeCheckboxName` | `string` | - | 排除复选框字段名 |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `placeholder` | `string` | - | 占位符文本 |"),
];
