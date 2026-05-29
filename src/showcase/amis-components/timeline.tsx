import { amisPage } from "./helpers";

export default [
  ...amisPage('timeline', '展示组件', 'Timeline — 时间线',
      '时间线展示组件。',
      {
        type: 'page',
        body: {
          type: 'timeline',
          items: [
            { time: '2025-01-01', title: '项目启动', detail: '完成需求分析' },
            { time: '2025-02-15', title: '开发阶段', detail: '核心功能开发完成' },
            { time: '2025-03-01', title: '测试阶段', detail: '进入集成测试' },
            { time: '2025-03-20', title: '上线发布', detail: '正式发布 v1.0' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `TimelineItem[]` | - | 时间线项目列表 |\n| `direction` | `string` | `left` | 方向（left/right） |\n| `mode` | `string` | - | 显示模式 |\n| `reverse` | `boolean` | `false` | 是否反转顺序 |"),
];
