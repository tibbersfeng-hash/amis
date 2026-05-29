import { amisPage } from "./helpers";

export default [
  ...amisPage('checkboxes', '表单输入', 'Checkboxes — 复选框组',
      '一组复选框，支持多选。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'checkboxes',
            name: 'skills',
            label: '技能',
            multiLang: true,
            options: [
              { label: { zh: 'JavaScript', en: 'JavaScript' }, value: 'js' },
              { label: { zh: 'TypeScript', en: 'TypeScript' }, value: 'ts' },
              { label: { zh: 'Python', en: 'Python' }, value: 'python' },
              { label: { zh: 'Go', en: 'Go' }, value: 'go' },
              { label: { zh: 'Java', en: 'Java' }, value: 'java' },
              { label: { zh: 'Rust', en: 'Rust' }, value: 'rust' },
            ],
          },
        ],
      },
      {
        skills: { zh: ['JavaScript', 'TypeScript'], en: ['js', 'python'] },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `Option[]` | - | 静态选项列表 |\n| `source` | `string \\| API` | - | 远程数据源 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `checkAll` | `boolean` | `false` | 是否显示全选 |\n| `inline` | `boolean` | `true` | 是否水平排列 |"),
];
