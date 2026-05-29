import { amisPage } from "./helpers";

export default [
  ...amisPage('code', '展示组件', 'Code — 代码展示',
      '语法高亮展示代码片段。',
      {
        type: 'page',
        body: {
          type: 'code',
          value: `function hello() {\n  console.log("Hello, Amis!");\n  return {\n    type: 'page',\n    body: 'Hello World'\n  };\n}`,
          language: 'javascript',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | 代码内容 |\n| `lang` | `string` | `text` | 代码语言 |\n| `tabSize` | `number` | `4` | Tab 缩进空格数 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
