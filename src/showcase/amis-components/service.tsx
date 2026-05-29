import { amisPage } from "./helpers";

export default [
  ...amisPage('service', '高级组件', 'Service — 数据服务',
      '通过接口获取数据，作为容器将数据分发给子组件。',
      {
        type: 'service',
        api: '',
        data: { users: 100, orders: 50 },
        body: {
          type: 'grid',
          columns: [
            { type: 'tpl', tpl: '<div style="text-align:center;padding:20px;background:#f0f1ff;border-radius:8px"><h2>${users}</h2><p>用户数</p></div>', inline: false },
            { type: 'tpl', tpl: '<div style="text-align:center;padding:20px;background:#e8f5e9;border-radius:8px"><h2>${orders}</h2><p>订单数</p></div>', inline: false },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 数据接口 |\n| `body` | `Schema` | - | 容器内容 |\n| `initFetch` | `boolean` | `true` | 是否初始化时请求 |\n| `interval` | `number` | - | 轮询间隔（ms） |\n| `messages` | `object` | - | 消息提示配置 |"),
];
