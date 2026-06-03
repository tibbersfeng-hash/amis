import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { getShowcasePage, showcasePages, preloadAmisPages } from './data';
import type { Language } from '../components/LanguageSwitcher';
import { LANGUAGES } from '../components/LanguageSwitcher';
import { AmisLivePreview, AmisLivePreviewRef } from './AmisLivePreview';

/**
 * Minimal markdown-to-HTML renderer for props documentation.
 * Supports: headings, tables, bold/italic/inline code, lists, horizontal rules.
 */
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inTable = false;
  let inUl = false;
  let inOl = false;

  function closeList() {
    if (inUl) { htmlLines.push('</ul>'); inUl = false; }
    if (inOl) { htmlLines.push('</ol>'); inOl = false; }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table header separator (|---|---|)
    if (/^\|[\s\-:|]+\|/.test(line)) {
      continue;
    }

    // Table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        htmlLines.push('<table>');
        inTable = true;
      }
      const cells = line.trim().split('|').slice(1, -1);
      const isHeader = i + 1 < lines.length && /^\|[\s\-:|]+\|/.test(lines[i + 1]);
      const tag = isHeader ? 'th' : 'td';
      htmlLines.push(`<tr>${cells.map(c => `<${tag}>${inlineFormat(c.trim())}</${tag}>`).join('')}</tr>`);
      continue;
    }

    // Close table if not a table line
    if (inTable) {
      htmlLines.push('</table>');
      inTable = false;
    }

    // Headings
    if (/^### /.test(line)) { htmlLines.push(`<h4>${inlineFormat(line.slice(4))}</h4>`); closeList(); continue; }
    if (/^## /.test(line)) { htmlLines.push(`<h3>${inlineFormat(line.slice(3))}</h3>`); closeList(); continue; }
    if (/^# /.test(line)) { htmlLines.push(`<h3>${inlineFormat(line.slice(2))}</h3>`); closeList(); continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { htmlLines.push('<hr/>'); closeList(); continue; }

    // Unordered list
    if (/^\s*[-*] /.test(line)) {
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (!inUl) { htmlLines.push('<ul>'); inUl = true; }
      htmlLines.push(`<li>${inlineFormat(line.replace(/^\s*[-*] /, ''))}</li>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s/.test(line)) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (!inOl) { htmlLines.push('<ol>'); inOl = true; }
      htmlLines.push(`<li>${inlineFormat(line.replace(/^\s*\d+\.\s/, ''))}</li>`);
      continue;
    }

    // Plain text / empty line
    closeList();
    if (line.trim()) {
      htmlLines.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  if (inTable) htmlLines.push('</table>');
  closeList();
  return htmlLines.join('\n');
}

/**
 * Unified lazy component map — all custom showcase components.
 * Each entry is a React.lazy() call created once at module evaluation.
 * Amis pages don't need entries here — they render via AmisLivePreview
 * with lazy-loaded jsonSchema/component handled by getter-based Suspense in data.tsx.
 */
const lazyComponents: Record<string, React.LazyExoticComponent<React.FC<{ schema?: Record<string, unknown> }>>> = {
  'schema-preview': React.lazy(() => import('./SchemaPreview')),
  'i18n-config': React.lazy(() => import('../components/i18n-config/showcase')),
  'sticky-footer': React.lazy(() => import('../components/StickyFooter/showcase')),
  'loading': React.lazy(() => import('../components/Loading/showcase')),
  'language-switcher': React.lazy(() => import('../components/LanguageSwitcher/showcase')),
  'i18n-config-panel': React.lazy(() => import('../components/I18nConfigPanel/showcase')),
  'phone-mockup': React.lazy(() => import('../components/PhoneMockup/showcase')),
  'date-range-picker': React.lazy(() => import('../components/DateRangePicker/showcase')),
  'preview-panel': React.lazy(() => import('../components/PreviewPanel/showcase')),
  'amis-drawer': React.lazy(() => import('../components/DrawerShowcase')),
  'solid-fill-tabs': React.lazy(() => import('./SolidFillTabsShowcase')),
  'closable-tabs': React.lazy(() => import('./ClosableTabsShowcase')),
};

/**
 * Wrapper that renders the correct component based on page type.
 * Custom components use lazy-loaded modules; Amis components use AmisLivePreview directly.
 */
const PageRenderer = React.forwardRef<AmisLivePreviewRef, { pageId: string; jsonSchema: string; dataJson?: string; lang?: Language; label?: string; onPreviewDataChange?: (data: Record<string, unknown>) => void }>(
  ({ pageId, jsonSchema, dataJson, lang = 'zh', label, onPreviewDataChange }, ref) => {
    // Guard against empty or invalid JSON — should not happen after render, but protects during page switch
    let schema: Record<string, unknown> = {};
    try { schema = jsonSchema.trim() ? JSON.parse(jsonSchema) : {}; } catch { return null; }

    if (lazyComponents[pageId]) {
      const CustomComponent = lazyComponents[pageId];
      return <CustomComponent schema={schema} onDataChange={onPreviewDataChange} />;
    }
    const data = dataJson && dataJson.trim() ? JSON.parse(dataJson) : {};
    return <AmisLivePreview schema={schema} data={data} lang={lang} label={label} ref={ref} />;
  }
);
PageRenderer.displayName = 'PageRenderer';

export const ShowcaseApp: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(() => {
    const hash = window.location.hash.slice(1);
    return hash || showcasePages[0]?.id || '';
  });
  const [lang, setLang] = useState<Language>('zh');
  const [submittedData, setSubmittedData] = useState<Record<string, unknown> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const i18nRef = useRef<AmisLivePreviewRef>(null);
  const plainRef = useRef<AmisLivePreviewRef>(null);

  // Editable JSON state for showcase config display
  const [schemaJson, setSchemaJson] = useState<string>('');
  const [dataJson, setDataJson] = useState<string>('');
  const [schemaModified, setSchemaModified] = useState(false);
  const [dataModified, setDataModified] = useState(false);

  // Rendered JSON state — only updated when user clicks "Render" button
  const [renderedSchemaJson, setRenderedSchemaJson] = useState<string>('');
  const [renderedDataJson, setRenderedDataJson] = useState<string>('');
  const [renderKey, setRenderKey] = useState(0);

  const handleRender = useCallback(() => {
    let mergedSchema = schemaJson;
    try {
      const schema = JSON.parse(schemaJson);
      const data = dataJson.trim() ? JSON.parse(dataJson) : null;
      // Inject data JSON values into schema tabs (for Closable Tabs, Combo Tab, etc.)
      if (data && Array.isArray(schema?.tabs) && schema.tabs.length > 0) {
        const dataTabs = Array.isArray(data) ? data : (data?.tabs || []);
        if (Array.isArray(dataTabs) && dataTabs.length > 0) {
          const merged = schema.tabs.map((tab: Record<string, unknown>, i: number) => {
            const tabData = dataTabs[i];
            if (!tabData || typeof tabData !== 'object') return tab;
            // Merge data values into tab body
            const body = tab.body;
            if (body && typeof body === 'object' && (body as any).type === 'form') {
              return { ...tab, body: { ...body, data: { ...(body as any).data, ...tabData } } };
            }
            return tab;
          });
          mergedSchema = JSON.stringify({ ...schema, tabs: merged }, null, 2);
        }
      }
    } catch { /* use original schema */ }

    setRenderedSchemaJson(mergedSchema);
    setRenderedDataJson(dataJson);
    setRenderKey((k) => k + 1);
    setSchemaModified(false);
    setDataModified(false);
  }, [schemaJson, dataJson]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== activeId) setActiveId(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeId]);

  useEffect(() => {
    window.location.hash = activeId;
  }, [activeId]);

  // Clear submitted data when switching pages
  useEffect(() => {
    setSubmittedData(null);
  }, [activeId]);

  // Preload remaining Amis pages in background after initial render
  useEffect(() => {
    preloadAmisPages();
  }, []);

  // Derive page info early so subsequent useEffects can reference it
  const page = getShowcasePage(activeId);
  const isAmis = page && !lazyComponents[page.id];
  const hasMultiLang = isAmis && page?.category === '表单输入';

  // Reset editable JSON when switching pages — moved into ShowcasePageContent
  // to avoid accessing lazy getters outside Suspense boundary.

  const handleSelect = useCallback((id: string) => setActiveId(id), []);

  // Real-time data sync: preview form changes → dataJson update (avoids infinite loop —
  // dataJson edits still require "渲染" to affect preview)
  const handlePreviewDataChange = useCallback((data: Record<string, unknown>) => {
    setDataJson(JSON.stringify(data, null, 2));
    setDataModified(true);
  }, []);

  const handleLangChange = useCallback((newLang: Language) => {
    setLang(newLang);
    window.dispatchEvent(new CustomEvent('previewLanguageChange', { detail: { lang: newLang } }));
  }, []);

  const handleSubmit = useCallback(() => {
    const result: Record<string, unknown> = {};
    if (i18nRef.current) {
      result['支持 i18n'] = i18nRef.current.getData();
    }
    if (plainRef.current) {
      result['不支持 i18n'] = plainRef.current.getData();
    }
    setSubmittedData(result);
  }, []);

  return (
    <div className="showcase-root">
      <Sidebar
        activeId={activeId}
        onSelect={handleSelect}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />
      {sidebarCollapsed && (
        <button className="showcase-sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)} title="展开菜单">
          <span className="expand-icon">▶</span>
        </button>
      )}
      {/* Suspense catches lazy getter throws from Amis page props (jsonSchema, description, component, etc.) */}
      <Suspense fallback={<div className="showcase-loading">Loading page...</div>}>
        <ShowcasePageContent
          page={page}
          lang={lang}
          isAmis={!!isAmis}
          hasMultiLang={!!hasMultiLang}
          schemaJson={schemaJson}
          dataJson={dataJson}
          schemaModified={schemaModified}
          dataModified={dataModified}
          renderedSchemaJson={renderedSchemaJson}
          renderedDataJson={renderedDataJson}
          renderKey={renderKey}
          onRender={handleRender}
          submittedData={submittedData}
          onSetSchemaJson={setSchemaJson}
          onSetDataJson={setDataJson}
          onSetSchemaModified={setSchemaModified}
          onSetDataModified={setDataModified}
          onLangChange={handleLangChange}
          onSubmit={handleSubmit}
          i18nRef={i18nRef}
          plainRef={plainRef}
          onPreviewDataChange={handlePreviewDataChange}
        />
      </Suspense>
    </div>
  );
};

/**
 * Renders a custom component page with editable JSON.
 * - schema-preview: no external JSON editor (has its own internal editor)
 * - pages with jsonData: dual JSON tabs (Schema / Data), preview uses rendered values
 * - other custom pages: single JSON editor, preview uses rendered values
 */
const CustomPageSection: React.FC<{
  page: ReturnType<typeof getShowcasePage>;
  lang: Language;
  schemaJson: string;
  dataJson: string;
  renderedSchemaJson: string;
  renderedDataJson: string;
  schemaModified: boolean;
  dataModified: boolean;
  renderKey: number;
  onRender: () => void;
  onSetSchemaJson: (v: string) => void;
  onSetDataJson: (v: string) => void;
  onSetSchemaModified: (v: boolean) => void;
  onSetDataModified: (v: boolean) => void;
  onPreviewDataChange?: (data: Record<string, unknown>) => void;
}> = ({ page, lang, schemaJson, dataJson, renderedSchemaJson, renderedDataJson, schemaModified, dataModified, renderKey, onRender, onSetSchemaJson, onSetDataJson, onSetSchemaModified, onSetDataModified, onPreviewDataChange }) => {
  const hasDualJson = !!page.jsonData;
  const [activeJsonTab, setActiveJsonTab] = useState<'schema' | 'data'>('schema');

  // Reset tab when page changes
  useEffect(() => { setActiveJsonTab('schema'); }, [page?.id]);

  // schema-preview has its own internal editor — no external JSON section needed
  if (page.id === 'schema-preview') {
    return (
      <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
        <PageRenderer key={renderKey} pageId={page.id} jsonSchema={page.jsonSchema} lang={lang} />
      </Suspense>
    );
  }

  const activeJson = activeJsonTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeJsonTab === 'schema' ? onSetSchemaJson : onSetDataJson;
  const modified = activeJsonTab === 'schema' ? schemaModified : dataModified;
  const setModified = activeJsonTab === 'schema' ? onSetSchemaModified : onSetDataModified;
  const originalText = activeJsonTab === 'schema' ? page.jsonSchema : page.jsonData;
  const label = activeJsonTab === 'schema' ? (hasDualJson ? 'Schema JSON' : 'Schema') : 'Data JSON';

  return (
    <>
      <div className="showcase-section">
        {hasDualJson && (
          <div className="showcase-json-tabs">
            <button
              className={`showcase-json-tab ${activeJsonTab === 'schema' ? 'is-active' : ''}`}
              onClick={() => setActiveJsonTab('schema')}
            >
              Schema JSON
            </button>
            <button
              className={`showcase-json-tab ${activeJsonTab === 'data' ? 'is-active' : ''}`}
              onClick={() => setActiveJsonTab('data')}
            >
              Data JSON
            </button>
          </div>
        )}
        <div className="showcase-json-editor">
          <div className="showcase-json-toolbar">
            <span className="showcase-json-label">{label}</span>
            <span className="showcase-toolbar-spacer" />
            <button className="showcase-json-render-btn" onClick={onRender}>
              渲染
            </button>
            {modified && (
              <button className="showcase-json-reset" onClick={() => { setJson(originalText || ''); setModified(false); }}>
                Reset
              </button>
            )}
          </div>
          <textarea
            className="showcase-json-textarea"
            value={activeJson}
            onChange={(e) => { setJson(e.target.value); setModified(true); }}
            spellCheck={false}
          />
        </div>
      </div>
      <div className="showcase-section">
        <h2 className="showcase-section-title">Live Preview</h2>
        <div className="showcase-preview-container">
          <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
            <PageRenderer key={renderKey} pageId={page.id} jsonSchema={renderedSchemaJson || page.jsonSchema} dataJson={renderedDataJson || page.jsonData || ''} lang={lang} onPreviewDataChange={onPreviewDataChange} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

/**
 * Separated content component — all lazy property accesses (page.jsonSchema,
 * page.description, page.props, etc.) happen here and are caught by the parent Suspense.
 */
const ShowcasePageContent: React.FC<{
  page: ReturnType<typeof getShowcasePage>;
  lang: Language;
  isAmis: boolean;
  hasMultiLang: boolean;
  schemaJson: string;
  dataJson: string;
  renderedSchemaJson: string;
  renderedDataJson: string;
  schemaModified: boolean;
  dataModified: boolean;
  renderKey: number;
  onRender: () => void;
  submittedData: Record<string, unknown> | null;
  onSetSchemaJson: (v: string) => void;
  onSetDataJson: (v: string) => void;
  onSetSchemaModified: (v: boolean) => void;
  onSetDataModified: (v: boolean) => void;
  onLangChange: (lang: Language) => void;
  onSubmit: () => void;
  i18nRef: React.RefObject<AmisLivePreviewRef>;
  plainRef: React.RefObject<AmisLivePreviewRef>;
  onPreviewDataChange?: (data: Record<string, unknown>) => void;
}> = (props) => {
  const {
    page, lang, isAmis, hasMultiLang,
    schemaJson, dataJson, renderedSchemaJson, renderedDataJson,
    schemaModified, dataModified, renderKey, onRender, submittedData,
    onSetSchemaJson, onSetDataJson, onSetSchemaModified, onSetDataModified,
    onLangChange, onSubmit, i18nRef, plainRef, onPreviewDataChange,
  } = props;

  // Reset editable JSON when switching pages — inside Suspense so lazy getters are safe
  useEffect(() => {
    if (!page) return;
    // Force-trigger lazy getters here so Suspense catches any pending loads
    const _schema = hasMultiLang ? (page.jsonSchemaI18n ?? page.jsonSchema) : page.jsonSchema;
    const _data = hasMultiLang ? (page.dataI18n ?? page.data ?? '') : (page.jsonData ?? page.data ?? '');
    onSetSchemaJson(_schema);
    onSetDataJson(_data);
    onSetSchemaModified(false);
    onSetDataModified(false);
    // Sync rendered with original on page switch
    onRender();
  }, [page?.id]);

  return (
    <div className="showcase-content">
      <div className="showcase-lang-bar">
        <div className="showcase-lang-bar-inner">
          <span className="showcase-lang-label">Language:</span>
          <select value={lang} onChange={e => onLangChange(e.target.value as Language)}>
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {isAmis && (
            <button className="showcase-submit-btn" onClick={onSubmit}>
              提交表单
            </button>
          )}
        </div>
      </div>

      <div className="showcase-header">
        <div className="showcase-header-left">
          <h1 className="showcase-page-title">{page?.title || 'Select a Component'}</h1>
          {page && <p className="showcase-page-desc">{page.description}</p>}
        </div>
      </div>

      {page && (
        <>
          {page.props && (
            <div className="showcase-section">
              <h2 className="showcase-section-title">Props / 参数说明</h2>
              <div className="showcase-props-block" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.props) }} />
            </div>
          )}
          {isAmis ? (
            <>
              {hasMultiLang ? (
                <>
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">JSON Configuration — 支持 i18n</h2>
                    <div className="showcase-json-editor">
                      <div className="showcase-json-toolbar">
                        <span className="showcase-json-label">Schema (i18n)</span>
                        <span className="showcase-toolbar-spacer" />
                        <button className="showcase-json-render-btn" onClick={onRender}>
                          渲染
                        </button>
                        {schemaModified && (
                          <button className="showcase-json-reset" onClick={() => { onSetSchemaJson(page.jsonSchemaI18n ?? page.jsonSchema); onSetSchemaModified(false); }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <textarea
                        className="showcase-json-textarea"
                        value={schemaJson}
                        onChange={(e) => { onSetSchemaJson(e.target.value); onSetSchemaModified(true); }}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  {page.dataI18n && (
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">测试内容 JSON — 支持 i18n</h2>
                      <div className="showcase-json-editor">
                        <div className="showcase-json-toolbar">
                          <span className="showcase-json-label">Data (i18n)</span>
                          <span className="showcase-toolbar-spacer" />
                          <button className="showcase-json-render-btn" onClick={onRender}>
                            渲染
                          </button>
                          {dataModified && (
                            <button className="showcase-json-reset" onClick={() => { onSetDataJson(page.dataI18n || ''); onSetDataModified(false); }}>
                              Reset
                            </button>
                          )}
                        </div>
                        <textarea
                          className="showcase-json-textarea"
                          value={dataJson}
                          onChange={(e) => { onSetDataJson(e.target.value); onSetDataModified(true); }}
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">Live Preview — 支持 i18n</h2>
                    <div className="showcase-preview-container">
                      <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                        <PageRenderer key={`i18n-${page.id}-${renderKey}`} pageId={page.id} jsonSchema={renderedSchemaJson || (page.jsonSchemaI18n ?? page.jsonSchema)} dataJson={renderedDataJson || page.dataI18n || ''} lang={lang} ref={i18nRef} label="实时预览 — 可编辑表单字段" />
                      </Suspense>
                    </div>
                  </div>

                  <div className="showcase-section">
                    <h2 className="showcase-section-title">JSON Configuration — 不支持 i18n</h2>
                    <div className="showcase-json-editor">
                      <div className="showcase-json-toolbar">
                        <span className="showcase-json-label">Schema (plain)</span>
                        <span className="showcase-toolbar-spacer" />
                        <button className="showcase-json-render-btn" onClick={onRender}>
                          渲染
                        </button>
                        {schemaModified && (
                          <button className="showcase-json-reset" onClick={() => { onSetSchemaJson(page.jsonSchema); onSetSchemaModified(false); }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <textarea
                        className="showcase-json-textarea"
                        value={schemaJson}
                        onChange={(e) => { onSetSchemaJson(e.target.value); onSetSchemaModified(true); }}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  {page.data && (
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">测试内容 JSON — 不支持 i18n</h2>
                      <div className="showcase-json-editor">
                        <div className="showcase-json-toolbar">
                          <span className="showcase-json-label">Data (plain)</span>
                          <span className="showcase-toolbar-spacer" />
                          <button className="showcase-json-render-btn" onClick={onRender}>
                            渲染
                          </button>
                          {dataModified && (
                            <button className="showcase-json-reset" onClick={() => { onSetDataJson(page.data || ''); onSetDataModified(false); }}>
                              Reset
                            </button>
                          )}
                        </div>
                        <textarea
                          className="showcase-json-textarea"
                          value={dataJson}
                          onChange={(e) => { onSetDataJson(e.target.value); onSetDataModified(true); }}
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">Live Preview — 不支持 i18n</h2>
                    <div className="showcase-preview-container">
                      <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                        <PageRenderer key={`plain-${page.id}-${renderKey}`} pageId={page.id} jsonSchema={renderedSchemaJson || page.jsonSchema} dataJson={renderedDataJson || page.data || ''} lang="zh" ref={plainRef} label="实时预览（固定中文）" />
                      </Suspense>
                    </div>
                  </div>

                  {submittedData && (
                    <div className="showcase-section showcase-submitted-section">
                      <h2 className="showcase-section-title">提交的数据</h2>
                      <pre className="showcase-json-block showcase-submitted-data">{JSON.stringify(submittedData, null, 2)}</pre>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">JSON Configuration</h2>
                    <div className="showcase-json-editor">
                      <div className="showcase-json-toolbar">
                        <span className="showcase-json-label">Schema</span>
                        <span className="showcase-toolbar-spacer" />
                        <button className="showcase-json-render-btn" onClick={onRender}>
                          渲染
                        </button>
                        {schemaModified && (
                          <button className="showcase-json-reset" onClick={() => { onSetSchemaJson(page.jsonSchema); onSetSchemaModified(false); }}>
                            Reset
                          </button>
                        )}
                      </div>
                      <textarea
                        className="showcase-json-textarea"
                        value={schemaJson}
                        onChange={(e) => { onSetSchemaJson(e.target.value); onSetSchemaModified(true); }}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">Live Preview</h2>
                    <div className="showcase-preview-container">
                      <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                        <PageRenderer key={`amis-${page.id}-${renderKey}`} pageId={page.id} jsonSchema={renderedSchemaJson || page.jsonSchema} dataJson={renderedDataJson || page.data || ''} lang={lang} ref={i18nRef} label="实时预览" />
                      </Suspense>
                    </div>
                  </div>
                  {submittedData && (
                    <div className="showcase-section showcase-submitted-section">
                      <h2 className="showcase-section-title">提交的数据</h2>
                      <pre className="showcase-json-block showcase-submitted-data">{JSON.stringify(submittedData, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <CustomPageSection
              page={page}
              lang={lang}
              schemaJson={schemaJson}
              dataJson={dataJson}
              renderedSchemaJson={renderedSchemaJson}
              renderedDataJson={renderedDataJson}
              schemaModified={schemaModified}
              dataModified={dataModified}
              renderKey={renderKey}
              onRender={onRender}
              onSetSchemaJson={onSetSchemaJson}
              onSetDataJson={onSetDataJson}
              onSetSchemaModified={onSetSchemaModified}
              onSetDataModified={onSetDataModified}
              onPreviewDataChange={onPreviewDataChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ShowcaseApp;
