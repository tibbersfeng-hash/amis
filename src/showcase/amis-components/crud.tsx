import { amisPage } from "./helpers";

export default [
  ...amisPage('crud', '数据组件', 'CRUD — 增删改查',
      '完整的数据 CRUD 组件，内置表格、分页、搜索、操作等功能。',
      {
        type: 'crud',
        api: '',
        data: {
          items: [
            { id: 1, name: '任务 A', status: 'active', progress: 80 },
            { id: 2, name: '任务 B', status: 'pending', progress: 30 },
            { id: 3, name: '任务 C', status: 'completed', progress: 100 },
            { id: 4, name: '任务 D', status: 'active', progress: 55 },
          ],
          total: 4,
        },
        columns: [
          { name: 'id', label: 'ID', width: 60 },
          { name: 'name', label: '任务名称', sortable: true },
          { name: 'status', label: '状态', type: 'mapping', map: { active: '进行中', pending: '待启动', completed: '已完成' } },
          { name: 'progress', label: '进度', type: 'progress' },
          {
            type: 'operation',
            label: '操作',
            width: 150,
            buttons: [
              { type: 'button', label: '查看', level: 'link' },
              { type: 'button', label: '编辑', level: 'link' },
            ],
          },
        ],
        perPageAvailable: [10, 20, 50],
        headerToolbar: ['bulkActions', 'columns-toggler'],
        footerToolbar: ['switch-per-page', 'pagination'],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 数据接口 |\n| `loadDataOnce` | `boolean` | `false` | 是否一次性加载 |\n| `columns` | `Column[]` | - | 列配置 |\n| `filter` | `object` | - | 过滤表单配置 |\n| `headerToolbar` | `ToolbarItem[]` | - | 头部工具栏 |\n| `footerToolbar` | `ToolbarItem[]` | - | 底部工具栏 |\n| `perPage` | `number` | `10` | 每页条数 |\n| `perPageAvailable` | `number[]` | - | 可选每页条数 |\n| `affixHeader` | `boolean` | - | 是否固定表头 |"),
];
