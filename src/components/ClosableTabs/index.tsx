import React, { useState, useRef, useEffect, useCallback } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps, RenderSchema } from 'amis';

/**
 * ClosableTab — Amis custom renderer with `schema_format` support.
 *
 * Custom add button injected into Amis tab bar DOM. No Amis native `addable`.
 * Uses direct child selectors (>) to avoid matching nested tab links.
 *
 * DOM chain for Amis tabs:
 * .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper
 *   > .cxd-Tabs-linksContainer
 *     > .cxd-Tabs-linksContainer-main
 *       > .cxd-Tabs-links
 *         > .cxd-Tabs-link (tab link li elements)
 */
interface ClosableTabProps extends FormControlProps {
  schema_format?: Record<string, unknown>;
  tabs?: Record<string, unknown>[];
  addable?: boolean;
  addBtnText?: string;
  className?: string;
  closable?: boolean;
  max?: number;
}

function buildTabFromSchema(
  schema: Record<string, unknown>,
  index: number
): Record<string, unknown> {
  const bodySchema = JSON.parse(JSON.stringify(schema));
  return {
    title: (bodySchema as any).title || `Tab ${index}`,
    closable: true,
    body: bodySchema,
  };
}

const ADD_BTN_CLASS = 'closable-custom-add';

// Direct child selector to avoid matching nested tabs
const TAB_LINK_SELECTOR = '.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link';
const LINKS_CONTAINER_SELECTOR = '.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links';

const ClosableTabInner: React.FC<ClosableTabProps> = (props) => {
  const {
    schema_format,
    addable,
    addBtnText,
    className,
    tabs: initialTabs,
    closable,
    max,
    render,
    data,
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Record<string, unknown>[]>([]);
  // Refs for config values used in Observer (no re-render needed)
  const addableRef = useRef(addable);
  const addBtnTextRef = useRef(addBtnText);
  const maxRef = useRef(max);
  const schemaRef = useRef(schema_format);
  const canAddRef = useRef(false);

  // Build initial tabs
  const hasInitialTabs = Array.isArray(initialTabs) && initialTabs.length > 0;
  const defaultTabs = schema_format ? [buildTabFromSchema(schema_format, 1)] : [];

  const [tabs, setTabs] = useState<Record<string, unknown>[]>(
    hasInitialTabs ? initialTabs : defaultTabs
  );

  const handleAddRef = useRef<(() => void) | null>(null);

  // Keep refs in sync
  tabsRef.current = tabs;
  addableRef.current = addable;
  addBtnTextRef.current = addBtnText;
  maxRef.current = max;
  schemaRef.current = schema_format;
  canAddRef.current = addable !== false && schema_format && (max === undefined || tabs.length < max);

  // Handle add tab — fully controlled
  const handleAdd = useCallback(() => {
    const schema = schemaRef.current;
    if (!schema) return;
    const currentTabs = tabsRef.current;
    const max = maxRef.current;
    if (max !== undefined && currentTabs.length >= max) return;

    let nextIndex = currentTabs.length + 1;
    const existingTitles = new Set(currentTabs.map(t => t.title));
    while (existingTitles.has(`Tab ${nextIndex}`) || existingTitles.has(`Sub Mission ${nextIndex}`)) {
      nextIndex++;
    }

    const newTab = buildTabFromSchema(schema, nextIndex);
    setTabs(prev => [...prev, newTab]);
  }, []);
  handleAddRef.current = handleAdd;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const syncAddBtn = () => {
      const linksContainer = wrapper.querySelector(LINKS_CONTAINER_SELECTOR);
      if (!linksContainer) return;

      const existingBtn = linksContainer.querySelector(`.${ADD_BTN_CLASS}`);

      if (!canAddRef.current) {
        if (existingBtn) existingBtn.remove();
        return;
      }

      if (existingBtn) return;

      const addBtn = document.createElement('li');
      addBtn.className = `cxd-Tabs-link ${ADD_BTN_CLASS}`;
      addBtn.style.cssText = 'cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:10px 10px 10px 20px;height:40px;color:#394DB9;font-weight:500;font-size:18px;background:#F9FAFA;border-top:4px solid transparent;list-style:none;margin:0;border:none;border-radius:0;box-sizing:border-box;';
      addBtn.innerHTML = `<a style="padding:0;margin:0;font-size:18px;font-weight:500;color:#394DB9;background:transparent;border:none;text-decoration:none;line-height:1;">${addBtnTextRef.current || '+ Add Tab'}</a>`;
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleAddRef.current();
      }, true);

      linksContainer.appendChild(addBtn);
    };

    const observer = new MutationObserver(() => {
      syncAddBtn();

      const tabLinks = wrapper.querySelectorAll(`${TAB_LINK_SELECTOR}:not(.${ADD_BTN_CLASS})`);
      const currentTitles = new Set<string>();
      tabLinks.forEach(link => {
        const title = (link as HTMLElement).querySelector('a')?.textContent?.trim();
        if (title) currentTitles.add(title);
      });

      const currentTabs = tabsRef.current;
      const stateTitles = currentTabs.map(t => t.title as string).filter(Boolean);
      const removedTitles = stateTitles.filter(title => !currentTitles.has(title));

      if (removedTitles.length > 0) {
        setTabs(prev => prev.filter(tab => {
          const title = tab.title as string;
          return title && currentTitles.has(title);
        }));
      }
    });

    requestAnimationFrame(syncAddBtn);
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const nativeTabsSchema: RenderSchema = {
    type: 'tabs',
    className: className || 'custom-closable-tabs',
    addable: false,
    closable: closable !== false,
    tabs: tabs,
  };

  return (
    <div className="closable-tab-wrapper" ref={wrapperRef}>
      {render ? render('tabs', nativeTabsSchema, { data }) : (
        <div style={{ color: 'red' }}>ERROR: render function not available in closable-tab renderer</div>
      )}
    </div>
  );
};

console.log('[ClosableTabs] Registering closable-tab renderer using registerRenderer from amis...');
registerRenderer({
  type: 'closable-tab',
  component: ClosableTabInner,
});
console.log('[ClosableTabs] Renderer registered successfully');

export { ClosableTabInner as ClosableTab };
export default ClosableTabInner;
