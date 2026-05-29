import { amisPage } from "./helpers";

export default [
  ...amisPage('tree-select', '表单输入', 'TreeSelect — 树形下拉',
      '树形结构的下拉选择器。支持静态 options 和 api 动态加载树节点。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'tree-select',
            name: 'location',
            label: '地区（静态）',
            multiLang: true,
            options: [
              { label: { zh: '华东', en: 'East' }, value: 'east', children: [
                { label: { zh: '上海', en: 'Shanghai' }, value: 'shanghai' },
                { label: { zh: '杭州', en: 'Hangzhou' }, value: 'hangzhou' },
                { label: { zh: '南京', en: 'Nanjing' }, value: 'nanjing' },
              ]},
              { label: { zh: '华南', en: 'South' }, value: 'south', children: [
                { label: { zh: '广州', en: 'Guangzhou' }, value: 'guangzhou' },
                { label: { zh: '深圳', en: 'Shenzhen' }, value: 'shenzhen' },
              ]},
              { label: { zh: '华北', en: 'North' }, value: 'north', children: [
                { label: { zh: '北京', en: 'Beijing' }, value: 'beijing' },
                { label: { zh: '天津', en: 'Tianjin' }, value: 'tianjin' },
              ]},
            ],
          },
          {
            type: 'tree-select',
            name: 'apiDept',
            label: '部门（API 动态加载）',
            description: '通过 api 字段获取树形数据',
            source: {
              method: 'get',
              url: '/api/options/departments',
            },
            labelField: 'name',
            valueField: 'id',
            childrenField: 'children',
          },
        ],
      },
      {
        location: { zh: '上海', en: 'hangzhou' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `TreeNode[]` | - | 静态树节点 |\n| `source` | `API` | - | 动态数据源 |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `multiple` | `boolean` | `false` | 是否多选 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `labelField` | `string` | `label` | 标签字段名 |\n| `valueField` | `string` | `value` | 值字段名 |\n| `childrenField` | `string` | `children` | 子节点字段名 |"),
];
