import { amisPage } from "./helpers";

export default [
  ...amisPage('three-layer-tabs', '布局组件', '三层嵌套 Tabs — Sub Mission Rule',
      '第一层：主导航 → 第二层：Sub Mission 列表（可增删）→ 第三层：Rule Setup / Display。',
      {
        type: 'page',
        body: {
          type: 'tabs',
          tabsMode: 'line',
          className: 'layer1-tabs',
          tabs: [
            {
              title: 'Mission Rule',
              body: {
                type: 'tpl',
                tpl: '<div style="padding:48px;text-align:center;color:#aaa;font-size:14px">Mission Rule content</div>',
              },
            },
            {
              title: 'Registration Rule',
              body: {
                type: 'tpl',
                tpl: '<div style="padding:48px;text-align:center;color:#aaa;font-size:14px">Registration Rule content</div>',
              },
            },
            {
              title: 'Sub Mission Rule',
              body: {
                type: 'tabs',
                tabsMode: 'tiled',
                className: 'layer2-tabs',
                closable: true,
                addable: true,
                addBtnText: '+ Add',
                tabs: [
                  {
                    title: 'Sub Mission 1',
                    body: {
                      type: 'tabs',
                      tabsMode: 'card',
                      className: 'layer3-tabs',
                      tabs: [
                        {
                          title: 'Rule Setup',
                          body: {
                            type: 'form',
                            mode: 'horizontal',
                            horizontal: { left: 180, right: 12 },
                            wrapWithPanel: false,
                            body: [
                              {
                                type: 'select',
                                name: 'subMissionType_1',
                                label: 'Sub Mission Type',
                                required: true,
                                options: [
                                  { label: 'Room Stay Nights', value: 'room_stay' },
                                  { label: 'Total Spending', value: 'total_spending' },
                                ],
                                value: 'room_stay',
                              },
                              {
                                type: 'select',
                                name: 'businessUnit_1',
                                label: 'Business Unit',
                                required: true,
                                options: [
                                  { label: 'Hotel', value: 'hotel' },
                                  { label: 'Resort', value: 'resort' },
                                  { label: 'Spa', value: 'spa' },
                                ],
                              },
                              {
                                type: 'input-number',
                                name: 'noOfNights_1',
                                label: 'No. of Nights',
                                placeholder: 'Please input',
                              },
                              {
                                type: 'input-number',
                                name: 'minimumSpending_1',
                                label: 'Minimum Spending',
                                placeholder: 'Please input',
                              },
                            ],
                          },
                        },
                        {
                          title: 'Display',
                          body: {
                            type: 'tpl',
                            tpl: '<div style="padding:48px;text-align:center;color:#aaa;font-size:14px">Display configuration for Sub Mission 1</div>',
                          },
                        },
                      ],
                    },
                  },
                  {
                    title: 'Sub Mission 2',
                    body: {
                      type: 'tabs',
                      tabsMode: 'card',
                      className: 'layer3-tabs',
                      tabs: [
                        {
                          title: 'Rule Setup',
                          body: {
                            type: 'tpl',
                            tpl: '<div style="padding:48px;text-align:center;color:#aaa;font-size:14px">Rule Setup for Sub Mission 2</div>',
                          },
                        },
                        {
                          title: 'Display',
                          body: {
                            type: 'tpl',
                            tpl: '<div style="padding:48px;text-align:center;color:#aaa;font-size:14px">Display configuration for Sub Mission 2</div>',
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 三层嵌套选项卡结构 |\n| `tabsMode` | `string` | `normal` | Tab 显示模式 |\n| `className` | `string` | - | 自定义样式类名 |\n| `closable` | `boolean` | `false` | 是否可关闭 |\n| `addable` | `boolean` | `false` | 是否可添加 |\n| `addBtnText` | `string` | - | 添加按钮文本 |"),
];
