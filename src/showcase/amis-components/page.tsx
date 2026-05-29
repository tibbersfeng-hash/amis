import { amisPage } from "./helpers";

export default [
  ...amisPage('page', '布局组件', 'Page — 页面容器',
      'Amis 页面容器，包含页头、内容区。',
      {
        type: 'page',
        title: '示例页面',
        subTitle: '这是页面副标题',
        remark: '页面说明',
        body: '页面内容区域',
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 页面标题 |\n| `subTitle` | `string` | - | 页面副标题 |\n| `body` | `Schema` | - | 页面主体内容 |\n| `aside` | `Schema` | - | 侧边栏内容 |\n| `toolbar` | `Schema` | - | 工具栏内容 |\n| `initApi` | `API` | - | 页面初始化 API |\n| `remark` | `string` | - | 页面说明 |"),
];
