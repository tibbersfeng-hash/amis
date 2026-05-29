import { amisPage } from "./helpers";

export default [
  ...amisPage('each', '高级组件', 'Each — 循环渲染',
      '循环渲染数组中的每一项。',
      {
        type: 'page',
        data: {
          items: [
            { name: 'React', version: '17.0', desc: 'UI 框架' },
            { name: 'TypeScript', version: '5.x', desc: '类型系统' },
            { name: 'Vite', version: '8.x', desc: '构建工具' },
          ],
        },
        body: {
          type: 'each',
          name: 'items',
          items: {
            type: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            className: 'p-2 bb b-light',
            items: [
              { type: 'tpl', tpl: '<strong>${name}</strong> <span class="text-muted ml-2">${version}</span>', inline: true },
              { type: 'tag', label: '${desc}' },
            ],
          },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `Schema` | - | 循环渲染模板 |\n| `value` | `any[]` | - | 循环数据源 |\n| `name` | `string` | - | 数据字段名 |"),
];
