import React, { useState, useCallback } from 'react';

export interface AIGeneratorResult {
  schema: string | null;
  data: string | null;
  error?: string;
}

interface AIGeneratorDrawerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (result: AIGeneratorResult) => void;
  currentSchema: string;
  currentData: string;
}

const COLORS = {
  primary: '#4A5CBF',
  primaryHover: '#3d4fb0',
  success: '#52c41a',
  danger: '#E84545',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textPlaceholder: '#9CA3AF',
  textLabel: '#2D3348',
  divider: '#E8E8E8',
  inputBorder: '#D9DDE6',
  inputBorderFocus: '#4A5CBF',
  cardBg: '#FFFFFF',
  formBg: '#F8F9FC',
};

const styles = {
  backdrop: {
    position: 'fixed' as const,
    inset: '0',
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  drawer: (visible: boolean): React.CSSProperties => ({
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: 520,
    maxWidth: '90vw',
    background: COLORS.cardBg,
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.12)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: `1px solid ${COLORS.divider}`,
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    fontSize: 20,
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: 4,
  },
  body: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: 20,
  },
  section: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: COLORS.textLabel,
    marginBottom: 8,
  },
  textarea: (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${COLORS.inputBorder}`,
    borderRadius: 6,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    color: disabled ? COLORS.textSecondary : COLORS.textPrimary,
    background: disabled ? COLORS.formBg : COLORS.cardBg,
    lineHeight: 1.5,
    minHeight: 120,
    boxSizing: 'border-box' as const,
  }),
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '12px 16px',
    background: '#fff5f5',
    border: `1px solid #fecaca`,
    borderRadius: 6,
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: 16,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 24,
    justifyContent: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  spinner: {
    width: 20,
    height: 20,
    border: '2px solid #e0e0e0',
    borderTopColor: COLORS.primary,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  resultBlock: { marginBottom: 12 },
  resultLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  resultCode: {
    background: COLORS.formBg,
    border: `1px solid ${COLORS.divider}`,
    borderRadius: 6,
    padding: 12,
    fontSize: 12,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    color: COLORS.textPrimary,
    maxHeight: 200,
    overflow: 'auto',
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '16px 20px',
    borderTop: `1px solid ${COLORS.divider}`,
  },
  btn: (variant: 'cancel' | 'generate' | 'reset' | 'apply', disabled: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '8px 20px',
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      border: 'none',
      opacity: disabled ? 0.5 : 1,
    };
    switch (variant) {
      case 'cancel': return { ...base, background: COLORS.formBg, color: COLORS.textSecondary, border: `1px solid ${COLORS.divider}` };
      case 'generate': return { ...base, background: COLORS.primary, color: '#fff' };
      case 'reset': return { ...base, background: '#fff', color: COLORS.primary, border: `1px solid ${COLORS.primary}` };
      case 'apply': return { ...base, background: COLORS.success, color: '#fff' };
    }
  },
  suggestionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  suggestionChips: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 8,
  },
  suggestionChip: (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: 12,
    color: active ? COLORS.primary : COLORS.textSecondary,
    background: active ? COLORS.formBg : COLORS.cardBg,
    border: `1px solid ${active ? COLORS.inputBorderFocus : COLORS.inputBorder}`,
    borderRadius: 16,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  }),
};

/**
 * Default prompt suggestions shown when the drawer is opened with empty input.
 */
const DEFAULT_PROMPTS = [
  '创建新页面，使用amis-table-search组件，内容是酒店信息，设置酒店名称与code的检索',
  '在当前表单增加一个日期选择器和下拉选择框',
];

export const AIGeneratorDrawer: React.FC<AIGeneratorDrawerProps> = ({
  visible,
  onClose,
  onApply,
  currentSchema,
  currentData,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          currentSchema,
          currentData,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        setErrorMsg(`API 错误: ${errBody.error || res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json() as AIGeneratorResult;

      if (data.error) {
        setErrorMsg(data.error);
        setLoading(false);
        return;
      }

      // Validate JSON before showing result
      let schemaValid = true;
      let dataValid = true;
      if (data.schema) {
        try { JSON.parse(data.schema); } catch { schemaValid = false; }
      }
      if (data.data) {
        try { JSON.parse(data.data); } catch { dataValid = false; }
      }

      if (!schemaValid || !dataValid) {
        setErrorMsg('生成结果包含无效 JSON，请重试');
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setErrorMsg(`请求失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [prompt, currentSchema, currentData]);

  const handleApply = useCallback(() => {
    if (result) {
      onApply(result);
    }
  }, [result, onApply]);

  const handleReset = useCallback(() => {
    setResult(null);
    setErrorMsg(null);
    setPrompt('');
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div data-testid="ai-drawer-backdrop" style={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <div data-testid="ai-drawer" style={styles.drawer(true)}>
        <div style={styles.header}>
          <h3 style={styles.title}>AI 生成</h3>
          <button data-testid="ai-drawer-close" style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>
          {/* Input section */}
          <div style={styles.section}>
            <label style={styles.label}>描述你的修改需求</label>
            <textarea
              data-testid="ai-drawer-prompt"
              style={styles.textarea(loading || !!result)}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入你的修改需求或点击下方快捷示例..."
              disabled={loading || !!result}
              rows={6}
            />
            {!prompt && !loading && !result && (
              <div style={{ marginTop: 12 }}>
                <div style={styles.suggestionLabel}>快捷示例：</div>
                <div style={styles.suggestionChips}>
                  {DEFAULT_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      style={styles.suggestionChip(false)}
                      onClick={() => setPrompt(p)}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorderFocus; (e.target as HTMLElement).style.color = COLORS.primary; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorder; (e.target as HTMLElement).style.color = COLORS.textSecondary; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error display */}
          {errorMsg && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
              {errorMsg}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <span>AI 正在生成中，请稍候...</span>
            </div>
          )}

          {/* Result preview */}
          {result && !loading && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary, margin: '0 0 12px 0' }}>
                生成结果预览
              </h4>
              {result.schema && (
                <div style={styles.resultBlock}>
                  <div style={styles.resultLabel}>Schema JSON</div>
                  <pre style={styles.resultCode}>
                    {result.schema.length > 500
                      ? result.schema.slice(0, 500) + '...'
                      : result.schema}
                  </pre>
                </div>
              )}
              {result.data && (
                <div style={styles.resultBlock}>
                  <div style={styles.resultLabel}>Data JSON</div>
                  <pre style={styles.resultCode}>
                    {result.data.length > 500
                      ? result.data.slice(0, 500) + '...'
                      : result.data}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={styles.footer}>
          {result && !loading ? (
            <>
              <button data-testid="ai-drawer-reset-btn" style={styles.btn('reset', false)} onClick={handleReset}>
                重新生成
              </button>
              <button data-testid="ai-drawer-apply-btn" style={styles.btn('apply', false)} onClick={handleApply}>
                应用到编辑器
              </button>
            </>
          ) : (
            <>
              <button style={styles.btn('cancel', loading)} onClick={onClose} disabled={loading}>
                取消
              </button>
              <button
                data-testid="ai-drawer-generate-btn"
                style={styles.btn('generate', loading || !prompt.trim())}
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
              >
                {loading ? '生成中...' : '生成'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AIGeneratorDrawer;
