import { amisPage } from "./helpers";

export default [
  ...amisPage('tooltip', '反馈组件', 'Tooltip — 提示气泡',
      '鼠标悬浮时显示的提示气泡。',
      {
        type: 'page',
        body: {
          type: 'wrapper',
          className: 'p-4',
          body: [
            { type: 'tooltip', tooltip: '这是提示信息', children: { type: 'button', label: '悬浮查看提示' } },
            { type: 'divider' },
            { type: 'tooltip', tooltip: '更多信息', placement: 'right', children: { type: 'tag', label: '右侧提示' } },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tooltip` | `string` | - | 提示文本内容 |\n| `target` | `string` | - | 触发目标 |\n| `placement` | `string` | `top` | 弹出位置 |\n| `trigger` | `string` | `hover` | 触发方式 |\n| `children` | `Schema` | - | 子元素 |"),
];
