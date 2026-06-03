import { amisPage } from "./helpers";

export default [
  ...amisPage('bottom-underline-tab', '布局组件', 'Bottom-Underline Tab — 选中底部蓝线（满页宽）',
      '选中 tab 下方显示 4px 蓝色横线，无边框，无 hover，整行白色背景。',
      {
        type: 'tabs',
        tabsMode: 'line',
        className: 'custom-underline-tabs',
        tabs: [
          {
            title: 'Mission Rule',
            body: {
              type: 'form',
              wrapWithPanel: false,
              body: [
                { type: 'input-text', name: 'missionName', label: 'Mission Name', value: 'Default Mission' },
                { type: 'input-text', name: 'missionCode', label: 'Mission Code', value: 'MSN-001' },
              ],
            },
          },
          {
            title: 'Registration Rule',
            body: {
              type: 'form',
              wrapWithPanel: false,
              body: [
                { type: 'input-text', name: 'regName', label: 'Registration Name', value: 'Auto Register' },
              ],
            },
          },
          {
            title: 'Sub Mission Rule',
            body: {
              type: 'form',
              wrapWithPanel: false,
              body: [
                { type: 'input-text', name: 'subName', label: 'Sub Mission Name', value: 'Sub-001' },
              ],
            },
          },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 选项卡列表 |\n| `tabsMode` | `string` | `line` | Tab 显示模式 |\n| `className` | `string` | - | 自定义样式类名 |\n| `mountOnEnter` | `boolean` | `false` | 是否延迟渲染 |"),
];
