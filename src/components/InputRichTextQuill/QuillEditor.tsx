import React from 'react';
import type { FormControlProps } from 'amis-core';
import { FormItem } from 'amis-core';
import './styles.less';

// Dynamic import for react-quill — Vite uses ESM, so we can't use require()
// We load it at module init time but guard with typeof document check
let ReactQuillModule: any = null;
let QuillModule: any = null;

if (typeof document !== 'undefined') {
  // Lazy load — will be available after the dynamic import resolves
  import('react-quill').then((mod) => {
    ReactQuillModule = mod.default;
    // Re-render any mounted instances once loaded
    window.dispatchEvent(new Event('quill-loaded'));
  });
}

const sizeArr = ['12px', '14px', '16px', '18px', '20px', '24px', '32px'];

const MAX_LENGTH = 5000;

interface InputRichTextQuillProps extends FormControlProps {
  maxLength?: number;
  /** Upload endpoint for images, e.g. "/api/upload" */
  receiver?: string;
}

interface InputRichTextQuillState {
  activeTab: 'editor' | 'html';
  quillReady: boolean;
  ReactQuill: any;
  Quill: any;
}

/**
 * Image upload handler for Quill editor.
 * Opens a file picker, uploads to the configured receiver URL,
 * and inserts the returned image URL into the editor.
 */
function createImageHandler(quill: any, receiver: string) {
  return function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(receiver, {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();

        if (result.status === 0 && result.data?.value) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', result.data.value);
          quill.setSelection(range.index + 1);
        } else {
          console.error('[InputRichTextQuill] Upload failed:', result);
        }
      } catch (err) {
        console.error('[InputRichTextQuill] Upload error:', err);
      }
    };
  };
}

/**
 * InputRichTextQuill — Amis custom form control using react-quill.
 *
 * Based on existing ArsQuill implementation. Adapted for amis:
 * - Uses FormControlProps interface (value/onChange/disabled from amis store)
 * - Replaces cross_project Textarea with native textarea
 * - Hardcodes Chinese tab labels (no external i18n dependency)
 * - Supports image upload via configurable `receiver` prop
 * - Registered via FormItem for proper form integration (label, validation, layout)
 * - Uses dynamic import for react-quill (ESM compatible)
 */
export class InputRichTextQuillInner extends React.Component<
  InputRichTextQuillProps,
  InputRichTextQuillState
> {
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private quillRef: any = null;
  private quillRegistered = false;

  constructor(props: InputRichTextQuillProps) {
    super(props);
    this.state = {
      activeTab: 'editor',
      quillReady: !!ReactQuillModule,
      ReactQuill: ReactQuillModule,
      Quill: null,
    };
  }

  componentDidMount() {
    // If not loaded yet, wait for dynamic import
    if (!this.state.ReactQuill) {
      window.addEventListener('quill-loaded', this.handleQuillLoaded);
    } else {
      this.registerQuillFormats();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('quill-loaded', this.handleQuillLoaded);
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  handleQuillLoaded = () => {
    // Re-import to get Quill for format registration
    import('react-quill').then((mod) => {
      const Quill = mod.Quill;
      Quill.register(Quill.import('attributors/style/direction'), true);
      Quill.register(Quill.import('attributors/style/align'), true);
      const Size = Quill.import('attributors/style/size');
      Size.whitelist = sizeArr;
      Quill.register(Size, true);

      this.setState({
        quillReady: true,
        ReactQuill: mod.default,
        Quill,
      });
    });
  };

  registerQuillFormats() {
    if (this.quillRegistered) return;
    const Quill = this.state.Quill;
    if (Quill) {
      Quill.register(Quill.import('attributors/style/direction'), true);
      Quill.register(Quill.import('attributors/style/align'), true);
      const Size = Quill.import('attributors/style/size');
      Size.whitelist = sizeArr;
      Quill.register(Size, true);
      this.quillRegistered = true;
    }
  }

  static formats = [
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'color',
    'background',
    'align',
    'image',
  ];

  formats = InputRichTextQuillInner.formats;

  getToolbarConfig() {
    const { receiver } = this.props;
    const toolbar: any[][] = [
      [{ size: sizeArr }],
      [{ color: [] }, { background: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      [{ align: [] }],
    ];

    if (receiver) {
      toolbar.push(['image']);
    }

    return toolbar;
  }

  getModules() {
    const { receiver } = this.props;
    const modules: any = {
      toolbar: {
        container: this.getToolbarConfig(),
      },
    };

    if (receiver && this.quillRef) {
      modules.toolbar.handlers = {
        image: createImageHandler(this.quillRef.getEditor(), receiver),
      };
    }

    return modules;
  }

  shouldComponentUpdate(
    nextProps: InputRichTextQuillProps,
    nextState: InputRichTextQuillState,
  ) {
    return (
      nextProps.value !== this.props.value ||
      nextProps.disabled !== this.props.disabled ||
      nextState.activeTab !== this.state.activeTab ||
      nextState.quillReady !== this.state.quillReady
    );
  }

  saveChange = (value: string) => {
    const { onChange } = this.props;
    if (onChange) {
      // Empty content compatibility: Quill inserts <p><br></p> for empty
      if (
        value === '<p><br></p>' ||
        value === '<br>' ||
        value === '<p></p>'
      ) {
        value = '';
      }
      onChange(value);
    }
  };

  handleChange = (value: string) => {
    const { maxLength = MAX_LENGTH } = this.props;
    let currentValue = value;
    if (currentValue.length > maxLength) {
      currentValue = currentValue.substring(0, maxLength);
    }
    // Debounce save (300ms)
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveChange(currentValue), 300);
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    const { value = '', maxLength = MAX_LENGTH } = this.props;
    const v = typeof value === 'string' ? value : '';
    if (
      v.length >= maxLength &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete'
    ) {
      e.preventDefault();
    }
  };

  handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.saveChange(e.target.value);
  };

  handleTabChange = (tab: 'editor' | 'html') => {
    this.setState({ activeTab: tab });
  };

  handleRef = (ref: any) => {
    this.quillRef = ref;
  };

  render() {
    const { value = '', disabled, receiver, classnames: cx } = this.props;
    const { activeTab, quillReady, ReactQuill } = this.state;
    const htmlValue = typeof value === 'string' ? value : '';

    if (!quillReady || !ReactQuill) {
      return (
        <div className={cx('InputRichTextQuill', 'input-rich-text-quill')}>
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            编辑器加载中...
          </div>
        </div>
      );
    }

    return (
      <div className={cx('InputRichTextQuill', 'input-rich-text-quill')}>
        {activeTab === 'editor' ? (
          <ReactQuill
            ref={this.handleRef}
            readOnly={disabled}
            theme="snow"
            bounds=".input-rich-text-quill"
            value={htmlValue}
            onChange={this.handleChange}
            onKeyDown={this.onKeyDown}
            modules={this.getModules()}
            formats={this.formats}
          />
        ) : (
          <textarea
            className="textarea-item"
            value={htmlValue}
            onChange={this.handleTextareaChange}
            maxLength={MAX_LENGTH}
          />
        )}
        <div className="quill-tab-bar">
          <div
            className={`quill-tab-item${activeTab === 'editor' ? ' quill-tab-active' : ''}`}
            onClick={() => this.handleTabChange('editor')}
          >
            富文本
          </div>
          <div
            className={`quill-tab-item${activeTab === 'html' ? ' quill-tab-active' : ''}`}
            onClick={() => this.handleTabChange('html')}
          >
            HTML
          </div>
        </div>
      </div>
    );
  }
}

// Register as amis FormItem (proper form integration with label, validation, layout)
FormItem({
  type: 'input-rich-text-quill',
  name: 'input-rich-text-quill',
})(InputRichTextQuillInner);

export default InputRichTextQuillInner;
