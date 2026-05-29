import { amisPage } from "./helpers";

export default [
  ...amisPage('input-file', '表单输入', 'InputFile — 文件上传',
      '文件上传组件，支持拖拽、批量上传等。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-file', name: 'doc', label: '文档上传', accept: '.pdf,.doc,.docx' },
          { type: 'input-file', name: 'image', label: '图片上传', accept: '.jpg,.png,.gif', asImage: true },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `accept` | `string` | - | 允许的文件类型 |\n| `multiple` | `boolean` | `false` | 是否多文件上传 |\n| `maxSize` | `number` | - | 最大文件大小（字节） |\n| `autoUpload` | `boolean` | `false` | 是否自动上传 |\n| `receiver` | `API` | - | 上传接口地址 |\n| `asImage` | `boolean` | `false` | 是否以图片模式上传 |"),
];
