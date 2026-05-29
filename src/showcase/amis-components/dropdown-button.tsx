import { amisPage } from "./helpers";

export default [
  ...amisPage('dropdown-button', '操作组件', 'DropDownButton — 下拉按钮',
      '带下拉菜单的按钮组件。',
      {
        type: 'page',
        body: {
          type: 'dropdown-button',
          label: '操作',
          level: 'primary',
          buttons: [
            { type: 'button', label: '查看详情' },
            { type: 'button', label: '编辑' },
            { type: 'button', label: '删除', level: 'danger' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 主按钮文本 |\n| `buttons` | `Button[]` | - | 下拉按钮列表 |\n| `level` | `string` | `default` | 按钮级别 |\n| `icon` | `string` | - | 图标 |\n| `size` | `string` | `md` | 按钮尺寸 |\n| `align` | `string` | `left` | 下拉对齐方式 |"),
];
