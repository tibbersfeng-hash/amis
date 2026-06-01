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
  'combo-tab': React.lazy(() => import('./ComboShowcase')),
};

/**
 * Wrapper that renders the correct component based on page type.
 * Custom components use lazy-loaded modules; Amis components use AmisLivePreview directly.
 */
const PageRenderer = React.forwardRef<AmisLivePreviewRef, { pageId: string; jsonSchema: string; dataJson?: string; lang?: Language; label?: string }>(
  ({ pageId, jsonSchema, dataJson, lang = 'zh', label }, ref) => {
    if (lazyComponents[pageId]) {
      const CustomComponent = lazyComponents[pageId];
      return <CustomComponent schema={JSON.parse(jsonSchema)} />;
    }
    const schema = JSON.parse(jsonSchema);
    const data = dataJson ? JSON.parse(dataJson) : {};
    return <AmisLivePreview schema={schema} data={data} lang={lang} label={label} ref={ref} />;
  }
);
PageRenderer.displayName = 'PageRenderer';

/**
 * Renders dual-JSON config section with tab switching (Schema JSON / Data JSON)
 * followed by the live preview component.
 */
const DualJsonSection: React.FC<{ page: ReturnType<typeof getShowcasePage>; lang: Language }> = ({ page, lang }) => {
  const [activeJsonTab, setActiveJsonTab] = useState<'schema' | 'data'>('schema');
  const [schemaText, setSchemaText] = useState(page?.jsonSchema || '');
  const [dataText, setDataText] = useState(page?.jsonData || '');
  const [schemaModified, setSchemaModified] = useState(false);
  const [dataModified, setDataModified] = useState(false);

  // Reset when page changes
  React.useEffect(() => {
    setSchemaText(page?.jsonSchema || '');
    setDataText(page?.jsonData || '');
    setSchemaModified(false);
    setDataModified(false);
  }, [page?.id, page?.jsonSchema, page?.jsonData]);

  const activeJson = activeJsonTab === 'schema' ? schemaText : dataText;
  const setJson = activeJsonTab === 'schema' ? setSchemaText : setDataText;
  const modified = activeJsonTab === 'schema' ? schemaModified : dataModified;
  const setModified = activeJsonTab === 'schema' ? setSchemaModified : setDataModified;
  const originalText = activeJsonTab === 'schema' ? page?.jsonSchema : page?.jsonData;
  const label = activeJsonTab === 'schema' ? 'Schema JSON' : 'Data JSON';

  return (
    <>
      <div className="showcase-section">
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
        <div className="showcase-json-editor">
          <div className="showcase-json-toolbar">
            <span className="showcase-json-label">{label}</span>
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
            <PageRenderer pageId={page!.id} jsonSchema={page!.jsonSchema} dataJson={page!.jsonData} lang={lang} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

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
          submittedData={submittedData}
          onSetSchemaJson={setSchemaJson}
          onSetDataJson={setDataJson}
          onSetSchemaModified={setSchemaModified}
          onSetDataModified={setDataModified}
          onLangChange={handleLangChange}
          onSubmit={handleSubmit}
          i18nRef={i18nRef}
          plainRef={plainRef}
        />
      </Suspense>
    </div>
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
  schemaModified: boolean;
  dataModified: boolean;
  submittedData: Record<string, unknown> | null;
  onSetSchemaJson: (v: string) => void;
  onSetDataJson: (v: string) => void;
  onSetSchemaModified: (v: boolean) => void;
  onSetDataModified: (v: boolean) => void;
  onLangChange: (lang: Language) => void;
  onSubmit: () => void;
  i18nRef: React.RefObject<AmisLivePreviewRef>;
  plainRef: React.RefObject<AmisLivePreviewRef>;
}> = (props) => {
  const {
    page, lang, isAmis, hasMultiLang,
    schemaJson, dataJson, schemaModified, dataModified, submittedData,
    onSetSchemaJson, onSetDataJson, onSetSchemaModified, onSetDataModified,
    onLangChange, onSubmit, i18nRef, plainRef,
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
                        <PageRenderer key={`i18n-${page.id}`} pageId={page.id} jsonSchema={page.jsonSchemaI18n ?? page.jsonSchema} dataJson={page.dataI18n} lang={lang} ref={i18nRef} label="实时预览 — 可编辑表单字段" />
                      </Suspense>
                    </div>
                  </div>

                  <div className="showcase-section">
                    <h2 className="showcase-section-title">JSON Configuration — 不支持 i18n</h2>
                    <div className="showcase-json-editor">
                      <div className="showcase-json-toolbar">
                        <span className="showcase-json-label">Schema (plain)</span>
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
                        <PageRenderer key={`plain-${page.id}`} pageId={page.id} jsonSchema={page.jsonSchema} dataJson={page.data} lang="zh" ref={plainRef} label="实时预览（固定中文）" />
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
                        <PageRenderer key={`amis-${page.id}`} pageId={page.id} jsonSchema={page.jsonSchema} dataJson={page.data} lang={lang} ref={i18nRef} label="实时预览" />
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
            <>
              {page.id === 'schema-preview' ? (
                <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                  <PageRenderer pageId={page.id} jsonSchema={page.jsonSchema} lang={lang} />
                </Suspense>
              ) : page.jsonData ? (
                <DualJsonSection page={page} lang={lang} />
              ) : (
                <>
                  <div className="showcase-section">
                    <h2 className="showcase-section-title">JSON Configuration</h2>
                    <div className="showcase-json-editor">
                      <div className="showcase-json-toolbar">
                        <span className="showcase-json-label">Schema</span>
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
                        <PageRenderer pageId={page.id} jsonSchema={page.jsonSchema} dataJson={page.data} lang={lang} />
                      </Suspense>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ShowcaseApp;
