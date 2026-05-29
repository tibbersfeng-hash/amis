import { amisPage } from "./helpers";

export default [
  ...amisPage('test-nested-tabs', '导航组件', '测试 — 嵌套 Tabs + 表单',
      '测试用例：外层 Tabs → 内层 Tabs → 表单，验证多层级 Tab 切换与表单值保留。',
      {
        type: 'page',
        body: {
          type: 'tabs',
          mode: 'line',
          tabs: [
            {
              title: '基础信息',
              body: {
                type: 'tabs',
                mode: 'card',
                tabs: [
                  {
                    title: '个人设置',
                    body: {
                      type: 'form',
                      mode: 'normal',
                      wrapWithPanel: false,
                      body: [
                        { type: 'input-text', name: 'username', label: '用户名', placeholder: '请输入用户名' },
                        { type: 'input-email', name: 'email', label: '邮箱', placeholder: '请输入邮箱' },
                        { type: 'input-text', name: 'phone', label: '手机号', placeholder: '请输入手机号' },
                      ],
                    },
                  },
                  {
                    title: '安全设置',
                    body: {
                      type: 'form',
                      mode: 'normal',
                      wrapWithPanel: false,
                      body: [
                        { type: 'input-password', name: 'oldPassword', label: '旧密码', placeholder: '请输入旧密码' },
                        { type: 'input-password', name: 'newPassword', label: '新密码', placeholder: '请输入新密码' },
                        { type: 'input-password', name: 'confirmPassword', label: '确认密码', placeholder: '请再次输入新密码' },
                      ],
                    },
                  },
                  {
                    title: '通知设置',
                    body: {
                      type: 'form',
                      mode: 'normal',
                      wrapWithPanel: false,
                      body: [
                        { type: 'switch', name: 'emailNotify', label: '邮件通知' },
                        { type: 'switch', name: 'smsNotify', label: '短信通知' },
                        { type: 'switch', name: 'pushNotify', label: 'App 推送' },
                      ],
                    },
                  },
                ],
              },
            },
            {
              title: '高级配置',
              body: {
                type: 'tabs',
                mode: 'card',
                tabs: [
                  {
                    title: '权限管理',
                    body: {
                      type: 'form',
                      mode: 'normal',
                      wrapWithPanel: false,
                      body: [
                        { type: 'select', name: 'role', label: '角色', options: [
                          { label: '管理员', value: 'admin' },
                          { label: '编辑者', value: 'editor' },
                          { label: '观察者', value: 'viewer' },
                        ]},
                        { type: 'checkboxes', name: 'permissions', label: '权限', options: [
                          { label: '读取', value: 'read' },
                          { label: '写入', value: 'write' },
                          { label: '删除', value: 'delete' },
                        ]},
                      ],
                    },
                  },
                  {
                    title: '集成配置',
                    body: {
                      type: 'form',
                      mode: 'normal',
                      wrapWithPanel: false,
                      body: [
                        { type: 'input-text', name: 'apiUrl', label: 'API 地址', placeholder: 'https://api.example.com' },
                        { type: 'input-text', name: 'apiKey', label: 'API Key', placeholder: '请输入 API Key' },
                        { type: 'textarea', name: 'webhookUrl', label: 'Webhook URL', placeholder: '请输入 Webhook 地址' },
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
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `tabs` | `TabItem[]` | - | 嵌套选项卡结构 |\n| `mode` | `string` | `normal` | 外层 Tab 模式 |\n| `mountOnEnter` | `boolean` | `false` | 是否延迟渲染 |\n| `unmountOnExit` | `boolean` | `false` | 切换时是否卸载 |"),
];
