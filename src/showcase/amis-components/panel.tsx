import { amisPage } from "./helpers";

export default [
  ...amisPage('panel', '布局组件', 'Panel — 面板',
      '带标题和边框的面板组件。',
      {
        type: 'page',
        body: {
          type: 'panel',
          title: '面板标题',
          headerClassName: 'bg-info',
          body: [
            { type: 'tpl', tpl: '<p>面板内容区域</p><p style="color:#666">这里可以放置任何内容</p>', inline: false },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 面板标题 |\n| `body` | `Schema` | - | 面板内容 |\n| `aside` | `Schema` | - | 侧边内容 |\n| `footer` | `Schema` | - | 底部内容 |\n| `className` | `string` | - | 自定义样式类名 |\n| `headerClassName` | `string` | - | 头部样式类名 |"),
];
