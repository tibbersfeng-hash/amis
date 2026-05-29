import { amisPage } from "./helpers";

export default [
  ...amisPage('sparkline', '展示组件', 'SparkLine — 迷你图表',
      '小型折线图/柱状图，常用于表格数据列。',
      {
        type: 'page',
        body: {
          type: 'sparkline',
          height: 40,
          width: 150,
          data: [12, 24, 18, 36, 22, 40, 28, 35, 42, 30, 48, 38],
          clickAction: { type: 'dialog', dialog: { title: '详情', body: '点击查看详情' } },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `number[]` | - | 图表数据 |\n| `data` | `number[]` | - | 数据数组 |\n| `width` | `number` | `30` | 图表宽度 |\n| `height` | `number` | `20` | 图表高度 |\n| `hot` | `boolean` | `false` | 是否热点样式 |\n| `clickAction` | `object` | - | 点击行为 |"),
];
