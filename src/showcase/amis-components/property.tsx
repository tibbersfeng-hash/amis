import { amisPage } from "./helpers";

export default [
  ...amisPage('property', '展示组件', 'Property — 属性',
      '属性列表展示，key-value 对。',
      {
        type: 'page',
        body: {
          type: 'property',
          title: '用户信息',
          column: 2,
          items: [
            { label: '姓名', content: '张三', span: 1 },
            { label: '性别', content: '男', span: 1 },
            { label: '邮箱', content: 'zhangsan@example.com', span: 1 },
            { label: '手机号', content: '138****1234', span: 1 },
            { label: '地址', content: '上海市浦东新区', span: 2 },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 属性列表标题 |\n| `items` | `PropertyItem[]` | - | 属性项列表 |\n| `column` | `number` | `1` | 列数 |\n| `mode` | `string` | `normal` | 显示模式 |\n| `separatorClassName` | `string` | - | 分隔线样式 |"),
];
