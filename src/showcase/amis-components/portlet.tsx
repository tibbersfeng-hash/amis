import { amisPage } from "./helpers";

export default [
  ...amisPage('portlet', '布局组件', 'Portlet — 门户面板',
      '带操作栏的面板组件，支持折叠、拖拽等。',
      {
        type: 'page',
        body: {
          type: 'portlet',
          title: '门户面板',
          showToolbar: true,
          toolbar: [{ type: 'button', label: '操作', size: 'sm' }],
          body: '门户面板内容区域',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 面板标题 |\n| `body` | `Schema` | - | 面板内容 |\n| `toolbar` | `Button[]` | - | 工具栏按钮 |\n| `showToolbar` | `boolean` | `false` | 是否显示工具栏 |\n| `collapsable` | `boolean` | `false` | 是否可折叠 |"),
];
