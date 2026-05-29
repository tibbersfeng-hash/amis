import { amisPage } from "./helpers";

export default [
  ...amisPage('tabs', '布局组件', 'Tabs — 选项卡',
      '选项卡布局，支持多种样式。',
      {
        type: 'page',
        body: {
          type: 'tabs',
          mode: 'line',
          tabs: [
            { title: '基本信息', body: '基本信息内容' },
            { title: '高级设置', body: '高级设置内容' },
            { title: '权限配置', body: '权限配置内容' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 选项卡列表 |\n| `mode` | `string` | `normal` | 显示模式（line/card/simple/tiled） |\n| `mountOnEnter` | `boolean` | `false` | 是否延迟渲染 |\n| `unmountOnExit` | `boolean` | `false` | 切换时是否卸载 |\n| `tabsMode` | `string` | - | Tab 显示样式 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
