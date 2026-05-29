import { amisPage } from "./helpers";

export default [
  ...amisPage('divider', '布局组件', 'Divider — 分割线',
      '视觉分割线，支持文字标题。',
      {
        type: 'page',
        body: [
          { type: 'tpl', tpl: '<p>上方内容</p>', inline: false },
          { type: 'divider' },
          { type: 'divider', title: '带标题分割线' },
          { type: 'tpl', tpl: '<p>下方内容</p>', inline: false },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 分割线标题 |\n| `lineStyle` | `string` | `solid` | 线型（solid/dashed/dotted） |\n| `direction` | `string` | `horizontal` | 方向 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
