import { amisPage } from "./helpers";

export default [
  ...amisPage('hbox', '布局组件', 'HBox — 水平布局',
      '水平排列的盒子，支持不等宽列。',
      {
        type: 'page',
        body: {
          type: 'hbox',
          columns: [
            { body: '25%', style: { background: '#4A5CBF', color: '#fff', padding: '16px', borderRadius: '4px', textAlign: 'center' } },
            { body: '50%', style: { background: '#52c41a', color: '#fff', padding: '16px', borderRadius: '4px', textAlign: 'center' } },
            { body: '25%', style: { background: '#E84545', color: '#fff', padding: '16px', borderRadius: '4px', textAlign: 'center' } },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `HBoxColumn[]` | - | 列配置 |\n| `columnsCount` | `number` | - | 每行列数 |\n| `gap` | `string` | - | 列间距 |\n| `align` | `string` | - | 垂直对齐 |"),
];
