import { amisPage } from "./helpers";

export default [
  ...amisPage('dialog', '反馈组件', 'Dialog — 对话框',
      '模态对话框组件，支持表单、确认等多种场景。',
      {
        type: 'page',
        body: {
          type: 'button',
          label: '打开对话框',
          level: 'primary',
          actionType: 'dialog',
          dialog: {
            title: '示例对话框',
            body: { type: 'tpl', tpl: '<p>这是对话框的内容</p>', inline: false },
            actions: [{ type: 'button', label: '取消' }, { type: 'button', label: '确定', level: 'primary' }],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 对话框标题 |\n| `body` | `Schema` | - | 对话框内容 |\n| `size` | `string` | `md` | 对话框尺寸 |\n| `closeOnEsc` | `boolean` | `true` | ESC 是否可关闭 |\n| `closeOnOutside` | `boolean` | `true` | 点击外部是否可关闭 |\n| `actions` | `Button[]` | - | 底部操作按钮 |\n| `showCloseButton` | `boolean` | `true` | 是否显示关闭按钮 |"),
];
