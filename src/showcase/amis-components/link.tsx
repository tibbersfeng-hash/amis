import { amisPage } from "./helpers";

export default [
  ...amisPage('link', '高级组件', 'Link — 链接',
      '链接组件，支持外部链接和内部路由。',
      {
        type: 'page',
        body: {
          type: 'link',
          href: 'https://aisuda.bce.baidu.com/amis/',
          body: 'Amis 官方文档',
          blank: true,
          className: 'text-primary',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `href` | `string` | - | 链接地址 |\n| `body` | `string \\| Schema` | - | 链接内容 |\n| `blank` | `boolean` | `false` | 是否新窗口打开 |\n| `title` | `string` | - | 悬浮提示文本 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
