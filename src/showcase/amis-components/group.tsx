import { amisPage } from "./helpers";

export default [
  ...amisPage('group', '高级组件', 'Group — 表单项组',
      '将多个表单项组合为一行。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'group',
            body: [
              { type: 'input-text', name: 'firstName', label: '姓' },
              { type: 'input-text', name: 'lastName', label: '名' },
            ],
          },
          {
            type: 'group',
            body: [
              { type: 'input-text', name: 'areaCode', label: '区号', value: '+86', className: 'w-24' },
              { type: 'input-text', name: 'phone', label: '手机号' },
            ],
          },
        ],
      },
      {
        firstName: '张',
        lastName: '三',
        phone: '13800138000',
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `body` | `FormItem[]` | - | 组内表单项 |\n| `mode` | `string` | `normal` | 表单模式 |\n| `gap` | `string` | - | 项间距 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
