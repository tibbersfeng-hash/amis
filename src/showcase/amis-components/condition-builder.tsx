import { amisPage } from "./helpers";

export default [
  ...amisPage('condition-builder', '高级组件', 'ConditionBuilder — 条件组合',
      '可视化条件构建器。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'condition-builder',
            name: 'rule',
            label: '条件规则',
            fields: [
              { label: '用户名', name: 'username', type: 'text' },
              { label: '年龄', name: 'age', type: 'number' },
              { label: '状态', name: 'status', type: 'select', options: [{ label: '启用', value: '1' }, { label: '禁用', value: '0' }] },
            ],
          },
        ],
      },
      {
        rule: '用户名 = admin',
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `fields` | `FieldItem[]` | - | 可配置字段列表 |\n| `message` | `string` | - | 空状态提示文本 |\n| `initVisible` | `boolean` | `true` | 初始是否可见 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |"),
];
