import { amisPage } from "./helpers";

export default [
  ...amisPage('location-picker', '高级组件', 'LocationPicker — 位置选择',
      '地图位置选择器。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          { type: 'location-picker', name: 'location', label: '选择位置' },
        ],
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `mapType` | `string` | `baidu` | 地图类型 |\n| `autoSelectFirst` | `boolean` | `false` | 是否自动选中第一个 |"),
];
