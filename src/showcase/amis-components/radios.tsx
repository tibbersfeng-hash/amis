import { amisPage } from "./helpers";

export default [
  ...amisPage('radios', '表单输入', 'Radios — 单选按钮组',
      '一组单选按钮，支持选项排列、图标、描述等。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'radios',
            name: 'gender',
            label: '性别',
            multiLang: true,
            options: [
              { label: { zh: '男', en: 'Male' }, value: 'male' },
              { label: { zh: '女', en: 'Female' }, value: 'female' },
              { label: { zh: '其他', en: 'Other' }, value: 'other' },
            ],
          },
          {
            type: 'radios',
            name: 'level',
            label: '等级',
            multiLang: true,
            options: [
              { label: { zh: '初级', en: 'Junior' }, value: 1, description: { zh: '入门级别', en: 'Beginner level' } },
              { label: { zh: '中级', en: 'Intermediate' }, value: 2, description: { zh: '有一定经验', en: 'Some experience' } },
              { label: { zh: '高级', en: 'Senior' }, value: 3, description: { zh: '专家级别', en: 'Expert level' } },
            ],
          },
        ],
      },
      {
        gender: { zh: '男', en: 'female' },
        level: { zh: 2, en: 3 },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `Option[]` | - | 静态选项列表 |\n| `source` | `string \\| API` | - | 远程数据源 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `selectFirst` | `boolean` | `false` | 是否默认选中第一项 |\n| `inline` | `boolean` | `true` | 是否水平排列 |\n| `columnsCount` | `number` | - | 每行显示列数 |"),
];
