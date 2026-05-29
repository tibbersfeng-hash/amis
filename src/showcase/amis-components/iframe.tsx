import { amisPage } from "./helpers";

export default [
  ...amisPage('iframe', '高级组件', 'IFrame — 内嵌页面',
      '在 Amis 中嵌入外部网页。',
      {
        type: 'page',
        body: {
          type: 'iframe',
          src: 'https://example.com',
          width: '100%',
          height: 400,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `src` | `string` | - | 嵌入页面地址 |\n| `height` | `number` | - | iframe 高度 |\n| `width` | `string` | `100%` | iframe 宽度 |\n| `id` | `string` | - | iframe 标识 |"),
];
