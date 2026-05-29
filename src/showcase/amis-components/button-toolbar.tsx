import { amisPage } from "./helpers";

export default [
  ...amisPage('button-toolbar', '表单输入', 'ButtonToolbar — 按钮工具栏',
      '在表单内嵌入操作按钮的工具栏。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-text', name: 'name', label: '名称', multiLang: true },
          {
            type: 'button-toolbar',
            label: '操作',
            multiLang: true,
            buttons: [
              { type: 'button', label: { zh: '保存', en: 'Save' }, level: 'primary' },
              { type: 'button', label: { zh: '取消', en: 'Cancel' }, level: 'default' },
            ],
          },
        ],
      },
      {
        name: { zh: '测试项目', en: 'Test Project' },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `label` | `string` | - | 标签文本 |\n| `buttons` | `Button[]` | - | 按钮列表 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |"),
];
