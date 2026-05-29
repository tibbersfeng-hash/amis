import { amisPage } from "./helpers";

export default [
  ...amisPage('remark', '高级组件', 'Remark — 备注提示',
      '小问号图标，悬浮显示提示文字。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-text', name: 'field', label: '字段', remark: '这是一个备注提示' },
          { type: 'input-text', name: 'field2', label: '字段2', remark: { title: '详细说明', body: '更详细的备注内容' } },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `content` | `string` | - | 备注文本内容 |\n| `placement` | `string` | `right` | 弹出位置 |\n| `shape` | `string` | - | 气泡形状 |\n| `trigger` | `string` | `hover` | 触发方式 |\n| `title` | `string` | - | 备注标题 |"),
];
