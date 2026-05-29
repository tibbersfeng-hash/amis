import { amisPage } from "./helpers";

export default [
  ...amisPage('images', '展示组件', 'Images — 图片列表',
      '多图片展示，支持缩略图和全屏查看。',
      {
        type: 'page',
        body: {
          type: 'images',
          value: [
            'https://via.placeholder.com/200/4A5CBF/FFFFFF?text=1',
            'https://via.placeholder.com/200/3d4fb0/FFFFFF?text=2',
            'https://via.placeholder.com/200/F0F1FF/4A5CBF?text=3',
            'https://via.placeholder.com/200/E8E8E8/333?text=4',
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string[]` | - | 图片地址列表 |\n| `thumbMode` | `string` | `contain` | 缩略图模式 |\n| `enlargeAble` | `boolean` | `true` | 是否支持点击放大 |\n| `width` | `number` | - | 缩略图宽度 |\n| `height` | `number` | - | 缩略图高度 |"),
];
