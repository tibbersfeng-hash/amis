import { amisPage } from "./helpers";

export default [
  ...amisPage('input-rich-text-quill', '表单输入', 'InputRichTextQuill — Quill 富文本编辑器',
      '基于 Quill Editor 的富文本编辑器，支持加粗/斜体/下划线/删除线/有序无序列表/链接/对齐/字号/文字颜色/背景色，可选图片上传。底部带 富文本 / HTML 源码双 Tab 切换。支持参数：`name`(字段名)、`label`(标签)、`maxLength`(最大长度，默认5000)、`receiver`(图片上传 API 地址，如 `/api/upload`，不配置则不显示图片按钮)、`disabled`(是否只读)。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-rich-text-quill', name: 'description', label: '描述', multiLang: true, maxLength: 5000 },
          { type: 'divider' },
          { type: 'input-rich-text-quill', name: 'content', label: '详细内容（含图片上传）', multiLang: true, receiver: '/api/upload', maxLength: 10000 },
        ],
      },
      {
        description: { zh: '<h3>任务描述</h3><p>请在规定时间内完成以下任务...</p>', en: '<h3>Mission Description</h3><p>Please complete the following tasks within the specified time...</p>' },
        content: { zh: '<h2>活动规则</h2><ul><li>活动期间内完成指定消费金额</li><li>完成后可领取相应奖励</li></ul><p>详情请咨询客服。</p>', en: '<h2>Event Rules</h2><ul><li>Complete the specified spending amount during the event period</li><li>Claim corresponding rewards after completion</li></ul><p>For details, please contact customer service.</p>' },
      },
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `maxLength` | `number` | `5000` | 最大字符数 |\n| `receiver` | `string` | - | 图片上传 API 地址 |\n| `disabled` | `boolean` | `false` | 是否只读 |"),
];
