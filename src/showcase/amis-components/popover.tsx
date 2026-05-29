import { amisPage } from "./helpers";

export default [
  ...amisPage('popover', '反馈组件', 'PopOver — 弹出气泡',
      '点击时弹出的气泡面板。',
      {
        type: 'page',
        body: {
          type: 'wrapper',
          className: 'p-4',
          body: {
            type: 'popover',
            trigger: 'click',
            title: '弹出标题',
            body: { type: 'tpl', tpl: '<p>这是弹出的内容</p>', inline: false },
            children: { type: 'button', label: '点击弹出' },
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 弹出标题 |\n| `body` | `Schema` | - | 弹出内容 |\n| `trigger` | `string` | `click` | 触发方式 |\n| `position` | `string` | `top` | 弹出位置 |\n| `showCloseButton` | `boolean` | `false` | 是否显示关闭按钮 |\n| `children` | `Schema` | - | 触发子元素 |"),
];
