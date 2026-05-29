import { amisPage } from "./helpers";

export default [
  ...amisPage('input-range', '表单输入', 'InputRange — 滑块',
      '滑块组件，用于范围选择。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-range', name: 'volume', label: '音量', min: 0, max: 100, step: 5 },
          { type: 'input-range', name: 'opacity', label: '透明度', min: 0, max: 1, step: 0.1, showInput: true },
          { type: 'input-range', name: 'doubleRange', label: '双滑块', multiLang: true, min: 0, max: 100, showTooltip: 'always', marks: { '0': { zh: '低', en: 'Low' }, '50': { zh: '中', en: 'Mid' }, '100': { zh: '高', en: 'High' } } },
        ],
      },
      {
        volume: 50,
        opacity: 0.5,
        doubleRange: { zh: 50, en: 75 },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `min` | `number` | `0` | 最小值 |\n| `max` | `number` | `100` | 最大值 |\n| `step` | `number` | `1` | 步进值 |\n| `showSteps` | `boolean` | `false` | 是否显示刻度 |\n| `showInput` | `boolean` | `false` | 是否显示输入框 |\n| `showTooltip` | `string` | `false` | 是否显示提示（always/never/true） |\n| `marks` | `object` | - | 刻度标记 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |"),
];
