import { amisPage } from "./helpers";

export default [
  ...amisPage('avatar', '展示组件', 'Avatar — 头像',
      '用户头像展示组件，支持文字兜底。',
      {
        type: 'page',
        body: [
          { type: 'avatar', text: '张', shape: 'circle', size: 'default' },
          { type: 'avatar', src: 'https://via.placeholder.com/40/4A5CBF/FFFFFF?text=U', shape: 'circle', size: 'default' },
          { type: 'avatar', text: '管', shape: 'square', size: 'large', style: { background: '#52c41a' } },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `src` | `string` | - | 头像图片地址 |\n| `text` | `string` | - | 文字兜底内容 |\n| `shape` | `string` | `circle` | 形状（circle/square） |\n| `size` | `string` | `default` | 尺寸（small/default/large） |\n| `style` | `object` | - | 自定义样式 |"),
];
