import { amisPage } from "./helpers";

export default [
  ...amisPage('breadcrumb', '导航组件', 'Breadcrumb — 面包屑',
      '面包屑导航，展示页面层级关系。',
      {
        type: 'page',
        body: {
          type: 'breadcrumb',
          separator: '/',
          breadcrumbClassName: 'mb-3',
          items: [
            { label: '首页', href: '#' },
            { label: '列表页', href: '#' },
            { label: '详情页' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `BreadcrumbItem[]` | - | 面包屑项列表 |\n| `separator` | `string` | `/` | 分隔符 |\n| `separatorClassName` | `string` | - | 分隔符样式 |\n| `breadcrumbClassName` | `string` | - | 面包屑容器样式 |"),
];
