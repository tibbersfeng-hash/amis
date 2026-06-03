import React, { useState, useRef, useEffect } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps, RenderSchema } from 'amis';

/**
 * ClosableTab — Amis custom renderer with `schema_format` support.
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

  console.log('[ClosableTabInner] Render called with props:', {
    hasSchemaFormat: !!schema_format,
    hasTabs: Array.isArray(initialTabs),
    tabsLength: initialTabs?.length,
    addable,
    addBtnText,
    hasRender: typeof render === 'function',
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Record<string, unknown>[]>([]);

  // Build initial tabs
  const hasInitialTabs = Array.isArray(initialTabs) && initialTabs.length > 0;
  const defaultTabs = schema_format ? [buildTabFromSchema(schema_format, 1)] : [];

  const [tabs, setTabs] = useState<Record<string, unknown>[]>(
    hasInitialTabs ? initialTabs : defaultTabs
  );

  // Keep ref in sync with state
  tabsRef.current = tabs;

  // Effect to sync tabs state with actual DOM (detect deletions by Amis native close,
  // and additions by Amis native addable — rebuilding new tabs with schema_format)
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

      // Compare current DOM with our state
      const currentTabs = tabsRef.current;
      const stateTitles = currentTabs.map(t => t.title as string).filter(Boolean);

      const removedTitles = stateTitles.filter(title => !currentTitles.has(title));
      const newTitles = Array.from(currentTitles).filter(title => !stateTitles.includes(title));

      if (removedTitles.length > 0 || newTitles.length > 0) {
        setTabs(prev => {
          // Step 1: remove deleted tabs
          let synced = prev.filter(tab => {
            const title = tab.title as string;
            return title && currentTitles.has(title);
          });

          // Step 2: rebuild new tabs with schema_format (proper body, not Amis bare tabs)
          if (schema_format && newTitles.length > 0) {
            for (const title of newTitles) {
              // Find the index from the title (e.g. "Tab 3" → 3)
              const match = title.match(/(\d+)$/);
              const index = match ? parseInt(match[1], 10) : synced.length + 1;
              synced.push(buildTabFromSchema(schema_format, index));
            }
          }

          return synced;
        });
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [schema_format]);

  // Intercept Amis add button clicks to enforce max limit
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const addBtn = target.closest('.cxd-Tabs-addable');
      if (!addBtn || !wrapper.contains(addBtn)) return;

      if (max !== undefined && tabsRef.current.length >= max) {
        e.preventDefault();
        e.stopPropagation();
        // Remove the bare tab Amis just created
        requestAnimationFrame(() => {
          const panes = wrapper.querySelectorAll('.cxd-Tabs-pane');
          if (panes.length > tabsRef.current.length) {
            panes[tabsRef.current.length]?.remove();
          }
          const tabLinks = wrapper.querySelectorAll('.cxd-Tabs-link:not(.cxd-Tabs-addable)');
          if (tabLinks.length > tabsRef.current.length) {
            tabLinks[tabsRef.current.length]?.remove();
          }
        });
      }
    };

    wrapper.addEventListener('click', handleClick, true);
    return () => wrapper.removeEventListener('click', handleClick, true);
  }, [max]);

  const canAdd = addable !== false && schema_format && (max === undefined || tabs.length < max);

  // Build native tabs schema with Amis native addable
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
      {/* Render native tabs using Amis render function */}
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
