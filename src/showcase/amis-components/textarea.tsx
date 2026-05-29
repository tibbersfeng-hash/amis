import { amisPage } from "./helpers";

export default [
  ...amisPage('textarea', '表单输入', 'Textarea — 多行文本',
      '多行文本输入框，支持自适应高度、字数统计、格式化等。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'textarea', name: 'desc', label: '描述', multiLang: true, placeholder: '请输入多行描述...', minRows: 3 },
          { type: 'textarea', name: 'note', label: '备注', multiLang: true, placeholder: '备注信息（带字数统计）', showCounter: true, maxLength: 200 },
        ],
      },
      {
        desc: { zh: '这是一个多行描述', en: 'This is a multi-line description' },
        note: { zh: '这是一条备注信息', en: 'This is a note message' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `rows` | `number` | `3` | 默认行数 |\n| `minRows` | `number` | - | 最小行数 |\n| `maxRows` | `number` | - | 最大行数 |\n| `maxLength` | `number` | - | 最大字符数 |\n| `showCounter` | `boolean` | `false` | 是否显示字数统计 |"),
];
