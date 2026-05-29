import { amisPage } from "./helpers";

export default [
  ...amisPage('matrix-checkboxes', '高级组件', 'MatrixCheckboxes — 矩阵复选',
      '矩阵形式的复选框组。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'matrix-checkboxes',
            name: 'matrix',
            label: '评估矩阵',
            columns: [
              { label: '好' },
              { label: '一般' },
              { label: '差' },
            ],
            rows: [
              { label: '功能完整性' },
              { label: '用户体验' },
              { label: '性能表现' },
              { label: '安全性' },
            ],
          },
        ],
      },
      {
        matrix: { '功能完整性': '好', '用户体验': '一般' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `MatrixColumn[]` | - | 矩阵列配置 |\n| `rows` | `MatrixRow[]` | - | 矩阵行配置 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |"),
];
