import { amisPage } from "./helpers";

export default [
  ...amisPage('mapping', '高级组件', 'Mapping — 映射',
      '将值映射为对应的文本或组件。',
      {
        type: 'page',
        body: {
          type: 'table',
          columns: [
            { name: 'id', label: 'ID' },
            { name: 'name', label: '名称' },
            { name: 'status', label: '状态', type: 'mapping', map: { '1': '启用', '0': '禁用' } },
            { name: 'type', label: '类型', type: 'mapping', map: { 'A': { type: 'tag', label: '类型 A', color: 'success' }, 'B': { type: 'tag', label: '类型 B', color: 'warning' } } },
          ],
          data: {
            items: [
              { id: 1, name: '项目 A', status: '1', type: 'A' },
              { id: 2, name: '项目 B', status: '0', type: 'B' },
              { id: 3, name: '项目 C', status: '1', type: 'A' },
            ],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `map` | `object` | - | 映射配置 |\n| `source` | `API` | - | 远程映射数据源 |"),
];
