import { amisPage } from "./helpers";

export default [
  ...amisPage('icon', '高级组件', 'Icon — 图标',
      'Font Awesome 图标组件。',
      {
        type: 'page',
        body: {
          type: 'hbox',
          columns: [
            { body: { type: 'icon', icon: 'fa fa-home', className: 'fa-2x text-primary' } },
            { body: { type: 'icon', icon: 'fa fa-user', className: 'fa-2x text-success' } },
            { body: { type: 'icon', icon: 'fa fa-cog', className: 'fa-2x text-warning' } },
            { body: { type: 'icon', icon: 'fa fa-star', className: 'fa-2x text-danger' } },
            { body: { type: 'icon', icon: 'fa fa-heart', className: 'fa-2x text-info' } },
            { body: { type: 'icon', icon: 'fa fa-search', className: 'fa-2x text-primary' } },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `icon` | `string` | - | 图标类名（如 fa fa-home） |\n| `type` | `string` | - | 图标类型 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
