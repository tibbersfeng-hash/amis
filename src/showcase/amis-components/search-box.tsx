import { amisPage } from "./helpers";

export default [
  ...amisPage('search-box', '操作组件', 'SearchBox — 搜索框',
      '搜索组件，支持快捷键等。',
      {
        type: 'page',
        body: {
          type: 'search-box',
          placeholder: '搜索...',
          mini: false,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `placeholder` | `string` | - | 占位符文本 |\n| `searchImediately` | `boolean` | `false` | 是否即时搜索 |\n| `mini` | `boolean` | `false` | 是否迷你模式 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
