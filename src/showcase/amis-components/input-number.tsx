import { amisPage } from "./helpers";

export default [
  ...amisPage('input-number', '表单输入', 'InputNumber — 数字输入',
      '数字输入框，支持精度、范围、步长等配置。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-number', name: 'age', label: '年龄', min: 0, max: 120, step: 1 },
          { type: 'input-number', name: 'price', label: '价格', min: 0, precision: 2, prefix: '¥' },
          { type: 'input-number', name: 'quantity', label: '数量', min: 0, max: 999, step: 10 },
        ],
      },
      { age: 25, price: 99.99, quantity: 100 },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `min` | `number` | - | 最小值 |\n| `max` | `number` | - | 最大值 |\n| `precision` | `number` | `0` | 小数精度位数 |\n| `step` | `number` | `1` | 步进值 |\n| `prefix` | `string` | - | 前缀符号 |\n| `suffix` | `string` | - | 后缀符号 |"),
];
