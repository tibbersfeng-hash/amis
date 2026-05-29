import { amisPage } from "./helpers";

export default [
  ...amisPage('select', '表单输入', 'Select — 下拉选择',
      '下拉选择器，支持单选、多选、搜索、远程数据等。支持 options 静态配置和 api 动态加载。',
      {
        type: 'form',
        mode: 'horizontal',
        body: [
          {
            type: 'select',
            name: 'city',
            label: '城市（静态）',
            multiLang: true,
            options: [
              { label: { zh: '北京', en: 'Beijing' }, value: 'beijing' },
              { label: { zh: '上海', en: 'Shanghai' }, value: 'shanghai' },
              { label: { zh: '广州', en: 'Guangzhou' }, value: 'guangzhou' },
              { label: { zh: '深圳', en: 'Shenzhen' }, value: 'shenzhen' },
            ],
          },
          {
            type: 'select',
            name: 'apiCity',
            label: '城市（API 动态加载）',
            description: '通过 api 字段从服务端获取选项',
            source: {
              method: 'get',
              url: '/api/options/cities',
            },
            labelField: 'name',
            valueField: 'code',
          },
          {
            type: 'select',
            name: 'apiUser',
            label: '用户（API + 搜索）',
            description: '输入时触发远程搜索',
            searchable: true,
            source: {
              method: 'get',
              url: '/api/options/users',
              data: {
                keyword: '${keyword}',
              },
            },
            labelField: 'username',
            valueField: 'id',
          },
          {
            type: 'select',
            name: 'hobby',
            label: '爱好（多选）',
            multiLang: true,
            multiple: true,
            options: [
              { label: { zh: '阅读', en: 'Reading' }, value: 'reading' },
              { label: { zh: '运动', en: 'Sports' }, value: 'sports' },
              { label: { zh: '音乐', en: 'Music' }, value: 'music' },
              { label: { zh: '旅行', en: 'Travel' }, value: 'travel' },
              { label: { zh: '摄影', en: 'Photography' }, value: 'photography' },
            ],
          },
        ],
      },
      {
        city: { zh: '北京', en: 'shanghai' },
        hobby: { zh: ['阅读', '旅行'], en: ['reading', 'travel'] },
      },
      {},
      "| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `name` | `string` | - | 字段名称 |\n| `label` | `string` | - | 标签文本 |\n| `options` | `Option[]` | - | 静态选项列表 |\n| `source` | `string \\| API` | - | 远程数据源 API |\n| `searchable` | `boolean` | `false` | 是否可搜索 |\n| `multiLang` | `boolean` | `false` | 是否支持多语言 |\n| `multiple` | `boolean` | `false` | 是否多选 |\n| `clearable` | `boolean` | `false` | 是否显示清空按钮 |\n| `extractValue` | `boolean` | `true` | 是否提取值 |\n| `autoFill` | `boolean` | `false` | 是否自动填充 |\n| `labelField` | `string` | `label` | 标签字段名 |\n| `valueField` | `string` | `value` | 值字段名 |"),
];
