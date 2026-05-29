import { amisPage } from "./helpers";

export default [
  ...amisPage('spinner', '反馈组件', 'Spinner — 加载动画',
      '加载中的旋转动画。',
      {
        type: 'page',
        body: [
          { type: 'spinner', show: true, overlay: true },
          { type: 'spinner', size: 'sm' },
          { type: 'spinner', size: 'md' },
          { type: 'spinner', size: 'lg' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `show` | `boolean` | `true` | 是否显示 |\n| `size` | `string` | `md` | 尺寸（sm/md/lg） |\n| `overlay` | `boolean` | `false` | 是否遮罩 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
