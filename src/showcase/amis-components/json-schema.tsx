import { amisPage } from "./helpers";

export default [
  ...amisPage('json-schema', '高级组件', 'JSON Schema Editor',
      'JSON Schema 编辑器。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'json-schema',
            name: 'schema',
            label: 'Schema',
            id: 'json-schema',
            size: 'lg',
          },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `schema` | `object` | - | JSON Schema 定义 |\n| `value` | `object` | - | 当前编辑值 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `size` | `string` | `md` | 编辑器尺寸 |\n| `id` | `string` | - | 组件标识 |"),
];
