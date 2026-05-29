import { amisPage } from "./helpers";

export default [
  ...amisPage('combo', '高级组件', 'Combo — 组合表单',
      '可动态增减的组合表单项。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'combo',
            name: 'skills',
            label: '技能列表',
            multiple: true,
            scaffold: { name: '', level: '' },
            items: [
              { type: 'input-text', name: 'name', label: '技能名称', placeholder: '输入技能名称' },
              {
                type: 'select',
                name: 'level',
                label: '熟练度',
                options: [
                  { label: '入门', value: 'beginner' },
                  { label: '熟练', value: 'skilled' },
                  { label: '精通', value: 'expert' },
                ],
              },
            ],
          },
        ],
      },
      {
        skills: [
          { name: 'React', level: '精通' },
          { name: 'TypeScript', level: '熟练' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `FormItem[]` | - | 组合表单项 |\n| `multiple` | `boolean` | `false` | 是否支持多行 |\n| `multiLine` | `boolean` | `false` | 是否多行显示 |\n| `subFormMode` | `string` | `normal` | 子表单模式 |\n| `addButtonText` | `string` | - | 添加按钮文本 |\n| `removable` | `boolean` | `true` | 是否可删除 |\n| `scaffold` | `object` | - | 新增项默认值 |\n| `minLength` | `number` | `0` | 最小行数 |\n| `maxLength` | `number` | - | 最大行数 |"),
];
