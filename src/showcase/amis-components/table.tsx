import { amisPage } from "./helpers";

export default [
  ...amisPage('table', '数据组件', 'Table — 表格',
      '数据表格组件，支持分页、排序、固定列、操作列等。最后一列冻结，带外边框和单元格边框。',
      {
        type: 'crud',
        mode: 'table',
        syncLocation: false,
        api: '/api/mock/table-data',
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
          headerToolbar: [],
          perPage: 10,
          perPageAvailable: [10, 20, 50],
          footerToolbar: [
            { type: 'statistics', align: 'left' },
            { type: 'pagination', align: 'center' },
            { type: 'switch-per-page', align: 'right' },
          ],
          alwaysShowPagination: true,
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `columns` | `Column[]` | - | 列配置 |\n| `affixHeader` | `boolean \\| number` | - | 是否固定表头 |\n| `autoFillHeight` | `boolean` | `false` | 是否自适应高度 |\n| `sortable` | `boolean` | `false` | 是否可排序 |\n| `perPage` | `number` | `10` | 每页条数 |\n| `footerToolbar` | `ToolbarItem[]` | - | 底部工具栏 |\n| `headerToolbar` | `ToolbarItem[]` | - | 头部工具栏 |"),
];
