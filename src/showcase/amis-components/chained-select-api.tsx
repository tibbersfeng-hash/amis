import { amisPage } from "./helpers";

export default [
  ...amisPage('chained-select-api', '表单输入', 'ChainedSelect — 级联选择（联动）',
      '级联联动场景：选择 Property 后通过 API 加载对应的 Sub Unit，未选择时隐藏。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'select',
            name: 'businessUnit',
            label: 'Business Unit',
            required: true,
            requiredOn: 'true',
            value: 'CN',
            options: [
              { label: 'China', value: 'CN' },
              { label: 'Japan', value: 'JP' },
              { label: 'USA', value: 'US' },
            ],
            disabled: true,
          },
          {
            type: 'divider',
          },
          {
            type: 'select',
            name: 'property',
            label: 'Property',
            required: true,
            source: {
              method: 'get',
              url: '/api/options/properties',
            },
            labelField: 'name',
            valueField: 'code',
            clearValueOnHidden: true,
          },
          {
            type: 'select',
            name: 'subUnit',
            label: 'Sub Unit',
            required: false,
            visibleOn: 'this.property',
            source: {
              method: 'get',
              url: '/api/options/sub-units',
              data: {
                propertyCode: '${property}',
              },
            },
            labelField: 'name',
            valueField: 'code',
          },
        ],
      },
      {
        businessUnit: 'CN',
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `source` | `API` | - | 级联数据源 API |\n| `labelField` | `string` | `label` | 标签字段名 |\n| `valueField` | `string` | `value` | 值字段名 |\n| `clearValueOnHidden` | `boolean` | `false` | 隐藏时是否清空值 |\n| `visibleOn` | `string` | - | 可见性条件表达式 |"),
];
