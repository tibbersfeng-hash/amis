import { amisPage } from "./helpers";

export default [
  ...amisPage('list', '数据组件', 'List — 列表',
      '列表视图组件，适合移动端展示。',
      {
        type: 'page',
        body: {
          type: 'list',
          title: '项目列表',
          source: '${items}',
          listItem: {
            title: '${name}',
            subTitle: '${desc}',
            actions: [{ type: 'button', label: '详情', level: 'link' }],
          },
          data: {
            items: [
              { name: '项目 Alpha', desc: '前端重构项目' },
              { name: '项目 Beta', desc: '后端 API 升级' },
              { name: '项目 Gamma', desc: '数据分析平台' },
              { name: '项目 Delta', desc: '用户中心重构' },
            ],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 列表标题 |\n| `source` | `string` | - | 数据源变量 |\n| `listItem` | `object` | - | 列表项配置 |\n| `placeholder` | `string` | - | 空数据占位文本 |\n| `loadMore` | `boolean` | `false` | 是否加载更多 |\n| `api` | `API` | - | 数据接口 |"),
];
