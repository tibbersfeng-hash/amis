import { amisPage } from "./helpers";

export default [
  ...amisPage('input-table', '高级组件', 'InputTable — 表格编辑',
      '以表格形式编辑多行数据。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'input-table',
            name: 'items',
            label: '项目列表',
            addable: true,
            editable: true,
            removable: true,
            columns: [
              { type: 'input-text', name: 'name', label: '名称' },
              { type: 'input-number', name: 'value', label: '数值' },
              {
                type: 'select',
                name: 'type',
                label: '类型',
                options: [
                  { label: '类型 A', value: 'a' },
                  { label: '类型 B', value: 'b' },
                ],
              },
            ],
            value: [
              { name: '项目 1', value: 100, type: 'a' },
              { name: '项目 2', value: 200, type: 'b' },
            ],
          },
        ],
      },
      {
        items: [
          { name: '项目 1', value: 100, type: 'a' },
          { name: '项目 2', value: 200, type: 'b' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `FormItem[]` | - | 表格列配置 |\n| `addable` | `boolean` | `false` | 是否可添加 |\n| `removable` | `boolean` | `false` | 是否可删除 |\n| `editable` | `boolean` | `false` | 是否可编辑 |\n| `draggable` | `boolean` | `false` | 是否可拖拽排序 |\n| `sortable` | `boolean` | `false` | 是否可排序 |\n| `addButtonText` | `string` | - | 添加按钮文本 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |"),
];
