import { amisPage } from "./helpers";

export default [
  ...amisPage('picker', '高级组件', 'Picker — 列表选择',
      '弹窗选择器，从列表中选择数据。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'picker',
            name: 'selected',
            label: '选择数据',
            size: 'lg',
            source: { items: [
              { id: 1, name: '选项 A', desc: '描述 A' },
              { id: 2, name: '选项 B', desc: '描述 B' },
              { id: 3, name: '选项 C', desc: '描述 C' },
              { id: 4, name: '选项 D', desc: '描述 D' },
            ]},
            columns: [
              { name: 'id', label: 'ID' },
              { name: 'name', label: '名称' },
              { name: 'desc', label: '描述' },
            ],
          },
        ],
      },
      {
        selected: { id: 1, name: '选项 A', desc: '描述 A' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 选择器标签 |\n| `value` | `any` | - | 选中值 |\n| `size` | `string` | `md` | 弹窗尺寸 |\n| `source` | `API \\| object` | - | 数据源 |\n| `columns` | `Column[]` | - | 列表列配置 |\n| `multiple` | `boolean` | `false` | 是否多选 |\n| `name` | `string` | - | 字段名称 |"),
];
