import { amisPage } from "./helpers";

export default [
  ...amisPage('editor', '表单输入', 'Editor — 代码编辑器',
      '基于 Monaco Editor 的代码编辑器，支持语法高亮、代码补全。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'editor', name: 'code', label: '代码编辑', language: 'javascript', height: 200 },
          { type: 'diff-editor', name: 'diff', label: '差异对比', language: 'javascript', height: 200 },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `language` | `string` | `javascript` | 代码语言 |\n| `height` | `number` | - | 编辑器高度 |\n| `readOnly` | `boolean` | `false` | 是否只读 |"),
];
