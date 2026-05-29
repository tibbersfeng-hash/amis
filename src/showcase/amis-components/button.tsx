import { amisPage } from "./helpers";

export default [
  ...amisPage('button', '操作组件', 'Button — 按钮',
      '按钮组件，支持多种样式和状态。',
      {
        type: 'page',
        body: [
          { type: 'tpl', tpl: '<h4>按钮级别</h4>', inline: false },
          {
            type: 'hbox',
            columns: [
              { body: { type: 'button', label: 'Primary', level: 'primary' } },
              { body: { type: 'button', label: 'Secondary', level: 'secondary' } },
              { body: { type: 'button', label: 'Success', level: 'success' } },
              { body: { type: 'button', label: 'Info', level: 'info' } },
              { body: { type: 'button', label: 'Warning', level: 'warning' } },
              { body: { type: 'button', label: 'Danger', level: 'danger' } },
              { body: { type: 'button', label: 'Light', level: 'light' } },
              { body: { type: 'button', label: 'Default', level: 'default' } },
            ],
          },
          { type: 'divider', title: '按钮尺寸' },
          {
            type: 'hbox',
            columns: [
              { body: { type: 'button', label: 'XS', size: 'xs' } },
              { body: { type: 'button', label: 'SM', size: 'sm' } },
              { body: { type: 'button', label: 'MD', size: 'md' } },
              { body: { type: 'button', label: 'LG', size: 'lg' } },
            ],
          },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 按钮文本 |\n| `type` | `string` | `button` | 按钮类型 |\n| `level` | `string` | `default` | 按钮级别（primary/success/warning/danger/info/default） |\n| `actionType` | `string` | - | 操作类型（link/dialog/drawer） |\n| `url` | `string` | - | 跳转链接 |\n| `dialog` | `object` | - | 对话框配置 |\n| `drawer` | `object` | - | 抽屉配置 |\n| `size` | `string` | `md` | 按钮尺寸（xs/sm/md/lg） |\n| `disabled` | `boolean` | `false` | 是否禁用 |\n| `icon` | `string` | - | 图标类名 |"),
];
