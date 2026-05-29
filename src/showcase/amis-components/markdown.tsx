import { amisPage } from "./helpers";

export default [
  ...amisPage('markdown', '展示组件', 'Markdown — Markdown 渲染',
      '将 Markdown 文本渲染为 HTML 展示。',
      {
        type: 'page',
        body: {
          type: 'markdown',
          value: `# Amis CMS

## 特性
- **低代码**：通过 JSON 配置快速搭建页面
- **可视化**：拖拽式编辑，实时预览
- **可扩展**：支持自定义组件

> 由百度开源，广泛应用于各类后台管理系统。
          `,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | Markdown 文本内容 |\n| `src` | `string` | - | 外部 Markdown 文件地址 |\n| `className` | `string` | - | 自定义样式类名 |\n| `name` | `string` | - | 字段名（用于数据绑定） |"),
];
