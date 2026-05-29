import { amisPage } from "./helpers";

export default [
  ...amisPage('nav', '导航组件', 'Nav — 导航菜单',
      '侧边栏或顶部导航菜单。',
      {
        type: 'page',
        body: {
          type: 'nav',
          stacked: true,
          className: 'w-64',
          links: [
            { label: '首页', icon: 'fa fa-home', active: true },
            { label: '任务管理', icon: 'fa fa-tasks', children: [
              { label: '任务列表' },
              { label: '新建任务' },
            ]},
            { label: '数据报表', icon: 'fa fa-chart-bar' },
            { label: '系统设置', icon: 'fa fa-cog' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `links` | `NavItem[]` | - | 导航链接列表 |\n| `stacked` | `boolean` | `false` | 是否垂直排列 |\n| `mode` | `string` | - | 显示模式 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
