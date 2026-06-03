import React, { useState, useRef, useEffect, useCallback } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps, RenderSchema } from 'amis';

/**
 * ClosableTab — Amis custom renderer with `schema_format` support.
 *
 * Strategy: fully control add via click interception (not Amis native addable).
 * The MutationObserver only tracks deletions. This avoids the feedback loop where
 * Observer → setTabs → React re-render → Amis DOM update → Observer again.
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
    ...restProps
  } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Record<string, unknown>[]>([]);
  const renderRef = useRef(0);

  // Build initial tabs
  const hasInitialTabs = Array.isArray(initialTabs) && initialTabs.length > 0;
  const defaultTabs = schema_format ? [buildTabFromSchema(schema_format, 1)] : [];

  const [tabs, setTabs] = useState<Record<string, unknown>[]>(
    hasInitialTabs ? initialTabs : defaultTabs
  );

  // Keep ref in sync with state
  tabsRef.current = tabs;

  // MutationObserver: only track deletions (close buttons)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new MutationObserver(() => {
      const tabLinks = wrapper.querySelectorAll('.cxd-Tabs-link:not(.cxd-Tabs-addable)');
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

    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Intercept Amis add button clicks: handle tab creation ourselves
  const handleAddClick = useCallback(() => {
    if (!schema_format) return;
    const currentTabs = tabsRef.current;
    if (max !== undefined && currentTabs.length >= max) return;

    let nextIndex = currentTabs.length + 1;
    const existingTitles = new Set(currentTabs.map(t => t.title));

    while (existingTitles.has(`Tab ${nextIndex}`) || existingTitles.has(`Sub Mission ${nextIndex}`)) {
      nextIndex++;
    }

    const newTab = buildTabFromSchema(schema_format, nextIndex);
    setTabs(prev => [...prev, newTab]);
  }, [schema_format, max]);

  // Set up click interception for Amis addable button
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const addBtn = target.closest('.cxd-Tabs-addable');
      if (!addBtn || !wrapper.contains(addBtn)) return;

      // Intercept add click: prevent Amis native add, handle it ourselves
      e.preventDefault();
      e.stopPropagation();
      handleAddClick();
    };

    wrapper.addEventListener('click', handleClick, true);
    return () => wrapper.removeEventListener('click', handleClick, true);
  }, [handleAddClick, max]);

  // Force re-render key bump when tabs change (ensures Amis re-renders fully)
  const currentKey = tabs.length;
  const currentRenderKey = renderRef.current;

  const canAdd = addable !== false && schema_format && (max === undefined || tabs.length < max);

  // Build native tabs schema — addable is true so Amis renders the + button,
  // but we intercept clicks to handle creation ourselves
  const nativeTabsSchema: RenderSchema = {
    type: 'tabs',
    className: className || 'custom-closable-tabs',
    addable: canAdd,
    addBtnText: addBtnText || '+ Add Tab',
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

// Register the renderer directly with Amis
console.log('[ClosableTabs] Registering closable-tab renderer using registerRenderer from amis...');
registerRenderer({
  type: 'closable-tab',
  component: ClosableTabInner,
});
console.log('[ClosableTabs] Renderer registered successfully');

export { ClosableTabInner as ClosableTab };
export default ClosableTabInner;
