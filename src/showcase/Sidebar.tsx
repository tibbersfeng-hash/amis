import React, { useState, useCallback, useEffect } from 'react';
import { getCategories, getPagesByCategory } from './data';

/**
 * Preferred category order: custom first, then Amis built-in.
 */
const CATEGORY_ORDER = [
  '工具',
  '配置系统',
  '基础设施',
  '预览组件',
  '表单输入',
  '展示组件',
  '布局组件',
  '数据组件',
  '反馈组件',
  '导航组件',
  '操作组件',
  '高级组件',
];

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = getCategories().sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const toggleCategory = useCallback((cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // Expand all by default
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(c => { initial[c] = false; });
    setCollapsed(initial);
  }, [categories.length]);

  return (
    <div className="showcase-sidebar">
      <div className="showcase-sidebar-header">
        <div className="showcase-logo">CMS</div>
        <div className="showcase-sidebar-title">Component Showcase</div>
      </div>
      <nav className="showcase-nav">
        {categories.map(cat => (
          <div key={cat} className="showcase-nav-group">
            <button
              className="showcase-nav-category"
              onClick={() => toggleCategory(cat)}
            >
              <span className={`showcase-nav-arrow ${collapsed[cat] ? '' : 'open'}`}>▸</span>
              {cat}
            </button>
            {!collapsed[cat] && (
              <div className="showcase-nav-items">
                {getPagesByCategory(cat).map(page => (
                  <button
                    key={page.id}
                    className={`showcase-nav-item ${activeId === page.id ? 'active' : ''}`}
                    onClick={() => onSelect(page.id)}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};
