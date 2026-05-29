import { amisPage } from "./helpers";

export default [
  ...amisPage('chained-select', '高级组件', 'ChainedSelect — 链式下拉',
      '级联下拉选择器。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'chained-select',
            name: 'chain',
            label: '链式选择',
            options: [
              { label: '华东', value: 'east', children: [
                { label: '上海', value: 'sh', children: [{ label: '浦东', value: 'pd' }, { label: '黄浦', value: 'hp' }] },
                { label: '杭州', value: 'hz', children: [{ label: '西湖', value: 'xh' }] },
              ]},
              { label: '华南', value: 'south', children: [
                { label: '广州', value: 'gz', children: [{ label: '天河', value: 'th' }] },
              ]},
            ],
          },
        ],
      },
      {
        chain: ['华东', '上海', '浦东'],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `options` | `TreeNode[]` | - | 级联选项 |\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `source` | `API` | - | 动态数据源 |"),
];
