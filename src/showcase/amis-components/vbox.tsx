import { amisPage } from "./helpers";

export default [
  ...amisPage('vbox', '布局组件', 'VBox — 垂直布局',
      '垂直排列的容器。',
      {
        type: 'page',
        body: {
          type: 'v-box',
          components: [
            { type: 'tpl', tpl: '<div style="padding:12px;background:#f0f1ff;border-radius:4px">上方区块</div>', inline: false },
            { type: 'tpl', tpl: '<div style="padding:12px;background:#e8e8e8;border-radius:4px">下方区块</div>', inline: false },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `components` | `Schema[]` | - | 垂直排列的子组件 |\n| `gap` | `string` | - | 组件间距 |\n| `align` | `string` | - | 水平对齐方式 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
