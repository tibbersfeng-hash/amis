import { amisPage } from "./helpers";

export default [
  ...amisPage('carousel', '展示组件', 'Carousel — 轮播图',
      '图片轮播组件，支持自动播放。',
      {
        type: 'page',
        body: {
          type: 'carousel',
          type: 'carousel',
          autoplay: true,
          interval: 3000,
          thumbMode: 'cover',
          height: '200px',
          items: [
            { image: 'https://via.placeholder.com/800x200/4A5CBF/FFFFFF?text=Slide+1', href: '', imageClassName: '' },
            { image: 'https://via.placeholder.com/800x200/3d4fb0/FFFFFF?text=Slide+2', href: '', imageClassName: '' },
            { image: 'https://via.placeholder.com/800x200/F0F1FF/4A5CBF?text=Slide+3', href: '', imageClassName: '' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `items` | `CarouselItem[]` | - | 轮播项列表 |\n| `autoplay` | `boolean` | `false` | 是否自动播放 |\n| `interval` | `number` | `5000` | 自动播放间隔（ms） |\n| `animation` | `string` | `fade` | 动画类型 |\n| `duration` | `number` | `500` | 动画时长 |\n| `height` | `string` | - | 轮播高度 |\n| `thumbMode` | `string` | `contain` | 图片缩放模式 |"),
];
