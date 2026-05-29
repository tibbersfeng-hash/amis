import { amisPage } from "./helpers";

export default [
  ...amisPage('image', '展示组件', 'Image — 图片展示',
      '图片展示组件，支持缩放、旋转、全屏查看等。',
      {
        type: 'page',
        body: {
          type: 'image',
          title: 'Amis 示例',
          image: 'https://via.placeholder.com/400x200/4A5CBF/FFFFFF?text=Amis+CMS',
          thumbMode: 'contain',
          src: 'https://via.placeholder.com/800x400/4A5CBF/FFFFFF?text=Amis+CMS',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `src` | `string` | - | 图片地址 |\n| `image` | `string` | - | 缩略图地址 |\n| `title` | `string` | - | 图片标题 |\n| `alt` | `string` | - | 替代文本 |\n| `thumbMode` | `string` | `contain` | 缩略图模式 |\n| `originalSrc` | `string` | - | 原图地址（点击放大） |\n| `enlargeAble` | `boolean` | `true` | 是否支持点击放大 |"),
];
