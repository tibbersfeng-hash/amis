import { amisPage } from "./helpers";

export default [
  ...amisPage('input-rating', '表单输入', 'InputRating — 评分',
      '星级评分组件。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-rating', name: 'rating', label: '评分', count: 5 },
          { type: 'input-rating', name: 'ratingHalf', label: '半星评分', count: 5, allowHalf: true },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `count` | `number` | `5` | 星星总数 |\n| `allowHalf` | `boolean` | `false` | 是否允许半星 |\n| `allowClear` | `boolean` | `true` | 是否允许清空 |\n| `colors` | `string` | - | 星星颜色 |"),
];
