import { amisPage } from "./helpers";

export default [
  ...amisPage('button-group', '操作组件', 'ButtonGroup — 按钮组',
      '一组按钮，常用于工具栏、操作栏。',
      {
        type: 'page',
        body: {
          type: 'button-group',
          tiled: true,
          className: 'mb-3',
          buttons: [
            { type: 'button', label: '添加', icon: 'fa fa-plus', level: 'primary' },
            { type: 'button', label: '编辑', icon: 'fa fa-edit' },
            { type: 'button', label: '删除', icon: 'fa fa-trash', level: 'danger' },
            { type: 'button', label: '导出', icon: 'fa fa-download' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `buttons` | `Button[]` | - | 按钮列表 |\n| `tiled` | `boolean` | `false` | 是否平铺 |\n| `btnLevel` | `string` | `default` | 按钮级别 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
