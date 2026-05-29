import { amisPage } from "./helpers";

export default [
  ...amisPage('color', '展示组件', 'Color — 颜色展示',
      '颜色展示组件。',
      {
        type: 'page',
        body: [
          { type: 'color', value: '#4A5CBF', format: 'hex' },
          { type: 'color', value: '#52c41a', format: 'hex' },
          { type: 'color', value: '#E84545', format: 'hex' },
          { type: 'color', value: 'rgba(255, 193, 7, 0.8)', format: 'rgba' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | 颜色值 |\n| `defaultColor` | `string` | - | 默认颜色 |\n| `format` | `string` | `hex` | 颜色格式 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
