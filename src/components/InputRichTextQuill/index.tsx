import React from 'react';
import { InputRichTextQuillInner } from './QuillEditor';

interface InputRichTextQuillWrapperProps {
  value?: string;
  disabled?: boolean;
  onChange?: (v: string) => void;
  maxLength?: number;
}

interface InputRichTextQuillWrapperState {
  isMounted: boolean;
}

/**
 * InputRichTextQuill — SSR-safe wrapper.
 *
 * react-quill requires `document`, which is undefined during SSR.
 * This wrapper delays rendering until componentDidMount to prevent errors.
 *
 * Usage in amis schema:
 * {
 *   "type": "input-rich-text-quill",
 *   "name": "description",
 *   "label": "描述",
 *   "maxLength": 5000
 * }
 */
class InputRichTextQuillWrapper extends React.Component<
  InputRichTextQuillWrapperProps,
  InputRichTextQuillWrapperState
> {
  constructor(props: InputRichTextQuillWrapperProps) {
    super(props);
    this.state = { isMounted: false };
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  render() {
    const { isMounted } = this.state;
    const { onChange, value, disabled, maxLength } = this.props;

    return isMounted ? (
      <InputRichTextQuillInner
        value={value}
        disabled={disabled}
        onChange={onChange}
        maxLength={maxLength}
      />
    ) : null;
  }
}

export default InputRichTextQuillWrapper;
