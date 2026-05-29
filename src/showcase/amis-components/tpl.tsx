import { amisPage } from "./helpers";

export default [
  ...amisPage('tpl', '展示组件', 'Tpl — 模板',
      '使用模板语法渲染静态或动态内容，支持 HTML。',
      {
        type: 'page',
        body: {
          type: 'tpl',
          tpl: '<h3>欢迎使用 Amis</h3><p style="color: #666;">这是一个模板组件，支持 HTML 渲染。</p>',
          inline: false,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tpl` | `string` | - | 模板内容（支持 HTML） |\n| `inline` | `boolean` | `false` | 是否内联显示 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
