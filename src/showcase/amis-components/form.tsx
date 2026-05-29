import { amisPage } from "./helpers";

export default [
  ...amisPage('form', '高级组件', 'Form — 表单',
      '表单容器，包含多种表单项。',
      {
        type: 'form',
        mode: 'horizontal',
        title: '用户注册',
        body: [
          { type: 'input-text', name: 'username', label: '用户名', required: true, minLength: 3 },
          { type: 'input-password', name: 'password', label: '密码', required: true, minLength: 8 },
          { type: 'input-text', name: 'email', label: '邮箱', required: true },
          { type: 'input-text', name: 'phone', label: '手机号' },
          {
            type: 'select',
            name: 'role',
            label: '角色',
            options: [
              { label: '管理员', value: 'admin' },
              { label: '编辑', value: 'editor' },
              { label: '访客', value: 'viewer' },
            ],
          },
          { type: 'textarea', name: 'bio', label: '个人简介', minRows: 2 },
          { type: 'switch', name: 'agree', label: '同意服务条款', required: true },
        ],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }, { type: 'reset', label: '重置' }],
      },
      {
        username: '张三',
        password: '密码123',
        email: 'zhangsan@test.com',
        phone: '13800138000',
        role: '管理员',
        bio: '我是一个开发者',
        agree: true,
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `api` | `API` | - | 提交接口 |\n| `body` | `FormItem[]` | - | 表单项列表 |\n| `mode` | `string` | `normal` | 表单模式（normal/horizontal/inline） |\n| `title` | `string` | - | 表单标题 |\n| `actions` | `Button[]` | - | 底部操作按钮 |\n| `wrapWithPanel` | `boolean` | `true` | 是否包裹面板 |\n| `horizontal` | `object` | - | 水平布局配置 |\n| `initApi` | `API` | - | 初始化数据接口 |"),
];
