import { amisPage } from "./helpers";

export default [
  ...amisPage('hidden', '表单输入', 'Hidden — 隐藏字段',
      '不渲染可见 UI，但会在表单数据中保留值。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-text', name: 'name', label: '名称' },
          { type: 'hidden', name: 'id', value: 'HIDDEN-001' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `value` | `any` | - | 隐藏字段的值 |"),
];
