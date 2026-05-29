import { amisPage } from "./helpers";

export default [
  ...amisPage('cascader', '表单输入', 'Cascader — 级联选择',
      '多级级联选择器，常用于省市联动等场景。支持静态 options 和 api 动态加载。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'cascader',
            name: 'area',
            label: '地区（静态）',
            multiLang: true,
            options: [
              { label: { zh: '北京', en: 'Beijing' }, value: 'bj', children: [
                { label: { zh: '朝阳区', en: 'Chaoyang' }, value: 'cy' },
                { label: { zh: '海淀区', en: 'Haidian' }, value: 'hd' },
                { label: { zh: '东城区', en: 'Dongcheng' }, value: 'dc' },
              ]},
              { label: { zh: '上海', en: 'Shanghai' }, value: 'sh', children: [
                { label: { zh: '浦东新区', en: 'Pudong' }, value: 'pd' },
                { label: { zh: '黄浦区', en: 'Huangpu' }, value: 'hp' },
              ]},
              { label: { zh: '广东', en: 'Guangdong' }, value: 'gd', children: [
                { label: { zh: '广州', en: 'Guangzhou' }, value: 'gz', children: [
                  { label: { zh: '天河区', en: 'Tianhe' }, value: 'th' },
                  { label: { zh: '海珠区', en: 'Haizhu' }, value: 'hz' },
                ]},
                { label: { zh: '深圳', en: 'Shenzhen' }, value: 'sz', children: [
                  { label: { zh: '南山区', en: 'Nanshan' }, value: 'ns' },
                  { label: { zh: '福田区', en: 'Futian' }, value: 'ft' },
                ]},
              ]},
            ],
          },
          {
            type: 'cascader',
            name: 'apiArea',
            label: '地区（API 动态加载）',
            description: '通过 api 接口获取级联数据',
            api: '/api/options/regions',
            labelField: 'name',
            valueField: 'code',
            childrenField: 'children',
          },
        ],
      },
      {
        area: { zh: ['北京', '朝阳区'], en: ['sh', 'pd'] },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `TreeNode[]` | - | 静态级联数据 |\n| `source` | `API` | - | 动态数据源 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `showLevel` | `number` | - | 显示层级数 |\n| `api` | `string` | - | 动态加载 API |\n| `labelField` | `string` | `label` | 标签字段名 |\n| `valueField` | `string` | `value` | 值字段名 |\n| `childrenField` | `string` | `children` | 子节点字段名 |"),
];
