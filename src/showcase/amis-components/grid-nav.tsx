import { amisPage } from "./helpers";

export default [
  ...amisPage('grid-nav', '高级组件', 'GridNav — 网格导航',
      '网格导航布局，适合首页快捷入口。',
      {
        type: 'page',
        body: {
          type: 'grid-nav',
          className: 'mb-3',
          source: { items: [
            { icon: 'fa fa-home', text: '首页', link: '' },
            { icon: 'fa fa-tasks', text: '任务', link: '' },
            { icon: 'fa fa-chart-bar', text: '报表', link: '' },
            { icon: 'fa fa-users', text: '用户', link: '' },
            { icon: 'fa fa-cog', text: '设置', link: '' },
            { icon: 'fa fa-question-circle', text: '帮助', link: '' },
          ]},
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `GridNavItem[]` | - | 导航项列表 |\n| `source` | `object` | - | 数据源 |\n| `column` | `number` | `3` | 每行列数 |\n| `gap` | `string` | - | 间距 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
