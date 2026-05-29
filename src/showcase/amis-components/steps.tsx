import { amisPage } from "./helpers";

export default [
  ...amisPage('steps', '布局组件', 'Steps — 步骤条',
      '分步操作的步骤条展示。',
      {
        type: 'page',
        body: {
          type: 'steps',
          steps: [
            { title: '第一步', subTitle: '填写信息', status: 'finish' },
            { title: '第二步', subTitle: '确认信息', status: 'finish' },
            { title: '第三步', subTitle: '提交成功', status: 'process' },
            { title: '第四步', subTitle: '完成', status: 'wait' },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `steps` | `StepItem[]` | - | 步骤项列表 |\n| `status` | `string` | - | 当前状态 |\n| `direction` | `string` | `horizontal` | 方向 |\n| `className` | `string` | - | 自定义样式类名 |"),
];
