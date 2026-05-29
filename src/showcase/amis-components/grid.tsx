import { amisPage } from "./helpers";

export default [
  ...amisPage('grid', '布局组件', 'Grid — 栅格布局',
      '响应式栅格布局，支持多列。',
      {
        type: 'page',
        body: {
          type: 'grid',
          columns: [
            { type: 'container', body: '左列 (50%)', style: { background: '#f0f1ff', padding: '24px', borderRadius: '4px', textAlign: 'center' } },
            { type: 'container', body: '右列 (50%)', style: { background: '#e8e8e8', padding: '24px', borderRadius: '4px', textAlign: 'center' } },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `GridColumn[]` | - | 列配置 |\n| `gap` | `string` | - | 列间距 |\n| `className` | `string` | - | 自定义样式类名 |\n| `align` | `string` | - | 垂直对齐方式 |"),
];
