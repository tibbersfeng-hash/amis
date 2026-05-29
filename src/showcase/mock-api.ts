/**
 * Mock API data for Amis components.
 * Simulates server responses for API-driven Select, TreeSelect, Cascader, etc.
 */

const cityOptions = [
  { code: 'bj', name: '北京' },
  { code: 'sh', name: '上海' },
  { code: 'gz', name: '广州' },
  { code: 'sz', name: '深圳' },
  { code: 'hz', name: '杭州' },
  { code: 'nj', name: '南京' },
];

/**
 * Property options for chained select demo.
 * Properties under a business unit.
 */
const propertyOptions = [
  { code: 'CNHSN001', name: '北京酒店' },
  { code: 'CNSHN002', name: '上海酒店' },
  { code: 'CNGZN003', name: '广州酒店' },
];

const userOptions = [
  { id: 1, username: '张三' },
  { id: 2, username: '李四' },
  { id: 3, username: '王五' },
  { id: 4, username: '赵六' },
  { id: 5, username: '钱七' },
];

const departmentTree = [
  {
    id: 'tech',
    name: '技术部',
    children: [
      { id: 'frontend', name: '前端组' },
      { id: 'backend', name: '后端组' },
      { id: 'qa', name: '测试组' },
    ],
  },
  {
    id: 'product',
    name: '产品部',
    children: [
      { id: 'pm', name: '产品组' },
      { id: 'design', name: '设计组' },
    ],
  },
  { id: 'ops', name: '运营部' },
];

const regionTree = [
  {
    code: 'east',
    name: '华东',
    children: [
      { code: 'sh', name: '上海', children: [
        { code: 'pd', name: '浦东新区' },
        { code: 'hp', name: '黄浦区' },
      ]},
      { code: 'hz', name: '杭州' },
      { code: 'nj', name: '南京' },
    ],
  },
  {
    code: 'south',
    name: '华南',
    children: [
      { code: 'gz', name: '广州', children: [
        { code: 'th', name: '天河区' },
        { code: 'ha', name: '海珠区' },
      ]},
      { code: 'sz', name: '深圳' },
    ],
  },
  {
    code: 'north',
    name: '华北',
    children: [
      { code: 'bj', name: '北京' },
      { code: 'tj', name: '天津' },
    ],
  },
];

/**
 * Sub units mapped by property code.
 * Simulates a business unit → property → sub unit hierarchy.
 */
const subUnitsByProperty: Record<string, Array<{ code: string; name: string }>> = {
  CNHSN001: [
    { code: 'SLZO-ChaoNo18', name: '朝阳18号' },
    { code: 'SLZO-Haidian', name: '海淀分部' },
    { code: 'SLZO-Dongcheng', name: '东城门店' },
  ],
  CNSHN002: [
    { code: 'SLZS-Tianhe', name: '天河分店' },
    { code: 'SLZS-Haizhu', name: '海珠分店' },
  ],
  CNGZN003: [
    { code: 'SLZG-YueXiu', name: '越秀门店' },
  ],
};

/**
 * Route mock API requests by URL path.
 * Amis fetcher receives an API config object like:
 *   { url: "get://api/options/cities", method: "get", data: {...} }
 * Returns Amis-compatible response format: { status: 0, data: { items: [...] } }
 */
export function mockApiFetcher(api: string | { url: string; method?: string; data?: unknown }): Promise<any> {
  // Extract URL: Amis passes an API config object, but some callers may pass a raw string
  const rawUrl = typeof api === 'string' ? api : (api.url || '');
  // Amis already normalizes URLs (strips get:// prefix), but handle it just in case
  const path = rawUrl.replace(/^(get|post|put|delete):\/\//, '');
  // Construct URL: path may already start with / or not
  const fullUrl = path.startsWith('/') ? `http://localhost${path}` : `http://localhost/${path}`;
  const urlObj = new URL(fullUrl);
  const pathname = urlObj.pathname;
  const params = new URLSearchParams(urlObj.search);
  const keyword = params.get('keyword');

  console.log(`[mock API] rawUrl=${rawUrl}, pathname=${pathname}`);

  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      switch (pathname) {
        case '/api/options/cities':
          return resolve({
            status: 0,
            msg: '',
            data: { items: cityOptions },
          });

        case '/api/options/properties':
          return resolve({
            status: 0,
            msg: '',
            data: { items: propertyOptions },
          });

        case '/api/options/users':
          const filtered = keyword
            ? userOptions.filter(u => u.username.includes(keyword))
            : userOptions;
          return resolve({
            status: 0,
            msg: '',
            data: { items: filtered },
          });

        case '/api/options/departments':
          return resolve({
            status: 0,
            msg: '',
            data: { items: departmentTree },
          });

        case '/api/options/regions':
          return resolve({
            status: 0,
            msg: '',
            data: { items: regionTree },
          });

        case '/api/options/sub-units':
          const propertyCode = params.get('propertyCode');
          const subs = propertyCode ? (subUnitsByProperty[propertyCode] || []) : [];
          return resolve({
            status: 0,
            msg: '',
            data: { items: subs },
          });

        case '/api/mock/table-data':
        case '/api/mock/table-large': {
          // table-data: 89 records, table-large: 5879 records (for ellipsis pagination test)
          const isLarge = pathname === '/api/mock/table-large';
          const total = isLarge ? 5879 : 89;
          // Generate 89 records with realistic data
          const allItems = [
            { orderDate: '2025/06/26 09:56:30', orderId: '13333220363644', activityId: '--', dealCode: 'TDCTEST5', discountDesc: 'TDC10%折扣券', dealName: 'TDCTEST3', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:56:30', orderId: '13333224990381', activityId: '--', dealCode: 'TDCTEST3', discountDesc: 'TDC10%折扣券', dealName: 'TDCTEST3', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:54:34', orderId: '1333327731611', activityId: '--', dealCode: 'TDCTEST2', discountDesc: 'TDC10元代金券', dealName: 'TDCTEST2', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:54:33', orderId: '13333255717239', activityId: '--', dealCode: 'TDCTEST2', discountDesc: 'TDC10元代金券', dealName: 'TDCTEST2', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 18:14:25', orderId: '13332920743919', activityId: '--', dealCode: 'TDCUETS TPRO01', discountDesc: 'TDCUETS TPRO01-U型枕1gromh-b...', dealName: 'TDCTESTP R001-U型...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB(SLT)', guestName: 'UTEST AMY\n690153157205', mobileEmail: '+86 1222\nu0test@sg', operation: 'View' },
            { orderDate: '2025/06/26 17:59:29', orderId: '13332924215460', activityId: '--', dealCode: 'TDBK001', discountDesc: 'yettwtestprod', dealName: 'TDCTUETSB U001-U型...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.03', businessUnit: 'SLNB', guestName: 'UTEST AMY\n690153157205', mobileEmail: '+86 1222\nu0test@sg', operation: 'View' },
            { orderDate: '2025/06/26 17:46:33', orderId: '1333295157785', activityId: '--', dealCode: 'TDCTUETSKD01-U TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:46:33', orderId: '13332959969978', activityId: '--', dealCode: 'TDCTUETSKD01-U TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:38:51', orderId: '13332934508456', activityId: '--', dealCode: 'TDCUETS TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:38:51', orderId: '1333296396303', activityId: '--', dealCode: 'TDCUETS TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
          ];

          // Extend to `total` records by cycling through the data
          const extended: typeof allItems = [];
          for (let i = 0; i < total; i++) {
            const base = allItems[i % allItems.length];
            extended.push({
              ...base,
              orderId: `1333${String(1000000 + i).padStart(7, '0')}`,
              orderDate: `2025/06/${String(26 - Math.floor(i / 10)).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:${String(10 + (i % 50)).padStart(2, '0')}:${String(10 + (i % 50)).padStart(2, '0')}`,
            });
          }

          // Server-side pagination
          const page = parseInt(params.get('page') || '1', 10);
          const perPage = parseInt(params.get('perPage') || '10', 10);
          const start = (page - 1) * perPage;
          const pagedItems = extended.slice(start, start + perPage);

          console.log(`[mock API] table-data: page=${page}, perPage=${perPage}, returning ${pagedItems.length} items of ${total}`);

          return resolve({
            status: 0,
            msg: 'ok',
            data: {
              items: pagedItems,
              total,
            },
          });
        }

        case '/api/mock/table-search': {
          // Generate same 89 records as table-data
          const allItems = [];
          const baseRecords = [
            { orderDate: '2025/06/26 09:56:30', orderId: '13333220363644', activityId: '--', dealCode: 'TDCTEST5', discountDesc: 'TDC10%折扣券', dealName: 'TDCTEST3', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:56:30', orderId: '13333224990381', activityId: '--', dealCode: 'TDCTEST3', discountDesc: 'TDC10%折扣券', dealName: 'TDCTEST3', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:54:34', orderId: '1333327731611', activityId: '--', dealCode: 'TDCTEST2', discountDesc: 'TDC10元代金券', dealName: 'TDCTEST2', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 09:54:33', orderId: '13333255717239', activityId: '--', dealCode: 'TDCTEST2', discountDesc: 'TDC10元代金券', dealName: 'TDCTEST2', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLFT', guestName: 'Guest Name\nJoyi Niu\n690153128925', mobileEmail: '6901531\n2862409', operation: 'View' },
            { orderDate: '2025/06/26 18:14:25', orderId: '13332920743919', activityId: '--', dealCode: 'TDCUETS TPRO01', discountDesc: 'TDCUETS TPRO01-U型枕1gromh-b...', dealName: 'TDCTESTP R001-U型...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB(SLT)', guestName: 'UTEST AMY\n690153157205', mobileEmail: '+86 1222\nu0test@sg', operation: 'View' },
            { orderDate: '2025/06/26 17:59:29', orderId: '13332924215460', activityId: '--', dealCode: 'TDBK001', discountDesc: 'yettwtestprod', dealName: 'TDCTUETSB U001-U型...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.03', businessUnit: 'SLNB', guestName: 'UTEST AMY\n690153157205', mobileEmail: '+86 1222\nu0test@sg', operation: 'View' },
            { orderDate: '2025/06/26 17:46:33', orderId: '1333295157785', activityId: '--', dealCode: 'TDCTUETSKD01-U TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:46:33', orderId: '13332959969978', activityId: '--', dealCode: 'TDCTUETSKD01-U TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:38:51', orderId: '13332934508456', activityId: '--', dealCode: 'TDCUETS TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
            { orderDate: '2025/06/26 17:38:51', orderId: '1333296396303', activityId: '--', dealCode: 'TDCUETS TKD01', discountDesc: 'TDCTUETSKD01-U型 自动化快速表单-on...', dealName: 'TDCTUETSK D01-U型自...', dealType: 'Pay by Cash', sellingPrice: 'CNY 0.01', businessUnit: 'SLNB', guestName: 'AMYUTEST', mobileEmail: '+86 1222', operation: 'View' },
          ];
          const total = 89;
          for (let i = 0; i < total; i++) {
            const base = baseRecords[i % baseRecords.length];
            const buList = ['SLFT', 'SLNB', 'SLNB(SLT)'];
            const dtList = ['Pay by Cash', 'Pay by Card', 'Points'];
            const item = {
              ...base,
              orderId: `1333${String(1000000 + i).padStart(7, '0')}`,
              orderDate: `2025/06/${String(26 - Math.floor(i / 10)).padStart(2, '0')} ${String(8 + (i % 12)).padStart(2, '0')}:${String(10 + (i % 50)).padStart(2, '0')}:${String(10 + (i % 50)).padStart(2, '0')}`,
              businessUnit: buList[i % 3],
              dealType: dtList[i % 3],
            } as any;

            // Only first 3 rows have sub items (collapsible demo)
            if (i < 3) {
              (item as any).children = [
                { ...item, orderId: item.orderId + '-1', businessUnit: 'SLNB,SLTJ' },
                { ...item, orderId: item.orderId + '-2', businessUnit: 'SLNB,SLTJ' },
              ];
            }

            allItems.push(item);
          }

          // Search filters
          const orderId = params.get('orderId');
          const dealType = params.get('dealType');
          const businessUnit = params.get('businessUnit');
          const dateRange = params.get('dateRange');

          let filtered = [...allItems];

          if (orderId) {
            filtered = filtered.filter(item => item.orderId.includes(orderId));
          }
          if (dealType) {
            filtered = filtered.filter(item => item.dealType === dealType);
          }
          if (businessUnit) {
            filtered = filtered.filter(item => item.businessUnit === businessUnit);
          }
          if (dateRange) {
            const [start, end] = dateRange.split(',');
            filtered = filtered.filter(item => {
              const itemDate = item.orderDate.split(' ')[0].replace(/\//g, '-');
              return itemDate >= start && itemDate <= end;
            });
          }

          // Pagination
          const page = parseInt(params.get('page') || '1', 10);
          const perPage = parseInt(params.get('perPage') || '10', 10);
          const startIdx = (page - 1) * perPage;
          const pagedItems = filtered.slice(startIdx, startIdx + perPage);

          console.log(`[mock API] table-search: page=${page}, perPage=${perPage}, filters: orderId=${orderId}, dealType=${dealType}, bu=${businessUnit}, dateRange=${dateRange}, filtered=${filtered.length} of ${total}`);

          return resolve({
            status: 0,
            msg: 'ok',
            data: {
              items: pagedItems,
              total: filtered.length,
            },
          });
        }

        case '/api/mock':
        case '/api/mock2/form/saveForm':
          return resolve({
            status: 0,
            msg: '保存成功',
            data: {},
          });

        default:
          return resolve({
            status: 0,
            msg: '',
            data: { items: [] },
          });
      }
    }, 200);
  });
}
