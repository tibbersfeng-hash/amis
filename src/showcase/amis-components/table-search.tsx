import { amisPage } from "./helpers";

export default [
  ...amisPage('table-search', '数据组件', 'Table+Search — 表格+搜索',
      '带顶部搜索表单的表格，支持单条件搜索和服务端分页。搜索表单通过 filter 配置，提交后自动触发接口刷新。分页条最多显示 6 个页码按钮，大量数据时自动显示省略号。',
      {
        type: 'crud',
        mode: 'table',
        syncLocation: false,
        api: '/api/mock/table-search',
        filter: {
          title: '查询条件',
          mode: 'normal',
          wrapWithPanel: true,
          className: 'search-form',
          body: [
            {
              type: 'input-text',
              name: 'orderId',
              label: 'Order ID',
              placeholder: '请输入订单号',
            },
          ],
          actions: [
            {
              type: 'submit',
              label: '查询',
              level: 'primary',
              className: 'btn-search',
            },
            {
              type: 'reset',
              label: '重置',
              className: 'btn-clear',
            },
          ],
        },
        columns: [
          { name: 'orderDate', label: 'Purchase Date / Issue Date', width: 100 },
          { name: 'orderId', label: 'Order ID', width: 120 },
          { name: 'activityId', label: 'Activity ID', width: 80 },
          { name: 'dealCode', label: 'Deal Code', width: 80 },
          { name: 'discountDesc', label: 'Discount Deal Name', width: 140 },
          { name: 'dealName', label: 'Deal Name', width: 80 },
          { name: 'dealType', label: 'Deal Type', width: 100 },
          { name: 'sellingPrice', label: 'Selling Price', width: 90 },
          { name: 'businessUnit', label: 'Business Unit', width: 100 },
          { name: 'guestName', label: 'Guest Name', width: 120 },
          { name: 'mobileEmail', label: 'Mobile Email', width: 130 },
          {
            type: 'operation',
            label: 'Operation',
            fixed: 'right',
            width: 60,
            buttons: [
              { type: 'button', label: 'View', level: 'link' },
            ],
          },
        ],
        expandable: {
          expandableOn: 'record.subItems && record.subItems.length > 0',
          keyField: 'orderId',
        },
        headerToolbar: [],
        perPage: 10,
        perPageAvailable: [10, 20, 50],
        footerToolbar: [
          { type: 'statistics', align: 'left' },
          { type: 'pagination', align: 'center', maxButtons: 6, showPageInput: false },
          { type: 'switch-per-page', align: 'right' },
        ],
      },
      {},
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 数据接口 |\n| `filter` | `object` | - | 搜索表单配置 |\n| `columns` | `Column[]` | - | 列配置 |\n| `perPage` | `number` | `10` | 每页条数 |\n| `expandable` | `object` | - | 行展开配置 |\n| `headerToolbar` | `ToolbarItem[]` | - | 头部工具栏 |\n| `footerToolbar` | `ToolbarItem[]` | - | 底部工具栏 |\n| `maxButtons` | `number` | `5` | 分页最大按钮数 |\n| `showPageInput` | `boolean` | `true` | 是否显示页码输入 |"),
];
