import { amisPage } from "./helpers";

export default [
  ...amisPage('custom', '高级组件', 'Custom — 自定义组件',
      '自定义渲染器容器。',
      {
        type: 'page',
        body: {
          type: 'custom',
          html: '<div style="padding: 20px; background: linear-gradient(135deg, #4A5CBF, #3d4fb0); color: white; border-radius: 12px; text-align: center;"><h2>自定义 HTML 渲染</h2><p>这是一个通过 custom 组件渲染的自定义 UI</p></div>',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `id` | `string` | - | 自定义组件标识 |\n| `tag` | `string` | `div` | 渲染标签 |\n| `inline` | `boolean` | `false` | 是否内联 |\n| `html` | `string` | - | 自定义 HTML 内容 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
