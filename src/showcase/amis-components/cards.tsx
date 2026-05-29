import { amisPage } from "./helpers";

export default [
  ...amisPage('cards', '数据组件', 'Cards — 卡片列表',
      '卡片形式的数据展示。',
      {
        type: 'page',
        body: {
          type: 'cards',
          title: '项目卡片',
          source: '${items}',
          card: {
            header: { title: '${name}', subTitle: '${category}' },
            body: '${desc}',
            actions: [{ type: 'button', label: '查看', level: 'primary' }],
          },
          data: {
            items: [
              { name: 'Amis CMS', category: '工具', desc: '低代码页面搭建工具' },
              { name: 'Figma', category: '设计', desc: 'UI/UX 设计平台' },
              { name: 'Playwright', category: '测试', desc: '端到端自动化测试' },
            ],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 卡片标题 |\n| `source` | `string` | - | 数据源变量 |\n| `card` | `object` | - | 卡片配置 |\n| `perRow` | `number` | `4` | 每行卡片数 |\n| `placeholder` | `string` | - | 空数据占位文本 |\n| `api` | `API` | - | 数据接口 |"),
];
