import { amisPage } from "./helpers";

export default [
  ...amisPage('barcode', '展示组件', 'BarCode — 条形码',
      '条形码生成组件。',
      {
        type: 'page',
        body: {
          type: 'barcode',
          value: '123456789012',
          width: 300,
          height: 80,
          format: 'CODE128',
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | 条形码值 |\n| `width` | `number` | - | 条码宽度 |\n| `height` | `number` | - | 条码高度 |\n| `format` | `string` | `CODE128` | 条码格式 |\n| `displayValue` | `boolean` | `true` | 是否显示数值 |"),
];
