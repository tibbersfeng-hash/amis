import { amisPage } from "./helpers";

export default [
  ...amisPage('user-select', '高级组件', 'UserSelect — 用户选择',
      '用户选择器组件。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'user-select',
            name: 'selectedUsers',
            label: '选择用户',
            multiple: true,
          },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `sourceApi` | `API` | - | 用户数据源 API |\n| `valueField` | `string` | `id` | 值字段名 |\n| `labelField` | `string` | `name` | 标签字段名 |\n| `multiple` | `boolean` | `false` | 是否多选 |"),
];
