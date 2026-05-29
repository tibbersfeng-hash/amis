import { amisPage } from "./helpers";

export default [
  ...amisPage('formula', '高级组件', 'Formula — 公式',
      '通过公式计算设置字段值。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-number', name: 'price', label: '单价', value: 100 },
          { type: 'input-number', name: 'quantity', label: '数量', value: 5 },
          {
            type: 'formula',
            name: 'total',
            formula: '${price} * ${quantity}',
          },
          { type: 'input-text', name: 'total', label: '总价（自动计算）', readOnly: true },
        ],
      },
      { price: 100, quantity: 5, total: 500 },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `formulas` | `FormulaItem[]` | - | 公式列表 |\n| `name` | `string` | - | 目标字段名 |\n| `formula` | `string` | - | 计算公式表达式 |\n| `mode` | `string` | `normal` | 运行模式 |"),
];
