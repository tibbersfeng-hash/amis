import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JsonEditorPreview } from './JsonEditor';

const TEST_SCHEMA = JSON.stringify({ type: 'form', body: [] }, null, 2);
const TEST_DATA = JSON.stringify({ name: 'test', value: 42 }, null, 2);

describe('JsonEditorPreview', () => {
  it('renders schema and data tabs', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(schema, data) => (
          <div data-testid="preview">
            <span data-testid="schema-type">{(schema as any).type}</span>
            <span data-testid="data-name">{(data as any).name}</span>
          </div>
        )}
      </JsonEditorPreview>
    );

    const tabs = document.querySelectorAll('.schema-preview-tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].textContent).toBe('Amis Schema JSON');
    expect(tabs[1].textContent).toBe('Data JSON');
  });

  it('default tab is schema', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const tabs = document.querySelectorAll('.schema-preview-tab');
    expect(tabs[0]).toHaveClass('is-active');
    expect(tabs[1]).not.toHaveClass('is-active');
  });

  it('switches tabs on click', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const tabs = document.querySelectorAll('.schema-preview-tab');
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveClass('is-active');
    expect(tabs[0]).not.toHaveClass('is-active');
  });

  it('shows schema JSON in textarea by default', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('"type": "form"');
  });

  it('shows data JSON in textarea when data tab is active', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const tabs = document.querySelectorAll('.schema-preview-tab');
    fireEvent.click(tabs[1]);
    const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('"name": "test"');
    expect(textarea.value).toContain('"value": 42');
  });

  it('renders render button', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const renderBtn = document.querySelector('.schema-preview-render-btn');
    expect(renderBtn).toBeInTheDocument();
    expect(renderBtn).toHaveTextContent('渲染');
  });

  it('calls children with parsed schema and data after render', () => {
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {(schema, data, key) => (
          <div data-testid="preview">
            <span data-testid="schema-type">{(schema as any).type}</span>
            <span data-testid="data-name">{(data as any).name}</span>
            <span data-testid="render-key">{key}</span>
          </div>
        )}
      </JsonEditorPreview>
    );

    // Initial render uses parsed defaults
    expect(screen.getByTestId('schema-type').textContent).toBe('form');
    expect(screen.getByTestId('data-name').textContent).toBe('test');
    expect(screen.getByTestId('render-key').textContent).toBe('0');

    // After clicking render, key should increment
    const renderBtn = document.querySelector('.schema-preview-render-btn') as HTMLButtonElement;
    fireEvent.click(renderBtn);
    expect(screen.getByTestId('render-key').textContent).toBe('1');
  });

  it('custom tab labels are displayed', () => {
    render(
      <JsonEditorPreview
        defaultSchema={TEST_SCHEMA}
        defaultData={TEST_DATA}
        tabLabels={['Custom Schema', 'Custom Data']}
      >
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const tabs = document.querySelectorAll('.schema-preview-tab');
    expect(tabs[0].textContent).toBe('Custom Schema');
    expect(tabs[1].textContent).toBe('Custom Data');
  });

  it('toolbar title updates with tab switch', () => {
    render(
      <JsonEditorPreview
        defaultSchema={TEST_SCHEMA}
        defaultData={TEST_DATA}
        tabLabels={['Combo Schema JSON', 'Combo Data JSON']}
      >
        {(s, d) => <div data-testid="preview" />}
      </JsonEditorPreview>
    );

    const title = document.querySelector('.schema-preview-toolbar-title');
    expect(title?.textContent).toBe('Combo Schema JSON');

    const tabs = document.querySelectorAll('.schema-preview-tab');
    fireEvent.click(tabs[1]);
    expect(title?.textContent).toBe('Combo Data JSON');
  });

  it('Ctrl+Enter triggers render', () => {
    const children = vi.fn((schema, data, key) => <div data-testid="preview">key={key}</div>);
    render(
      <JsonEditorPreview defaultSchema={TEST_SCHEMA} defaultData={TEST_DATA}>
        {children}
      </JsonEditorPreview>
    );

    const textarea = document.querySelector('.schema-preview-textarea') as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { ctrlKey: true, key: 'Enter' });
    expect(children).toHaveBeenCalled();
  });
});
