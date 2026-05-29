import { amisPage } from "./helpers";

export default [
  ...amisPage('transfer', '表单输入', 'Transfer — 穿梭框',
      '左右两栏穿梭选择器。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'transfer',
            name: 'selectedUsers',
            label: '选择用户',
            multiLang: true,
            options: [
              { label: { zh: '张三', en: 'Zhang San' }, value: 'zhangsan' },
              { label: { zh: '李四', en: 'Li Si' }, value: 'lisi' },
              { label: { zh: '王五', en: 'Wang Wu' }, value: 'wangwu' },
              { label: { zh: '赵六', en: 'Zhao Liu' }, value: 'zhaoliu' },
              { label: { zh: '钱七', en: 'Qian Qi' }, value: 'qianqi' },
              { label: { zh: '孙八', en: 'Sun Ba' }, value: 'sunba' },
              { label: { zh: '周九', en: 'Zhou Jiu' }, value: 'zhoujiu' },
              { label: { zh: '吴十', en: 'Wu Shi' }, value: 'wushi' },
            ],
          },
        ],
      },
      {
        selectedUsers: { zh: ['张三', '李四'], en: ['zhangsan', 'wangwu'] },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `Option[]` | - | 静态选项列表 |\n| `source` | `API` | - | 远程数据源 |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `searchApi` | `API` | - | 搜索 API |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `titles` | `string[]` | - | 左右面板标题 |\n| `multiple` | `boolean` | `false` | 是否多选 |"),
];
