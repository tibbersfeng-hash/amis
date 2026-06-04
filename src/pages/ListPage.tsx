import React, { useState, useEffect, useCallback, useRef } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';
import { Loading, ErrorDisplay } from '../components/Loading';
import { getLocale } from '../utils/locale';
import '../components/ClosableTabs'; // Register closable-tab renderer

const DEFAULT_PAGE_SIZE = 10;

interface ListSchema {
  title: string;
  dataIdPrefix?: string;
  linkTemplate?: string;
  columns: Array<{ name: string; label: string; sortable?: boolean }>;
  searchFields?: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
  }>;
}

interface ListResponse {
  listSchema: ListSchema;
  items: Array<{ dataId: string; [key: string]: unknown }>;
  total: number;
}

function parseParams(): { dataType: string } {
  const params = new URLSearchParams(window.location.search);
  return { dataType: params.get('dataType') || '' };
}

/**
 * Build Amis filter (search form) from list schema searchFields
 */
function buildFilter(listSchema: ListSchema): Record<string, unknown> | undefined {
  if (!listSchema.searchFields?.length) return undefined;

  const body = listSchema.searchFields.map((field) => {
    if (field.type === 'select') {
      return {
        type: 'select',
        name: field.name,
        label: field.label,
        placeholder: field.placeholder || `请选择${field.label}`,
        clearable: true,
        options: field.options || [],
      };
    }
    return {
      type: 'input-text',
      name: field.name,
      label: field.label,
      placeholder: field.placeholder || `请输入${field.label}`,
      clearable: true,
    };
  });

  return {
    title: '',
    mode: 'inline',
    wrapWithPanel: true,
    className: 'crud-search-form',
    target: 'crud-table',
    body,
    actions: [
      { type: 'submit', label: '查询', level: 'primary' },
      { type: 'reset', label: '重置' },
    ],
  };
}

/**
 * Build Amis columns from list schema columns
 */
function buildColumns(listSchema: ListSchema): Array<Record<string, unknown>> {
  return listSchema.columns.map((col) => ({
    name: col.name,
    label: col.label,
    sortable: col.sortable || false,
  }));
}

/**
 * Build Amis operation column with View/Edit/Delete buttons
 */
function buildOperationColumn(dataType: string, linkTemplate?: string): Record<string, unknown> {
  return {
    type: 'operation',
    label: '操作',
    fixed: 'right',
    width: 160,
    buttons: [
      {
        type: 'button',
        label: '查看',
        level: 'link',
        actionType: 'link',
        link: linkTemplate || `/remote?dataType=${dataType}&dataId=\${dataId}`,
      },
      {
        type: 'button',
        label: '编辑',
        level: 'link',
        actionType: 'link',
        link: linkTemplate || `/remote?dataType=${dataType}&dataId=\${dataId}`,
      },
      {
        type: 'button',
        label: '删除',
        level: 'link',
        className: 'text-danger',
        actionType: 'ajax',
        api: `delete:/api/page/delete?dataId=\${dataId}`,
        confirmText: '确定要删除这条记录吗？',
      },
    ],
  };
}

/**
 * Build full Amis CRUD schema from list config
 */
function buildCrudSchema(dataType: string, listSchema: ListSchema, items: Array<{ dataId: string; [key: string]: unknown }>, total: number): Record<string, unknown> {
  const columns = buildColumns(listSchema);
  const filter = buildFilter(listSchema);
  const operationCol = buildOperationColumn(dataType, listSchema.linkTemplate);

  return {
    type: 'crud',
    name: 'crud-table',
    mode: 'table',
    syncLocation: false,
    loadDataOnce: true,
    api: {
      method: 'get',
      url: '/api/crud-placeholder',
    },
    ...(filter ? { filter } : {}),
    columns: [...columns, operationCol],
    headerToolbar: ['filter-toggler'],
    footerToolbar: [
      { type: 'statistics', align: 'left' },
      { type: 'pagination', align: 'center', maxButtons: 6, showPageInput: false },
      { type: 'switch-per-page', align: 'right' },
    ],
    perPage: DEFAULT_PAGE_SIZE,
    perPageAvailable: [10, 20, 50],
  };
}

const ListPage: React.FC = () => {
  const [params] = useState(() => parseParams());
  const { dataType } = params;

  const [listData, setListData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch list data from API
  useEffect(() => {
    if (!dataType) {
      setError('请指定 dataType 参数，例如: /list?dataType=hotel-basic');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/page/list?dataType=${encodeURIComponent(dataType)}`)
      .then(async (r) => {
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          throw new Error(errBody.error || `API error: ${r.status}`);
        }
        return r.json();
      })
      .then((result) => {
        setListData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || '加载列表失败');
        setLoading(false);
      });
  }, [dataType]);

  // Render Amis CRUD schema when data is loaded
  useEffect(() => {
    console.log('[ListPage] useEffect fired', { hasContainer: !!containerRef.current, hasData: !!listData });
    if (!containerRef.current || !listData) return;

    containerRef.current.innerHTML = '';

    const { listSchema, items, total } = listData;
    console.log('[ListPage] Building CRUD schema with', items.length, 'items');
    const amisSchema = buildCrudSchema(dataType, listSchema, items, total);
    console.log('[ListPage] CRUD schema:', JSON.stringify(amisSchema).slice(0, 200));

    const amisScoped = renderAmis(
      amisSchema as any,
      {
        data: {},
        locale: getLocale(),
        theme: 'cxd',
      },
      {
        session: 'list-page',
        theme: 'cxd',
        locale: getLocale(),
        fetcher: (api: any) => {
          const { url, method = 'get', data, config } = api;

          // Return list data for CRUD's loadDataOnce
          if (url === '/api/crud-placeholder') {
            return Promise.resolve({ status: 0, data: { items, total } });
          }

          let fetchUrl = url;
          let fetchConfig: RequestInit = {
            method: method.toUpperCase(),
            headers: { 'Content-Type': 'application/json' },
            ...config,
          };

          if (method === 'get' && data) {
            const params = new URLSearchParams(data as Record<string, string>);
            fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + params.toString();
          } else if (data) {
            fetchConfig.body = JSON.stringify(data);
          }

          return fetch(fetchUrl, fetchConfig).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            return res.json();
          });
        },
        isCancel: (value: unknown) => (value as Error)?.message === 'cancel',
        confirm: (msg: string) => Promise.resolve(confirm(msg)),
        notify: (type: string, msg: string) => console.log(`[amis] ${type}: ${msg}`),
      },
      ''
    );

    ReactDOM.render(amisScoped, containerRef.current);

    return () => {
      if (containerRef.current) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      }
    };
  }, [dataType, listData]);

  if (!dataType) {
    return <ErrorDisplay message="请指定 dataType 参数，例如: /list?dataType=hotel-basic" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="amis-list-page">
      <div ref={containerRef} className="amis-scope" />
    </div>
  );
};

export default ListPage;
