import { amisPage } from "./helpers";

export default [
  ...amisPage('progress', '展示组件', 'Progress — 进度条',
      '进度条展示组件。',
      {
        type: 'page',
        body: [
          { type: 'progress', value: 70, label: '总体进度', stripe: true, showLabel: true },
          { type: 'progress', value: 45, color: '#52c41a' },
          { type: 'progress', value: 90, color: '#E84545' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `number` | `0` | 进度值（0-100） |\n| `className` | `string` | - | 自定义样式类名 |\n| `showLabel` | `boolean` | `true` | 是否显示标签 |\n| `label` | `string` | - | 进度标签文本 |\n| `stripe` | `boolean` | `false` | 是否条纹效果 |\n| `animate` | `boolean` | `false` | 是否动画效果 |\n| `color` | `string` | - | 进度条颜色 |"),
];
