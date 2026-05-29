import { amisPage } from "./helpers";

export default [
  ...amisPage('tabs-nav', '导航组件', 'Tabs (导航模式) — 标签导航',
      '作为导航使用的 Tabs 组件。',
      {
        type: 'page',
        body: {
          type: 'tabs',
          mode: 'card',
          tabs: [
            { title: '概览', body: '概览内容' },
            { title: '详情', body: '详情内容' },
            { title: '设置', body: '设置内容' },
            { title: '日志', body: '日志内容' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 选项卡列表 |\n| `mode` | `string` | `card` | 显示模式（line/card/simple） |\n| `mountOnEnter` | `boolean` | `false` | 是否延迟渲染 |\n| `unmountOnExit` | `boolean` | `false` | 切换时是否卸载 |"),
];
