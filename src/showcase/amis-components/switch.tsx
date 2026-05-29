import { amisPage } from "./helpers";

export default [
  ...amisPage('switch', '表单输入', 'Switch — 开关',
      '开关组件，用于布尔值切换。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'switch', name: 'enabled', label: '启用', multiLang: true, onText: { zh: '开', en: 'ON' }, offText: { zh: '关', en: 'OFF' } },
          { type: 'switch', name: 'autoSave', label: '自动保存', multiLang: true, trueValue: true, falseValue: false },
          { type: 'switch', name: 'notification', label: '通知提醒', multiLang: true },
        ],
      },
      {
        enabled: { zh: true, en: false },
        autoSave: { zh: true, en: true },
        notification: { zh: false, en: true },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `mode` | `string` | `normal` | 显示模式 |\n| `onText` | `string` | - | 开启时文字 |\n| `offText` | `string` | - | 关闭时文字 |\n| `onValue` | `any` | `true` | 开启时的值 |\n| `offValue` | `any` | `false` | 关闭时的值 |\n| `trueValue` | `any` | `true` | true 对应的值 |\n| `falseValue` | `any` | `false` | false 对应的值 |"),
];
