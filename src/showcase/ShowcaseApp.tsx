import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { getShowcasePage, showcasePages } from './data';
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
 * Lazily loaded custom showcase components — created once to preserve lazy() cache.
 */
const LazyCustomComponents: Record<string, React.LazyExoticComponent<React.FC>> = {};

const customImports: Record<string, () => Promise<{ default: React.FC }>> = {
  'schema-preview': () => import('./SchemaPreview'),
  'i18n-config': () => import('../components/i18n-config/showcase'),
  'sticky-footer': () => import('../components/StickyFooter/showcase'),
  'loading': () => import('../components/Loading/showcase'),
  'language-switcher': () => import('../components/LanguageSwitcher/showcase'),
  'i18n-config-panel': () => import('../components/I18nConfigPanel/showcase'),
  'phone-mockup': () => import('../components/PhoneMockup/showcase'),
  'date-range-picker': () => import('../components/DateRangePicker/showcase'),
  'preview-panel': () => import('../components/PreviewPanel/showcase'),
  'amis-drawer': () => import('../components/DrawerShowcase'),
  'solid-fill-tabs': () => import('./SolidFillTabsShowcase'),
  'closable-tabs': () => import('./ClosableTabsShowcase'),
  'combo-tab': () => import('./ComboShowcase'),
};

for (const [id, importFn] of Object.entries(customImports)) {
  LazyCustomComponents[id] = React.lazy(importFn);
}

/**
 * Wrapper that renders the correct component based on page type.
 * Custom components use lazy-loaded modules; Amis components use AmisLivePreview directly.
 */
const PageRenderer = React.forwardRef<AmisLivePreviewRef, { pageId: string; jsonSchema: string; dataJson?: string; lang?: Language; label?: string }>(
  ({ pageId, jsonSchema, dataJson, lang = 'zh', label }, ref) => {
    if (LazyCustomComponents[pageId]) {
      const CustomComponent = LazyCustomComponents[pageId];
      return <CustomComponent schema={JSON.parse(jsonSchema)} />;
    }
    const schema = JSON.parse(jsonSchema);
    const data = dataJson ? JSON.parse(dataJson) : {};
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
  const i18nRef = useRef<AmisLivePreviewRef>(null);
  const plainRef = useRef<AmisLivePreviewRef>(null);

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

  const page = getShowcasePage(activeId);
  const isAmis = page && !LazyCustomComponents[page.id];
  const hasMultiLang = isAmis && page?.category === '表单输入';

  return (
    <div className="showcase-root">
      <Sidebar activeId={activeId} onSelect={handleSelect} />
      <div className="showcase-content">
        {/* Sticky language bar */}
        <div className="showcase-lang-bar">
          <div className="showcase-lang-bar-inner">
            <span className="showcase-lang-label">Language:</span>
            <select value={lang} onChange={e => handleLangChange(e.target.value as Language)}>
              {LANGUAGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {isAmis && (
              <button className="showcase-submit-btn" onClick={handleSubmit}>
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
            {/* Props/Parameters section — rendered for all components */}
            {page.props && (
              <div className="showcase-section">
                <h2 className="showcase-section-title">Props / 参数说明</h2>
                <div className="showcase-props-block" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.props) }} />
              </div>
            )}

            {isAmis ? (
              <>
                {hasMultiLang ? (
                  // === 表单输入: show 4 JSON blocks (i18n + plain) ===
                  <>
                    {/* === 支持 i18n === */}
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">JSON Configuration — 支持 i18n</h2>
                      <pre className="showcase-json-block">{page.jsonSchemaI18n ?? page.jsonSchema}</pre>
                    </div>
                    {page.dataI18n && (
                      <div className="showcase-section">
                        <h2 className="showcase-section-title">测试内容 JSON — 支持 i18n</h2>
                        <pre className="showcase-json-block">{page.dataI18n}</pre>
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

                    {/* === 不支持 i18n === */}
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">JSON Configuration — 不支持 i18n</h2>
                      <pre className="showcase-json-block">{page.jsonSchema}</pre>
                    </div>
                    {page.data && (
                      <div className="showcase-section">
                        <h2 className="showcase-section-title">测试内容 JSON — 不支持 i18n</h2>
                        <pre className="showcase-json-block">{page.data}</pre>
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

                    {/* Submitted Data Display */}
                    {submittedData && (
                      <div className="showcase-section showcase-submitted-section">
                        <h2 className="showcase-section-title">提交的数据</h2>
                        <pre className="showcase-json-block showcase-submitted-data">{JSON.stringify(submittedData, null, 2)}</pre>
                      </div>
                    )}
                  </>
                ) : (
                  // === Other Amis components: single JSON block + single preview ===
                  <>
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">JSON Configuration</h2>
                      <pre className="showcase-json-block">{page.jsonSchema}</pre>
                    </div>
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">Live Preview</h2>
                      <div className="showcase-preview-container">
                        <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                          <PageRenderer key={`amis-${page.id}`} pageId={page.id} jsonSchema={page.jsonSchema} dataJson={page.data} lang={lang} ref={i18nRef} label="实时预览" />
                        </Suspense>
                      </div>
                    </div>
                    {/* Submitted Data Display */}
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
              // === Custom component: renders its own content ===
              <>
                {page.id === 'schema-preview' ? (
                  // SchemaPreview renders its own full-width layout (no container wrapper)
                  <Suspense fallback={<div className="showcase-loading">Loading preview...</div>}>
                    <PageRenderer pageId={page.id} jsonSchema={page.jsonSchema} lang={lang} />
                  </Suspense>
                ) : (
                  <>
                    <div className="showcase-section">
                      <h2 className="showcase-section-title">JSON Configuration</h2>
                      <pre className="showcase-json-block">{page.jsonSchema}</pre>
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
    </div>
  );
};

export default ShowcaseApp;
