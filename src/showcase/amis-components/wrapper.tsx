import { amisPage } from "./helpers";

export default [
  ...amisPage('wrapper', '布局组件', 'Wrapper — 包装器',
      '外层容器，支持自定义样式和尺寸。',
      {
        type: 'page',
        body: {
          type: 'wrapper',
          className: 'bg-white p-3',
          body: { type: 'tpl', tpl: '<p>被 Wrapper 包裹的内容</p>', inline: false },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `body` | `Schema` | - | 容器内容 |\n| `className` | `string` | - | 自定义样式类名 |\n| `style` | `object` | - | 自定义行内样式 |\n| `inline` | `boolean` | `false` | 是否内联 |\n| `width` | `string` | - | 容器宽度 |"),
];
