import { amisPage } from "./helpers";

export default [
  ...amisPage('json', '展示组件', 'JSON — JSON 展示',
      '以美观的格式展示 JSON 数据，支持折叠、复制。',
      {
        type: 'page',
        body: {
          type: 'json',
          value: {
            name: 'Amis CMS',
            version: '3.6.0',
            features: ['低代码', 'JSON 驱动', '可视化编辑'],
            author: 'Baidu',
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `object` | - | 要展示的 JSON 数据 |\n| `json` | `string` | - | JSON 字符串 |\n| `theme` | `string` | - | 主题风格 |\n| `levelExpand` | `number` | `1` | 默认展开层级 |\n| `showLine` | `boolean` | `true` | 是否显示行号 |"),
];
