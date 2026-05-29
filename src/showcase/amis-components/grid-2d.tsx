import { amisPage } from "./helpers";

export default [
  ...amisPage('grid-2d', '高级组件', 'Grid2D — 二维网格',
      '二维网格布局，支持自定义排列。',
      {
        type: 'page',
        body: {
          type: 'grid-2d',
          columns: [
            { body: { type: 'tpl', tpl: '<div style="padding:24px;background:#4A5CBF;color:#fff;border-radius:8px;text-align:center">A</div>', inline: false }, x: 1, y: 1, w: 2, h: 1 },
            { body: { type: 'tpl', tpl: '<div style="padding:24px;background:#52c41a;color:#fff;border-radius:8px;text-align:center">B</div>', inline: false }, x: 3, y: 1, w: 1, h: 2 },
            { body: { type: 'tpl', tpl: '<div style="padding:24px;background:#ff9800;color:#fff;border-radius:8px;text-align:center">C</div>', inline: false }, x: 1, y: 2, w: 1, h: 1 },
            { body: { type: 'tpl', tpl: '<div style="padding:24px;background:#E84545;color:#fff;border-radius:8px;text-align:center">D</div>', inline: false }, x: 2, y: 2, w: 1, h: 1 },
          ],
          row: 2,
          col: 3,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `Grid2DItem[]` | - | 网格项配置（含 x/y/w/h） |\n| `col` | `number` | - | 总列数 |\n| `row` | `number` | - | 总行数 |\n| `gap` | `string` | - | 网格间距 |"),
];
