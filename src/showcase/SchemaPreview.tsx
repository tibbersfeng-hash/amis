import React, { useRef, useState, useCallback } from 'react';
import { AmisLivePreview, type AmisLivePreviewRef } from './AmisLivePreview';

const DEFAULT_SCHEMA = JSON.stringify({
  type: 'page',
  body: {
    type: 'tabs',
    tabsMode: 'line',
    className: 'custom-underline-tabs',
    tabs: [
      {
        title: 'Mission Rule',
        body: {
          type: 'tabs',
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'missionName', label: 'Mission Name', value: '每日签到' },
                  { type: 'input-text', name: 'missionCode', label: 'Mission Code', value: 'DAILY_CHECKIN' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'missionDesc', label: 'Mission Description', value: '完成每日签到可获得积分奖励' },
                  { type: 'input-text', name: 'missionImage', label: 'Mission Image URL', value: 'https://cdn.example.com/images/daily-checkin.png' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Registration Rule',
        body: {
          type: 'tabs',
          className: 'custom-solid-fill-tabs',
          tabs: [
            {
              title: 'Rule Setup',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'registerKeyWord', label: 'Registration Key Word', value: '签到' },
                  { type: 'input-text', name: 'limitionKeyWord', label: 'Limitation Key Word', value: '每日限1次' },
                ],
              },
            },
            {
              title: 'Display',
              body: {
                type: 'form',
                wrapWithPanel: false,
                body: [
                  { type: 'input-text', name: 'registerSuccessMsg', label: 'Registration Success Message', value: '签到成功，获得积分' },
                  { type: 'input-text', name: 'registerFailMsg', label: 'Registration Failure Message', value: '今日已签到，请勿重复' },
                ],
              },
            },
          ],
        },
      },
      {
        title: 'Sub Mission Rule',
        body: {
          type: 'tabs',
          className: 'custom-closable-tabs',
          maxTabs: 10,
          addBtnText: '+ Add',
          tabs: [
            {
              title: 'Sub Mission 1',
              closable: true,
              body: {
                type: 'tabs',
                className: 'custom-solid-fill-tabs',
                tabs: [
                  {
                    title: 'Rule Setup',
                    body: {
                      type: 'form',
                      wrapWithPanel: false,
                      body: [
                        { type: 'input-text', name: 'subMissionName', label: 'Sub Mission Name', value: '连续签到7天' },
                        { type: 'input-text', name: 'currency', label: 'Currency', value: '积分' },
                      ],
                    },
                  },
                  {
                    title: 'Display',
                    body: {
                      type: 'form',
                      wrapWithPanel: false,
                      body: [
                        { type: 'input-text', name: 'awardName', label: 'Award name', value: '宝箱钥匙' },
                        { type: 'input-text', name: 'ctaText', label: 'cta Text', value: '立即签到' },
                        { type: 'input-text', name: 'ctaLink', label: 'cta Link', value: '/mission/daily-checkin' },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
}, null, 2);

const DEFAULT_DATA = JSON.stringify({
  missionName: '每日签到',
  missionCode: 'DAILY_CHECKIN',
  missionDesc: '完成每日签到可获得积分奖励',
  missionImage: 'https://cdn.example.com/images/daily-checkin.png',
  registerKeyWord: '签到',
  limitionKeyWord: '每日限1次',
  registerSuccessMsg: '签到成功，获得积分',
  registerFailMsg: '今日已签到，请勿重复',
  subMissionName: '连续签到7天',
  currency: '积分',
  awardName: '宝箱钥匙',
  ctaText: '立即签到',
  ctaLink: '/mission/daily-checkin',
}, null, 2);

type EditorTab = 'schema' | 'data';

export const SchemaPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>('schema');
  const [schemaJson, setSchemaJson] = useState(DEFAULT_SCHEMA);
  const [dataJson, setDataJson] = useState(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_SCHEMA));
  const [data, setData] = useState<Record<string, unknown>>(() => JSON.parse(DEFAULT_DATA));
  const [renderKey, setRenderKey] = useState(0);
  const previewRef = useRef<AmisLivePreviewRef>(null);

  const handleRender = useCallback(() => {
    try {
      const parsedSchema = JSON.parse(schemaJson);
      setSchema(parsedSchema);
      setError(null);
    } catch (e: unknown) {
      setError(`Schema: ${(e as Error).message}`);
      return;
    }

    try {
      const parsedData = JSON.parse(dataJson);
      setData(parsedData);
    } catch (e: unknown) {
      setError(`Data: ${(e as Error).message}`);
      return;
    }

    setRenderKey(k => k + 1);
  }, [schemaJson, dataJson]);

  const handleSyncData = useCallback(() => {
    previewRef.current?.syncData();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRender();
    }
  }, [handleRender]);

  const activeJson = activeTab === 'schema' ? schemaJson : dataJson;
  const setJson = activeTab === 'schema' ? setSchemaJson : setDataJson;
  const activeLabel = activeTab === 'schema' ? 'Amis Schema JSON' : 'Data JSON';

  return (
    <div className="schema-preview-full">
      <div className="schema-preview-section">
        {/* Editor Tabs */}
        <div className="schema-preview-editor-tabs">
          <button
            className={`schema-preview-tab ${activeTab === 'schema' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('schema')}
          >
            Amis Schema JSON
          </button>
          <button
            className={`schema-preview-tab ${activeTab === 'data' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data JSON
          </button>
        </div>

        {/* Toolbar */}
        <div className="schema-preview-toolbar">
          <span className="schema-preview-toolbar-title">{activeLabel}</span>
          <div className="schema-preview-toolbar-actions">
            <span className="schema-preview-hint">Ctrl+Enter 渲染</span>
            <button className="schema-preview-sync-btn" onClick={handleSyncData}>
              同步数据
            </button>
            <button className="schema-preview-render-btn" onClick={handleRender}>
              渲染
            </button>
          </div>
        </div>

        {/* JSON Textarea */}
        <textarea
          className="schema-preview-textarea"
          value={activeJson}
          onChange={e => setJson(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <div className="schema-preview-error">{error}</div>}
      </div>

      {/* Preview */}
      <div className="schema-preview-section schema-preview-preview-section">
        <div className="schema-preview-preview-bar">
          <span>实时预览</span>
        </div>
        <div className="schema-preview-ami-container">
          <AmisLivePreview
            ref={previewRef}
            key={renderKey}
            schema={schema}
            data={data}
            onDataChange={(merged) => {
              setDataJson(JSON.stringify(merged, null, 2));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SchemaPreview;
