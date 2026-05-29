import { amisPage } from "./helpers";

export default [
  ...amisPage('input-tag', '表单输入', 'InputTag — 标签输入',
      '标签输入组件，支持自定义分隔符、自动补全。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-tag', name: 'tags', label: '标签', multiLang: true },
          {
            type: 'input-tag',
            name: 'techTags',
            label: '技术栈',
            multiLang: true,
            options: [
              { label: { zh: 'React', en: 'React' }, value: 'react' },
              { label: { zh: 'Vue', en: 'Vue' }, value: 'vue' },
              { label: { zh: 'Angular', en: 'Angular' }, value: 'angular' },
              { label: { zh: 'Svelte', en: 'Svelte' }, value: 'svelte' },
              { label: { zh: 'Solid', en: 'Solid' }, value: 'solid' },
            ],
          },
        ],
      },
      {
        tags: { zh: ['前端', '后端'], en: ['frontend', 'backend'] },
        techTags: { zh: ['React', 'Vue'], en: ['react', 'vue'] },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `options` | `Option[]` | - | 预设选项列表 |\n| `allowCreate` | `boolean` | `true` | 是否允许自定义创建 |\n| `max` | `number` | - | 最多可输入数量 |\n| `delimiter` | `string` | `,` | 分隔符 |"),
];
