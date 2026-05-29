import { amisPage } from "./helpers";

export default [
  ...amisPage('calendar', '展示组件', 'Calendar — 日历',
      '日历组件，展示月历视图。',
      {
        type: 'page',
        body: {
          type: 'calendar',
          schedule: [
            { startTime: '2025-05-01', endTime: '2025-05-01', content: '劳动节' },
            { startTime: '2025-05-15', endTime: '2025-05-15', content: '项目里程碑' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | 当前日期值 |\n| `schedule` | `ScheduleItem[]` | - | 日程安排列表 |\n| `largeMode` | `boolean` | `false` | 是否大模式 |\n| `todayActiveStyle` | `object` | - | 今日选中样式 |"),
];
