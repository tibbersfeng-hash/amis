import { amisPage } from "./helpers";

export default [
  ...amisPage('container', '布局组件', 'Container — 容器',
      '基础容器组件，用于包裹子元素。',
      {
        type: 'page',
        body: {
          type: 'container',
          title: '容器标题',
          body: '容器内容',
          style: { border: '1px solid #e8e8e8', padding: '16px', borderRadius: '8px' },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `body` | `Schema` | - | 容器内容 |\n| `title` | `string` | - | 容器标题 |\n| `className` | `string` | - | 自定义样式类名 |\n| `style` | `object` | - | 自定义行内样式 |"),
];
