import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AmisLivePreview } from './AmisLivePreview';

/**
 * Closable Tabs — React-driven with configurable title prefix via data prop.
 *
 * The title prefix (e.g. "Sub Mission") is passed through AmisLivePreview's data
 * and injected into a hidden DOM element, then read by this component.
 *
 * Schema usage:
 * {
 *   "type": "tpl",
 *   "className": "custom-closable-tabs-wrapper",
 *   "tpl": "<div class='closable-tab-config' data-title-prefix='Sub Mission' data-max-tabs='10'></div>",
 *   "tabs": [...]
 * }
 */

export interface ClosableTabsShowcaseProps {
  /** Prefix for newly added tab titles, e.g. "Sub Mission" → "Sub Mission 3" */
  titlePrefix?: string;
  /** Maximum number of tabs allowed (default: 10) */
  maxTabs?: number;
  /** Initial tab titles */
  tabs?: string[];
}

const DEFAULT_PREFIX = 'Tab';
const DEFAULT_MAX_TABS = 10;
const DEFAULT_TABS = ['Tab 1', 'Tab 2'];

let nextIndex = 3;

export function resetNextIndex(val: number) {
  nextIndex = val;
}

export const ClosableTabsShowcase: React.FC<ClosableTabsShowcaseProps> = ({
  titlePrefix = DEFAULT_PREFIX,
  maxTabs = DEFAULT_MAX_TABS,
  tabs: initialTabs = DEFAULT_TABS,
}) => {
  const [tabs, setTabs] = useState<string[]>(initialTabs);
  const [activeTab, setActiveTab] = useState(initialTabs[0]);
  const [showScrollHint, setShowScrollHint] = useState({ left: false, right: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number>(0);

  // Reset nextIndex when prefix changes (for showcase switching)
  useEffect(() => {
    nextIndex = initialTabs.length + 1;
  }, [initialTabs.length]);

  const addTab = useCallback(() => {
    setTabs(prev => {
      if (prev.length >= maxTabs) return prev;
      const idx = nextIndex++;
      const title = `${titlePrefix} ${idx}`;
      setActiveTab(title);
      return [...prev, title];
    });
  }, [maxTabs, titlePrefix]);

  const removeTab = useCallback((title: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t !== title);
      if (title === activeTab && next.length > 0) {
        setActiveTab(next[next.length - 1]);
      }
      return next;
    });
  }, [activeTab]);

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

  const renderTab = (title: string, isAdd: boolean) => {
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
        key={title}
        className={`cxd-Tabs-link ${title === activeTab ? 'is-active' : ''}`}
        onClick={() => setActiveTab(title)}
        style={{
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '10px 10px 10px 20px',
          gap: '10px',
          height: '40px',
          margin: 0,
          background: title === activeTab ? '#fff' : '#F9FAFA',
          border: 'none',
          borderTop: title === activeTab ? '4px solid #394DB9' : '4px solid transparent',
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
            fontWeight: title === activeTab ? 500 : 400,
            color: title === activeTab ? '#394DB9' : '#555',
            background: 'transparent',
            border: 'none',
            textDecoration: 'none',
            lineHeight: 1,
          }}
        >
          {title}
        </a>
        <span
          className="cxd-Tabs-link-close"
          onClick={(e) => {
            e.stopPropagation();
            removeTab(title);
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
            {renderTab('', true)}
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
                {tabs.map(title => renderTab(title, false))}
                {renderTab('', true)}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Tab content — rendered via Amis for each active tab */}
      <div style={{ background: '#fff', padding: '20px', paddingBottom: 0 }}>
        <AmisLivePreview
          schema={{
            type: 'tpl',
            tpl: `<div style="padding:12px;">${activeTab} content area</div>`,
          }}
        />
      </div>
    </div>
  );
};

export default ClosableTabsShowcase;
