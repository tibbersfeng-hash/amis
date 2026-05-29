import { amisPage } from "./helpers";

export default [
  ...amisPage('input-rich-text', '表单输入', 'InputRichText — 富文本编辑器',
      '基于 Froala Editor 的富文本编辑器，底部带 Rich Text / HTML 代码切换标签。支持参数：`name`(字段名)、`label`(标签)、`multiLang`(多语言)、`placeholder`(占位符)、`size`(尺寸: md/lg)、`vendor`(编辑器引擎: "froala"|"tinymce")、`receiver`(图片上传 API，空字符串=Base64 编码)、`videoReceiver`(视频上传 API)、`saveAsUbb`(UBB 格式保存)、`fileField`(上传文件字段名)、`options`(自定义 Froala 配置)、`buttons`(工具栏按钮列表)。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-rich-text', name: 'content', label: '富文本内容', multiLang: true, placeholder: '请输入富文本内容', vendor: 'froala', size: 'md', buttons: ['undo', 'redo', 'paragraphFormat', 'textColor', 'backgroundColor', 'bold', 'italic', 'underline', 'strikeThrough', 'formatOL', 'formatUL', 'insertLink', 'align', 'html'] },
          { type: 'input-rich-text', name: 'description', label: '描述（大尺寸+Base64图片）', multiLang: true, receiver: '', size: 'lg', vendor: 'froala', buttons: ['undo', 'redo', 'paragraphFormat', 'textColor', 'backgroundColor', 'bold', 'italic', 'underline', 'strikeThrough', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'align', 'html'] },
        ],
      },
      {
        content: { zh: '<h3>夏季消费任务详情</h3><p>在活动期间内完成指定金额的房费消费即可逐步解锁多重奖励。</p>', en: '<h3>Summer Spending Mission Details</h3><p>Complete the specified room spending during the event period to unlock multiple rewards.</p>' },
        description: { zh: '<p>这是一段富文本描述，图片使用 Base64 编码保存</p>', en: '<p>This is a rich text description with Base64-encoded images</p>' },
      }
    ),
];
