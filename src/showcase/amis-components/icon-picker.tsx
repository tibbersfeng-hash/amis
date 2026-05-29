import { amisPage } from "./helpers";

export default [
  ...amisPage('icon-picker', '表单输入', 'IconPicker — 图标选择',
      '图标选择器，内置 Font Awesome 图标库。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'icon-picker', name: 'icon', label: '选择图标' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `icons` | `string[]` | - | 自定义图标列表 |"),
];
