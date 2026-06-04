import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loading, ErrorDisplay } from '../components/Loading';

const DEFAULT_PAGE_SIZE = 10;

interface Column {
  name: string;
  label: string;
  sortable?: boolean;
}

interface SearchField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface ListSchema {
  title: string;
  dataIdPrefix?: string;
  linkTemplate?: string;
  columns: Column[];
  searchFields?: SearchField[];
}

interface ListItem {
  dataId: string;
  [key: string]: unknown;
}

interface ListResponse {
  listSchema: ListSchema;
  items: ListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function parseParams(): { dataType: string } {
  const params = new URLSearchParams(window.location.search);
  return { dataType: params.get('dataType') || '' };
}

const ListPage: React.FC = () => {
  const [params] = useState(() => parseParams());
  const { dataType } = params;

  const [listData, setListData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // Search state (client-side filter within current page)
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  // Sort state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    if (!dataType) {
      setError('请指定 dataType 参数，例如: /list?dataType=hotel-basic');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/page/list?dataType=${encodeURIComponent(dataType)}&page=${page}&pageSize=${pageSize}`)
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
  }, [dataType, page, pageSize]);

  // Reset to page 1 when dataType changes
  useEffect(() => {
    setPage(1);
  }, [dataType]);

  // Filter + sort items (client-side on current page)
  const displayItems = useMemo(() => {
    if (!listData) return [];

    let items = [...listData.items];

    // Apply search filters
    const { keyword, ...fieldFilters } = searchValues;
    for (const [field, value] of Object.entries(fieldFilters)) {
      if (!value) continue;
      items = items.filter((item) => {
        const fieldVal = item[field];
        return fieldVal !== undefined && fieldVal !== null &&
          String(fieldVal).toLowerCase().includes(value.toLowerCase());
      });
    }

    // Keyword search across text fields
    if (keyword) {
      const kw = keyword.toLowerCase();
      const textFields = (listData.listSchema.columns || [])
        .map((c) => c.name)
        .filter(Boolean);

      items = items.filter((item) =>
        textFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null &&
            String(val).toLowerCase().includes(kw);
        })
      );
    }

    // Apply sorting
    if (sortField) {
      items.sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        const cmp = typeof va === 'number'
          ? va - Number(vb)
          : String(va).localeCompare(String(vb));
        return sortAsc ? cmp : -cmp;
      });
    }

    return items;
  }, [listData, searchValues, sortField, sortAsc]);

  const handleSearchChange = useCallback((name: string, value: string) => {
    setSearchValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setSearchValues({});
  }, []);

  const handleSort = useCallback((field: string) => {
    setSortField((prev) => prev === field ? field : field);
    setSortAsc((prev) => sortField === field ? !prev : true);
  }, [sortField]);

  const handleRowClick = useCallback((item: ListItem) => {
    const tpl = listData?.listSchema.linkTemplate || '/remote?dataType=' + dataType + '&dataId=' + item.dataId;
    const link = tpl.replace(/\$\{dataId\}/g, item.dataId).replace(/\$\{dataType\}/g, dataType);
    window.location.href = link;
  }, [dataType, listData]);

  const goToPage = useCallback((p: number) => {
    if (p >= 1 && p <= (listData?.totalPages || 1)) {
      setPage(p);
    }
  }, [listData]);

  const formatValue = (val: unknown): string => {
    if (val === undefined || val === null) return '-';
    return String(val);
  };

  if (!dataType) {
    return <ErrorDisplay message="请指定 dataType 参数，例如: /list?dataType=hotel-basic" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!listData) {
    return null;
  }

  const { listSchema, total, page: currentPage, totalPages } = listData;

  // Generate page numbers for pagination UI
  const pageNumbers: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }

  return (
    <div className="list-page-container">
      <div className="list-page-header">
        <h2>{listSchema.title || dataType + ' 列表'}</h2>
      </div>

      {/* Search panel */}
      {listSchema.searchFields && listSchema.searchFields.length > 0 && (
        <div className="list-page-search">
          {listSchema.searchFields.map((field) => (
            <div className="search-field" key={field.name}>
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={searchValues[field.name] || ''}
                  onChange={(e) => handleSearchChange(field.name, e.target.value)}
                >
                  <option value="">全部</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={field.placeholder || '搜索...'}
                  value={searchValues[field.name] || ''}
                  onChange={(e) => handleSearchChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
          <button className="list-page-btn list-page-btn-reset" onClick={handleReset}>
            重置
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="list-page-summary">
        共 {total} 条记录，第 {currentPage}/{totalPages} 页
        {searchValues.keyword || Object.values(searchValues).some(v => v) ? '（已过滤）' : ''}
      </div>

      {/* Table */}
      <div className="list-page-table-wrapper">
        <table className="list-page-table">
          <thead>
            <tr>
              {listSchema.columns.map((col) => (
                <th
                  key={col.name}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={col.sortable ? () => handleSort(col.name) : undefined}
                >
                  {col.label}
                  {col.sortable && sortField === col.name && (
                    <span className="sort-indicator">{sortAsc ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={listSchema.columns.length} className="empty-row">暂无数据</td>
              </tr>
            ) : (
              displayItems.map((item) => (
                <tr
                  key={item.dataId}
                  className="clickable-row"
                  onClick={() => handleRowClick(item)}
                >
                  {listSchema.columns.map((col) => (
                    <td key={col.name}>{formatValue(item[col.name])}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="list-page-pagination">
          <button
            className="page-btn"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            ‹ 上一页
          </button>

          {pageNumbers.map((p, i) =>
            typeof p === 'string' ? (
              <span key={`ellipsis-${i}`} className="page-ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`page-btn ${p === currentPage ? 'page-btn-active' : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            下一页 ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ListPage;
