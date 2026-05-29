import { amisPage } from "./helpers";

export default [
  ...amisPage('input-color', '表单输入', 'InputColor — 颜色选择',
      '颜色选择器，支持色板、输入等交互方式。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-color', name: 'primaryColor', label: '主题色' },
          { type: 'input-color', name: 'bgColor', label: '背景色', format: 'hex' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `format` | `string` | `hex` | 颜色格式（hex/rgb/hsl） |"),
];
