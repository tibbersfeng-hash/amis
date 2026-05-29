import { amisPage } from "./helpers";

export default [
  ...amisPage('input-text', '表单输入', 'InputText — 单行文本输入',
      '最基础的单行文本输入框，支持 placeholder、校验、自动补全等。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-text', name: 'name', label: '名称', multiLang: true, placeholder: '请输入名称' },
          { type: 'input-text', name: 'email', label: '邮箱', multiLang: true, placeholder: 'example@mail.com' },
          { type: 'input-text', name: 'code', label: '代码', multiLang: true, placeholder: 'CODE-001', required: true },
        ],
      },
      {
        name: { zh: '迈克', en: 'Mike' },
        email: { zh: 'zhangsan@test.com', en: 'zhangsan@test.com' },
        code: { zh: 'CODE-001', en: 'CODE-001' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `size` | `string` | `md` | 输入框尺寸 |\n| `clearable` | `boolean` | `false` | 是否显示清空按钮 |\n| `disabled` | `boolean` | `false` | 是否禁用 |\n| `readOnly` | `boolean` | `false` | 是否只读 |")
];
