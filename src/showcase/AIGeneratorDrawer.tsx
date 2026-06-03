import React, { useState, useCallback, useRef } from 'react';
import type { ComponentCatalogEntry } from './data';

/**
 * Generate a simple UUID v4 (no external dependency needed).
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface AIGeneratorResult {
  schema: string | null;
  data: string | null;
  error?: string;
  sessionId?: string;
  rawText?: string;  // Claude's raw output for display
}

/**
 * Represents an uploaded image ready to be sent with the AI generation request.
 * Mirrors cc-connect's ImageAttachment: MimeType + base64 Data.
 */
export interface UploadedImage {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;     // full data URL for preview (img src)
  base64: string;      // raw base64 (no prefix) for API payload
}

interface AIGeneratorDrawerProps {
  visible: boolean;
  onClose: () => void;
  onApply: (result: AIGeneratorResult) => void;
  currentSchema: string;
  currentData: string;
  componentCatalog?: ComponentCatalogEntry[];
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
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: COLORS.formBg,
    borderRadius: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  sessionId: {
    fontFamily: "'SFMono-Regular', Consolas, monospace",
    fontSize: 11,
    color: COLORS.textPlaceholder,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  sessionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    background: '#e8f0fe',
    color: COLORS.primary,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  resetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 10px',
    fontSize: 11,
    color: COLORS.danger,
    background: 'transparent',
    border: `1px solid ${COLORS.danger}`,
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  },
  // Image upload styles
  imageUploadArea: (isDragOver: boolean): React.CSSProperties => ({
    border: `2px dashed ${isDragOver ? COLORS.inputBorderFocus : COLORS.inputBorder}`,
    borderRadius: 6,
    padding: 16,
    textAlign: 'center',
    background: isDragOver ? 'rgba(74, 92, 191, 0.04)' : COLORS.formBg,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: 12,
  }),
  imageUploadIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: COLORS.textPlaceholder,
  },
  imageUploadText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  imageUploadHint: {
    fontSize: 11,
    color: COLORS.textPlaceholder,
    marginTop: 4,
  },
  imageThumbWrap: {
    position: 'relative' as const,
    display: 'inline-flex',
    margin: '4px 8px 4px 0',
    borderRadius: 6,
    overflow: 'hidden',
    border: `1px solid ${COLORS.divider}`,
  },
  imageThumb: {
    width: 64,
    height: 64,
    objectFit: 'cover' as const,
  },
  imageRemoveBtn: {
    position: 'absolute' as const,
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
  },
  imagePreviewRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
    marginBottom: 12,
  },
  rawOutputToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    fontSize: 12,
    color: COLORS.textSecondary,
    background: 'transparent',
    border: `1px solid ${COLORS.divider}`,
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: 12,
  },
  rawOutputBlock: {
    background: COLORS.formBg,
    border: `1px solid ${COLORS.divider}`,
    borderRadius: 6,
    padding: 12,
    fontSize: 12,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    color: COLORS.textPrimary,
    maxHeight: 300,
    overflow: 'auto',
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    marginBottom: 12,
    lineHeight: 1.6,
  },
};

/**
 * Default prompt suggestions shown when the drawer is opened with empty input.
 */
const DEFAULT_PROMPTS = [
  '创建新页面，使用amis-table-search组件，内容是酒店信息，设置酒店名称与code的检索',
  '在当前表单增加一个日期选择器和下拉选择框',
];

const STORAGE_KEY = 'ai-prompt-history';

/**
 * Load prompt history from sessionStorage.
 */
function loadPromptHistory(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as string[];
    }
  } catch { /* ignore */ }
  return [];
}

/**
 * Save a prompt to history in sessionStorage.
 * Deduplicates and keeps most recent 10.
 */
function savePromptToHistory(prompt: string): void {
  const trimmed = prompt.trim();
  if (!trimmed) return;

  try {
    const history = loadPromptHistory();
    // Remove duplicate if exists, then prepend
    const deduped = history.filter(p => p !== trimmed);
    const updated = [trimmed, ...deduped].slice(0, 10);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Detect MIME type from file magic bytes (supports PNG, JPEG, GIF, WebP).
 */
function detectImageMimeType(data: ArrayBuffer): string | null {
  const bytes = new Uint8Array(data);
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'image/jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
  // WebP: "RIFF....WEBP"
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'image/webp';
  return null;
}

/**
 * Read a File into a UploadedImage (data URL for preview + raw base64 for API).
 */
function fileToUploadedImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract raw base64 from data URL
      const match = result.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = match?.[1] || file.type || 'image/png';
      const base64 = match?.[2] || result.split(',')[1] || '';

      resolve({
        id: generateUUID(),
        fileName: file.name,
        mimeType,
        dataUrl: result,
        base64,
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export const AIGeneratorDrawer: React.FC<AIGeneratorDrawerProps> = ({
  visible,
  onClose,
  onApply,
  currentSchema,
  currentData,
  componentCatalog,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGeneratorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Lazy session: null until first successful response from backend.
  // Backend generates sessionId on first call, returns it in response.
  // Subsequent calls carry the same sessionId for conversation continuity.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [showRawOutput, setShowRawOutput] = useState(false);

  // Image upload state
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load prompt history on mount
  const [promptHistory, setPromptHistory] = useState<string[]>(() => loadPromptHistory());

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    // Save to history
    savePromptToHistory(prompt);
    setPromptHistory(loadPromptHistory());

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // Build request body: include images as base64 (mirroring cc-connect's ImageAttachment)
      const body: Record<string, unknown> = {
        prompt: prompt.trim(),
        currentSchema,
        currentData,
        sessionId: sessionId || undefined,
        componentCatalog: componentCatalog || undefined,
      };

      if (images.length > 0) {
        body.images = images.map(img => ({
          mimeType: img.mimeType,
          data: img.base64,
          fileName: img.fileName,
        }));
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        setErrorMsg(`API 错误: ${errBody.error || res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json() as AIGeneratorResult & { sessionId?: string };

      if (data.error) {
        setErrorMsg(data.error);
        setLoading(false);
        return;
      }

      // Capture sessionId from backend response on first call
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
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
      // Update session info from response
      if (data.sessionId) {
        setTurnCount(prev => prev + 1);
      }
    } catch (err) {
      setErrorMsg(`请求失败: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [prompt, currentSchema, currentData, sessionId, images, componentCatalog]);

  /**
   * Handle file selection from the file input.
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const newImages: UploadedImage[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMsg(`文件 ${file.name} 超过 5MB 限制`);
        continue;
      }
      try {
        const img = await fileToUploadedImage(file);
        newImages.push(img);
      } catch {
        setErrorMsg(`无法读取文件 ${file.name}`);
      }
    }
    setImages(prev => {
      const combined = [...prev, ...newImages];
      return combined.slice(0, MAX_IMAGES);
    });
  }, []);

  /**
   * Handle file input change.
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleFiles(files);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, [handleFiles]);

  /**
   * Handle drag events.
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < MAX_IMAGES) setIsDragOver(true);
  }, [images.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /**
   * Remove an uploaded image.
   */
  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleApply = useCallback(() => {
    if (result) {
      onApply(result);
    }
  }, [result, onApply]);

  /**
   * Clear only the result and prompt, keep session for refinement.
   * Used by "重新生成" button in footer.
   */
  const handleNewResult = useCallback(() => {
    setResult(null);
    setErrorMsg(null);
    setPrompt('');
    setImages([]);
  }, []);

  /**
   * Full reset: clear result, prompt, images, AND session.
   * Used by "重置" button in session info bar.
   */
  const handleReset = useCallback(() => {
    setResult(null);
    setErrorMsg(null);
    setPrompt('');
    setSessionId(null);
    setTurnCount(0);
    setImages([]);
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
          {/* Session info bar */}
          <div style={styles.sessionInfo}>
            <span style={styles.sessionBadge}>
              💬 {turnCount} 轮
            </span>
            <span style={styles.sessionId} title={sessionId || '等待首次生成'}>
              {sessionId
                ? `${sessionId.slice(0, 8)}…${sessionId.slice(-4)}`
                : '首次生成后分配'}
            </span>
            <button
              data-testid="ai-drawer-reset-session"
              style={styles.resetBtn}
              onClick={handleReset}
              title="重置会话，开始新的对话"
            >
              ↻ 重置
            </button>
          </div>

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

            {/* Image upload area */}
            {!result && (
              <>
                {/* Uploaded image thumbnails */}
                {images.length > 0 && (
                  <div style={styles.imagePreviewRow}>
                    {images.map(img => (
                      <div key={img.id} style={styles.imageThumbWrap}>
                        <img src={img.dataUrl} alt={img.fileName} style={styles.imageThumb} />
                        <button
                          style={styles.imageRemoveBtn}
                          onClick={() => removeImage(img.id)}
                          title="移除图片"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drag & drop / file picker area */}
                {images.length < MAX_IMAGES && (
                  <div
                    style={styles.imageUploadArea(isDragOver)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div style={styles.imageUploadIcon}>📎</div>
                    <div style={styles.imageUploadText}>
                      {images.length > 0 ? '继续添加图片' : '添加参考图片（可选）'}
                    </div>
                    <div style={styles.imageUploadHint}>
                      拖拽或点击上传 · 支持 PNG/JPG/WebP · 单张最大 5MB · 最多 {MAX_IMAGES} 张
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </>
            )}

            {!prompt && !loading && !result && images.length === 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={styles.suggestionLabel}>快捷示例：</div>
                <div style={styles.suggestionChips}>
                  {DEFAULT_PROMPTS.map((p, i) => (
                    <button
                      key={`default-${i}`}
                      style={styles.suggestionChip(false)}
                      onClick={() => setPrompt(p)}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorderFocus; (e.target as HTMLElement).style.color = COLORS.primary; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorder; (e.target as HTMLElement).style.color = COLORS.textSecondary; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {promptHistory.length > 0 && (
                  <>
                    <div style={{ ...styles.suggestionLabel, marginTop: 12 }}>历史记录：</div>
                    <div style={styles.suggestionChips}>
                      {promptHistory.map((p, i) => (
                        <button
                          key={`history-${i}`}
                          style={styles.suggestionChip(false)}
                          onClick={() => setPrompt(p)}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorderFocus; (e.target as HTMLElement).style.color = COLORS.primary; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = COLORS.inputBorder; (e.target as HTMLElement).style.color = COLORS.textSecondary; }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
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

              {/* Claude raw output toggle */}
              {result.rawText && (
                <button
                  style={styles.rawOutputToggle}
                  onClick={() => setShowRawOutput(prev => !prev)}
                >
                  {showRawOutput ? '▾' : '▸'} Claude 原始输出
                </button>
              )}

              {showRawOutput && result.rawText && (
                <pre style={styles.rawOutputBlock}>{result.rawText}</pre>
              )}

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
              <button data-testid="ai-drawer-reset-btn" style={styles.btn('reset', false)} onClick={handleNewResult}>
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
