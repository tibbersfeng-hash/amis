import { amisPage } from "./helpers";

export default [
  ...amisPage('input-tree', '表单输入', 'InputTree — 树形选择',
      '树形结构选择器，支持多级嵌套。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'input-tree',
            name: 'department',
            label: '部门',
            multiLang: true,
            multiple: false,
            options: [
              { label: { zh: '技术部', en: 'Tech Dept' }, value: 'tech', children: [
                { label: { zh: '前端组', en: 'Frontend' }, value: 'frontend' },
                { label: { zh: '后端组', en: 'Backend' }, value: 'backend' },
                { label: { zh: '测试组', en: 'QA' }, value: 'qa' },
              ]},
              { label: { zh: '产品部', en: 'Product Dept' }, value: 'product', children: [
                { label: { zh: '产品组', en: 'PM' }, value: 'pm' },
                { label: { zh: '设计组', en: 'Design' }, value: 'design' },
              ]},
              { label: { zh: '运营部', en: 'Operations' }, value: 'ops' },
            ],
          },
        ],
      },
      {
        department: { zh: '前端组', en: 'backend' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `source` | `API` | - | 树节点数据源 |\n| `options` | `TreeNode[]` | - | 静态树节点 |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `showIcon` | `boolean` | `true` | 是否显示图标 |\n| `showRadio` | `boolean` | `false` | 是否显示单选按钮 |\n| `multiple` | `boolean` | `false` | 是否多选 |\n| `unfoldedLevel` | `number` | - | 默认展开层级 |"),
];
