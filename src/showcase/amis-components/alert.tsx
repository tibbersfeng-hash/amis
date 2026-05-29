import { amisPage } from "./helpers";

export default [
  ...amisPage('alert', '反馈组件', 'Alert — 提示',
      '静态提示消息，支持成功、警告、错误、信息四种类型。',
      {
        type: 'page',
        body: [
          { type: 'alert', level: 'success', body: '操作成功完成！', showIcon: true, closable: true },
          { type: 'alert', level: 'info', body: '这是一条提示信息。', showIcon: true },
          { type: 'alert', level: 'warning', body: '请注意，数据即将过期。', showIcon: true },
          { type: 'alert', level: 'danger', body: '操作失败，请重试。', showIcon: true },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `level` | `string` | `info` | 级别（success/info/warning/danger） |\n| `body` | `Schema` | - | 提示内容 |\n| `showIcon` | `boolean` | `true` | 是否显示图标 |\n| `closable` | `boolean` | `false` | 是否可关闭 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
