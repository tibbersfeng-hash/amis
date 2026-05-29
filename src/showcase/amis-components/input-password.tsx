import { amisPage } from "./helpers";

export default [
  ...amisPage('input-password', '表单输入', 'InputPassword — 密码输入',
      '密码输入框，支持明文/密文切换显示。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-password', name: 'pwd', label: '密码', multiLang: true, required: true, minLength: 8 },
          { type: 'input-password', name: 'confirmPwd', label: '确认密码', multiLang: true, required: true },
        ],
      },
      {
        pwd: { zh: '密码123456', en: 'password123' },
        confirmPwd: { zh: '密码123456', en: 'password123' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `placeholder` | `string` | - | 占位符文本 |\n| `minLength` | `number` | `0` | 最小长度 |\n| `maxLength` | `number` | - | 最大长度 |"),
];
