import { amisPage } from "./helpers";

export default [
  ...amisPage('top-border-tab', '布局组件', 'Top-Border Tab — 选中上方蓝线',
      '选中 tab 上方显示蓝色横线，未选中标签背景灰底。',
      {
        type: 'page',
        body: {
          type: 'tabs',
          tabsMode: 'line',
          className: 'custom-top-border-tabs',
          tabs: [
            {
              title: 'Global',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'globalName', label: 'Global Name', value: 'Default Global' },
                  { type: 'input-text', name: 'globalCode', label: 'Global Code', value: 'GLB-001' },
                ],
              },
            },
            {
              title: 'Property',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'propertyName', label: 'Property Name', value: 'SHM Hotel' },
                  { type: 'select', name: 'propertyType', label: 'Property Type', options: [
                    { label: 'Hotel', value: 'hotel' },
                    { label: 'Resort', value: 'resort' },
                  ], value: 'hotel' },
                ],
              },
            },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 选项卡列表 |\n| `tabsMode` | `string` | `line` | Tab 显示模式 |\n| `className` | `string` | - | 自定义样式类名 |\n| `mountOnEnter` | `boolean` | `false` | 是否延迟渲染 |"),
];
