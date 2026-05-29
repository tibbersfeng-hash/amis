import { amisPage } from "./helpers";

export default [
  ...amisPage('input-array', '高级组件', 'InputArray — 数组编辑',
      '简单数组编辑组件。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-array', name: 'tags', label: '标签列表' },
        ],
      },
      {
        tags: ['前端', '后端'],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `FormItem` | - | 数组项配置 |\n| `addButtonText` | `string` | - | 添加按钮文本 |\n| `removable` | `boolean` | `true` | 是否可删除 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `addable` | `boolean` | `true` | 是否可添加 |"),
];
