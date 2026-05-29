import { amisPage } from "./helpers";

export default [
  ...amisPage('input-image', '表单输入', 'InputImage — 图片上传',
      '图片上传组件，支持裁剪、预览。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'input-image', name: 'avatar', label: '头像上传' },
          { type: 'input-image', name: 'banner', label: 'Banner 图', crop: { aspectRatio: '16:9' } },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `receiver` | `API` | - | 上传接口地址 |\n| `multiple` | `boolean` | `false` | 是否多图片上传 |\n| `maxSize` | `number` | - | 最大文件大小 |\n| `autoUpload` | `boolean` | `false` | 是否自动上传 |\n| `crop` | `object` | - | 裁剪配置 |\n| `fixedSize` | `boolean` | `false` | 是否固定尺寸 |"),
];
