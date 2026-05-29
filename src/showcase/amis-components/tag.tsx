import { amisPage } from "./helpers";

export default [
  ...amisPage('tag', '展示组件', 'Tag — 标签',
      '标签组件，用于标记、分类等。',
      {
        type: 'page',
        body: [
          { type: 'tag', label: '默认', closable: false },
          { type: 'tag', label: '成功', closable: false, color: 'success' },
          { type: 'tag', label: '警告', closable: false, color: 'warning' },
          { type: 'tag', label: '危险', closable: false, color: 'danger' },
          { type: 'tag', label: '信息', closable: false, color: 'info' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 标签文本 |\n| `className` | `string` | - | 自定义样式类名 |\n| `closable` | `boolean` | `false` | 是否可关闭 |\n| `color` | `string` | - | 标签颜色（success/warning/danger/info） |"),
];
