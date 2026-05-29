import { amisPage } from "./helpers";

export default [
  ...amisPage('anchor-nav', '导航组件', 'AnchorNav — 锚点导航',
      '锚点导航，点击跳转到页面指定位置。',
      {
        type: 'page',
        body: {
          type: 'anchor-nav',
          links: [
            { title: '概述', href: '#overview' },
            { title: '功能', href: '#features' },
            { title: 'API', href: '#api' },
            { title: '示例', href: '#demo' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `links` | `AnchorLink[]` | - | 锚点链接列表 |\n| `direction` | `string` | `horizontal` | 方向 |\n| `active` | `string` | - | 当前激活项 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
