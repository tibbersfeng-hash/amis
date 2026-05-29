import { amisPage } from "./helpers";

export default [
  ...amisPage('collapse', '布局组件', 'Collapse — 折叠面板',
      '可折叠的手风琴面板。',
      {
        type: 'page',
        body: {
          type: 'collapse-group',
          body: [
            { type: 'collapse', title: '章节一', body: '章节一的内容', collapsed: false },
            { type: 'collapse', title: '章节二', body: '章节二的内容', collapsed: true },
            { type: 'collapse', title: '章节三', body: '章节三的内容', collapsed: true },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 折叠面板标题 |\n| `body` | `Schema` | - | 折叠内容 |\n| `collapsed` | `boolean` | `true` | 是否折叠 |\n| `collapsible` | `string` | `title` | 可点击区域 |\n| `collapseList` | `boolean` | `false` | 是否手风琴模式 |\n| `accordions` | `boolean` | `false` | 是否互斥展开 |"),
];
