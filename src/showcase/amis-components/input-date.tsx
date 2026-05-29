import { amisPage } from "./helpers";

export default [
  ...amisPage('input-date', '表单输入', 'InputDate — 日期选择',
      '日期选择器，支持日、月、年等多种格式。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-date', name: 'birthday', label: '生日', format: 'YYYY-MM-DD' },
          { type: 'input-date', name: 'month', label: '月份', format: 'YYYY-MM', inputFormat: 'YYYY年MM月' },
          { type: 'input-datetime', name: 'event', label: '事件时间', format: 'YYYY-MM-DD HH:mm' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `format` | `string` | `YYYY-MM-DD` | 显示格式 |\n| `valueFormat` | `string` | `X` | 返回值格式 |\n| `inputFormat` | `string` | - | 输入框显示格式 |\n| `clearable` | `boolean` | `true` | 是否显示清空按钮 |\n| `timeFormat` | `string` | - | 时间格式 |"),
];
