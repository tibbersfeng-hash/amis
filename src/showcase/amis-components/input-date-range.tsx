import { amisPage } from "./helpers";

export default [
  ...amisPage('input-date-range', '表单输入', 'InputDateRange — 日期范围',
      '日期范围选择器，可选择一个时间段。支持 YYYY-MM-DD 和 YYYY-MM-DD HH:mm:ss 格式。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-date-range', name: 'period', label: '活动时间', format: 'YYYY-MM-DD' },
          { type: 'input-datetime-range', name: 'datetimeRange', label: '详细时间', format: 'YYYY-MM-DD HH:mm:ss' },
        ],
      },
      {
        period: '2025-06-01,2025-06-30',
        datetimeRange: '2025-06-15 09:00:00,2025-06-15 18:00:00',
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `format` | `string` | `YYYY-MM-DD` | 显示格式 |\n| `valueFormat` | `string` | `X` | 返回值格式 |\n| `clearable` | `boolean` | `true` | 是否显示清空按钮 |"),
];
