import { amisPage } from "./helpers";

export default [
  ...amisPage('chart', '展示组件', 'Chart — 图表',
      '基于 ECharts 的数据可视化组件。',
      {
        type: 'page',
        body: {
          type: 'chart',
          api: '',
          config: {
            title: { text: '周访问量统计' },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
            yAxis: { type: 'value' },
            series: [{ name: '访问量', type: 'bar', data: [320, 332, 401, 434, 290, 530, 420] }],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 数据源 API |\n| `config` | `object` | - | ECharts 配置对象 |\n| `style` | `object` | - | 自定义样式 |\n| `width` | `string \\| number` | - | 图表宽度 |\n| `height` | `string \\| number` | - | 图表高度 |\n| `replaceChartOption` | `boolean` | `false` | 是否替换图表配置 |"),
];
