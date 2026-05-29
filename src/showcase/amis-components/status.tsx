import { amisPage } from "./helpers";

export default [
  ...amisPage('status', '展示组件', 'Status — 状态',
      '状态展示组件，支持成功、失败、运行中等状态。',
      {
        type: 'page',
        body: [
          { type: 'status', label: '运行中', value: 1 },
          { type: 'status', label: '已完成', value: 2 },
          { type: 'status', label: '异常', value: 3 },
          { type: 'status', label: '警告', value: 4 },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `number` | - | 状态值（1=运行中,2=成功,3=失败,4=警告） |\n| `label` | `string` | - | 状态文本 |\n| `placeholder` | `string` | - | 空值占位文本 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
