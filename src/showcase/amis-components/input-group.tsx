import { amisPage } from "./helpers";

export default [
  ...amisPage('input-group', '高级组件', 'InputGroup — 输入组合',
      '将输入框和其他组件组合在一起。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'input-group',
            label: '价格',
            body: [
              { type: 'input-number', name: 'price', addOn: { type: 'tpl', tpl: '¥' } },
            ],
          },
          {
            type: 'input-group',
            label: '网址',
            body: [
              { type: 'input-text', name: 'url', addOn: { type: 'tpl', tpl: 'https://' } },
            ],
          },
        ],
      },
      { price: 100, url: 'example.com' },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 组合标签文本 |\n| `className` | `string` | - | 自定义样式类名 |\n| `body` | `FormItem[]` | - | 组合内表单项 |\n| `mode` | `string` | `normal` | 表单模式 |"),
];
