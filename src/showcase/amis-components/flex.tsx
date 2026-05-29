import { amisPage } from "./helpers";

export default [
  ...amisPage('flex', '布局组件', 'Flex — Flexbox 布局',
      'Flex 弹性布局。',
      {
        type: 'page',
        body: {
          type: 'flex',
          direction: 'row',
          justify: 'space-around',
          alignItems: 'center',
          items: [
            { type: 'tpl', tpl: '<div style="padding:16px;background:#4A5CBF;color:#fff;border-radius:8px">项目 A</div>', inline: false },
            { type: 'tpl', tpl: '<div style="padding:16px;background:#52c41a;color:#fff;border-radius:8px">项目 B</div>', inline: false },
            { type: 'tpl', tpl: '<div style="padding:16px;background:#ff9800;color:#fff;border-radius:8px">项目 C</div>', inline: false },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `Schema[]` | - | 子元素列表 |\n| `direction` | `string` | `row` | 主轴方向 |\n| `justify` | `string` | `flex-start` | 主轴对齐方式 |\n| `alignItems` | `string` | `stretch` | 交叉轴对齐方式 |\n| `wrap` | `string` | `nowrap` | 是否换行 |\n| `gap` | `string` | - | 间距 |"),
];
