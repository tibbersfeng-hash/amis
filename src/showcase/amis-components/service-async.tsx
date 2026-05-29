import { amisPage } from "./helpers";

export default [
  ...amisPage('service-async', '高级组件', 'Service (异步) — 异步数据',
      '从 API 获取数据并渲染子组件。',
      {
        type: 'service',
        api: 'get:/api/mock',
        initApi: 'get:/api/mock',
        body: {
          type: 'tpl',
          tpl: '<p>数据加载中...</p>',
          inline: false,
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 异步数据接口 |\n| `body` | `Schema` | - | 容器内容 |\n| `initFetch` | `boolean` | `true` | 是否初始化时请求 |\n| `initApi` | `API` | - | 初始化数据接口 |"),
];
