import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

/**
 * Closable Tabs — config read from Amis JSON schema.
 *
 * Schema format:
 * {
 *   "type": "tabs",
 *   "className": "custom-closable-tabs",
 *   "addable": true,
 *   "addBtnText": "+ Add",
 *   "maxTabs": 10,
 *   "titlePrefix": "Sub Mission",
 *   "tabs": [
 *     { "title": "Sub Mission 1", "closable": true, "body": "..." },
 *     { "title": "Sub Mission 2", "closable": true, "body": "..." }
 *   ]
 * }
 *
 * titlePrefix: prefix for newly added tabs (default: "Tab")
 * maxTabs: maximum number of tabs allowed (default: 10)
 * tabs: initial tab definitions
 */

interface TabDef {
  title: string;
  closable?: boolean;
  body?: unknown;
}

interface ClosableTabsSchema {
  type: string;
  className: string;
  addable?: boolean;
  addBtnText?: string;
  maxTabs?: number;
  titlePrefix?: string;
  tabs?: TabDef[];
}

const DEFAULT_PREFIX = 'Tab';
const DEFAULT_MAX_TABS = 10;
const DEFAULT_TABS: TabDef[] = [
  { title: 'Tab 1', body: 'Tab 1 content' },
  { title: 'Tab 2', body: 'Tab 2 content' },
];

let nextIndex = 3;

export function resetNextIndex(val: number) {
  nextIndex = val;
}

export const ClosableTabsShowcase: React.FC<{ schema: ClosableTabsSchema }> = ({ schema }) => {
  const titlePrefix = schema?.titlePrefix ?? DEFAULT_PREFIX;
  const maxTabs = schema?.maxTabs ?? DEFAULT_MAX_TABS;
  const initialTabs: TabDef[] = schema?.tabs ?? DEFAULT_TABS;

  const [tabs, setTabs] = useState<TabDef[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<TabDef>(initialTabs[0]);
  const [showScrollHint, setShowScrollHint] = useState({ left: false, right: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number>(0);

  // Reset nextIndex when schema changes
  useEffect(() => {
    nextIndex = initialTabs.length + 1;
  }, [initialTabs.length]);

  const addTab = useCallback(() => {
    setTabs(prev => {
      if (prev.length >= maxTabs) return prev;
      const idx = nextIndex++;
      const title = `${titlePrefix} ${idx}`;
      const newTab: TabDef = {
        title,
        closable: true,
        body: { type: 'tpl', tpl: `<div style="padding:12px;">${title} content area</div>` },
      };
      setActiveTab(newTab);
      return [...prev, newTab];
    });
  }, [maxTabs, titlePrefix]);

  const removeTab = useCallback((title: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.title !== title);
      if (title === activeTab.title && next.length > 0) {
        setActiveTab(next[next.length - 1]);
      }
      return next;
    });
  }, [activeTab.title]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: step, behavior: 'smooth' });
  }, []);

  // Detect overflow and update scroll hint visibility
  useEffect(() => {
    const check = () => {
      const el = scrollRef.current;
      const ul = ulRef.current;
      if (!el || !ul) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowScrollHint({
        left: scrollLeft > 2,
        right: scrollWidth > clientWidth + scrollLeft + 2,
      });
    };

    check();
    const observer = new ResizeObserver(check);
    if (ulRef.current) observer.observe(ulRef.current);
    if (scrollRef.current) observer.observe(scrollRef.current);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tabs]);

  const isMaxReached = tabs.length >= maxTabs;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    padding: 0,
    margin: 0,
    background: '#F9FAFA',
    border: 'none',
    boxShadow: 'none',
  };

  const ulStyle: React.CSSProperties = {
    gap: 0,
    border: 'none',
    background: '#F9FAFA',
    padding: 0,
    margin: 0,
    listStyle: 'none',
    display: 'flex',
    whiteSpace: 'nowrap',
  };

  const renderScrollButton = (direction: 'left' | 'right') => (
    <button
      className={`closable-scroll-btn closable-scroll-btn--${direction}`}
      onClick={() => scroll(direction)}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [direction]: 0,
        width: '32px',
        background: direction === 'left'
          ? 'linear-gradient(to right, #F9FAFA 60%, transparent)'
          : 'linear-gradient(to left, #F9FAFA 60%, transparent)',
        border: 'none',
        cursor: 'pointer',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        color: '#394DB9',
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );

  const renderTab = (tab: TabDef, isAdd: boolean) => {
    if (isAdd) {
      return (
        <li
          key="__add__"
          onClick={addTab}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 10px 10px 20px',
            gap: '10px',
            height: '40px',
            color: isMaxReached ? '#ccc' : '#394DB9',
            fontWeight: 500,
            fontSize: '18px',
            cursor: isMaxReached ? 'not-allowed' : 'pointer',
            background: '#F9FAFA',
            boxSizing: 'border-box',
            flex: 'none',
            lineHeight: 1,
            position: 'relative',
          }}
        >
          {!isMaxReached && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1px',
                height: '24px',
                background: '#e0e0e0',
              }}
            />
          )}
          + Add
        </li>
      );
    }

    return (
      <li
        key={tab.title}
        className={`cxd-Tabs-link ${tab.title === activeTab.title ? 'is-active' : ''}`}
        onClick={() => setActiveTab(tab)}
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '10px 10px 10px 20px',
          gap: '10px',
          height: '40px',
          margin: 0,
          background: tab.title === activeTab.title ? '#fff' : '#F9FAFA',
          border: 'none',
          borderTop: tab.title === activeTab.title ? '4px solid #394DB9' : '4px solid transparent',
          borderRadius: 0,
          boxSizing: 'border-box',
          flex: 'none',
          cursor: 'pointer',
          transition: 'none',
        }}
      >
        <a
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            position: 'static',
            width: 'auto',
            flexShrink: 0,
            padding: 0,
            margin: 0,
            fontSize: '18px',
            fontWeight: tab.title === activeTab.title ? 500 : 400,
            color: tab.title === activeTab.title ? '#394DB9' : '#555',
            background: 'transparent',
            border: 'none',
            textDecoration: 'none',
            lineHeight: 1,
          }}
        >
          {tab.title}
        </a>
        <span
          className="cxd-Tabs-link-close"
          onClick={(e) => {
            e.stopPropagation();
            removeTab(tab.title);
          }}
          style={{
            width: '10px',
            height: '10px',
            margin: 0,
            padding: 0,
            position: 'static',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '10px',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6,
            flexShrink: 0,
          }}
        >
          ×
        </span>
      </li>
    );
  };

  // Build content schema from active tab's body
  const contentSchema = activeTab?.body ?? {
    type: 'tpl',
    tpl: `<div style="padding:12px;">${activeTab?.title ?? 'Tab'} content area</div>`,
  };

  return (
    <div className="custom-closable-tabs" style={{ margin: 0 }}>
      {/* Max tabs indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 4px 0',
        fontSize: '12px',
        color: '#999',
      }}>
        <span>{tabs.length} / {maxTabs} tabs</span>
      </div>

      {/* Tab bar with scroll */}
      <div style={containerStyle}>
        {tabs.length === 0 ? (
          <ul style={ulStyle}>
            {renderTab({ title: '', body: null }, true)}
          </ul>
        ) : (
          <>
            {showScrollHint.left && renderScrollButton('left')}
            {showScrollHint.right && renderScrollButton('right')}

            <div
              ref={scrollRef}
              className="closable-scroll-container"
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
            >
              <ul ref={ulRef} style={ulStyle}>
                {tabs.map(tab => renderTab(tab, false))}
                {renderTab({ title: '', body: null }, true)}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Tab content — rendered via Amis */}
      <div style={{ background: '#fff', padding: '20px', paddingBottom: 0 }}>
        <AmisLivePreview schema={contentSchema} />
      </div>
    </div>
  );
};

export default ClosableTabsShowcase;
