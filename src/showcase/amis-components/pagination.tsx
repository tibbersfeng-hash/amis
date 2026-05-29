import { amisPage } from "./helpers";

export default [
  ...amisPage('pagination', '导航组件', 'Pagination — 分页',
      '分页导航组件。',
      {
        type: 'page',
        body: {
          type: 'pagination-wrapper',
          maxButtons: 5,
          layout: ['total', 'per-page', 'pager', 'next', 'jump'],
          perPage: 10,
          total: 100,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `layout` | `string[]` | - | 布局元素 |\n| `maxButtons` | `number` | `5` | 最大页码按钮数 |\n| `ellipsis` | `boolean` | `true` | 是否显示省略号 |\n| `perPage` | `number` | `10` | 每页条数 |\n| `total` | `number` | `0` | 总记录数 |\n| `showPageInput` | `boolean` | `false` | 是否显示页码输入 |"),
];
