import { amisPage } from "./helpers";

export default [
  ...amisPage('qrcode', '展示组件', 'QRCode — 二维码',
      '二维码生成组件。',
      {
        type: 'page',
        body: {
          type: 'qr-code',
          code: 'https://aisuda.bce.baidu.com/amis/',
          level: 'L',
          tagProps: { style: { width: 128, height: 128 } },
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `value` | `string` | - | 二维码值 |\n| `code` | `string` | - | 二维码内容 |\n| `size` | `number` | `128` | 二维码尺寸 |\n| `level` | `string` | `L` | 纠错级别（L/M/Q/H） |\n| `backgroundColor` | `string` | - | 背景色 |\n| `foregroundColor` | `string` | - | 前景色 |"),
];
