import { amisPage } from "./helpers";

export default [
  ...amisPage('wizard', '高级组件', 'Wizard — 表单向导',
      '分步骤的表单向导组件。',
      {
        type: 'wizard',
        mode: 'horizontal',
        steps: [
          { title: '基本信息', body: [
            { type: 'input-text', name: 'name', label: '名称', required: true },
            { type: 'input-text', name: 'code', label: '编码' },
          ]},
          { title: '详细配置', body: [
            { type: 'textarea', name: 'desc', label: '描述', minRows: 2 },
            { type: 'switch', name: 'enabled', label: '启用' },
          ]},
          { title: '确认提交', body: [
            { type: 'tpl', tpl: '<p>请确认以上信息无误后提交</p>', inline: false },
          ]},
        ],
      },
      {
        name: '新项目',
        code: 'PROJ-001',
        desc: '这是一个新项目的描述',
        enabled: true,
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `steps` | `WizardStep[]` | - | 步骤列表 |\n| `mode` | `string` | `horizontal` | 步骤条方向 |\n| `startStep` | `number` | `1` | 起始步骤 |\n| `api` | `API` | - | 提交接口 |\n| `initApi` | `API` | - | 初始化接口 |\n| `actions` | `Button[]` | - | 底部操作按钮 |"),
];
