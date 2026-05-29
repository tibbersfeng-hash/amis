import React, { useState } from 'react';
import { render as renderAmis } from 'amis';
import ReactDOM from 'react-dom';

/**
 * Drawer Showcase: demonstrates Drawer + setValue pattern.
 * Uses Amis for rendering but manages drawer state via React.
 * The trigger button is placed in the input area (input-group pattern).
 */
export const DrawerShowcase: React.FC = () => {
  const [selectedName, setSelectedName] = useState<string>('张三');
  const [selectedRole, setSelectedRole] = useState<string>('管理员');
  const [drawerType, setDrawerType] = useState<'name' | 'role' | null>(null);

  return (
    <div className="drawer-showcase">
      <h3 className="drawer-showcase-title">Drawer + setValue 示例</h3>
      <p className="drawer-showcase-desc">
        点击输入框旁的「选择」按钮打开抽屉，在抽屉中选择值后点击确认，值将回写到对应的输入字段。
        此模式无需 HTTP 请求，纯前端 setValue。
      </p>

      <div className="drawer-showcase-form">
        {/* Name field with trigger */}
        <div className="drawer-showcase-field">
          <label className="drawer-showcase-label">选中人员</label>
          <div className="drawer-showcase-input-group">
            <input
              type="text"
              className="drawer-showcase-input"
              value={selectedName}
              readOnly
              placeholder="请从抽屉选择"
            />
            <button
              className="drawer-showcase-btn drawer-showcase-btn-primary"
              onClick={() => setDrawerType('name')}
            >
              选择
            </button>
          </div>
        </div>

        {/* Role field with trigger */}
        <div className="drawer-showcase-field">
          <label className="drawer-showcase-label">选中角色</label>
          <div className="drawer-showcase-input-group">
            <input
              type="text"
              className="drawer-showcase-input"
              value={selectedRole}
              readOnly
              placeholder="请从抽屉选择"
            />
            <button
              className="drawer-showcase-btn drawer-showcase-btn-primary"
              onClick={() => setDrawerType('role')}
            >
              选择
            </button>
          </div>
        </div>

        {/* Current values display */}
        <div className="drawer-showcase-result">
          <h4>当前选中的值：</h4>
          <pre>{JSON.stringify({ selectedName, selectedRole }, null, 2)}</pre>
        </div>
      </div>

      {/* Drawer overlay */}
      {drawerType && (
        <div className="drawer-showcase-overlay" onClick={() => setDrawerType(null)}>
          <div
            className="drawer-showcase-panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-showcase-header">
              <h3>{drawerType === 'name' ? '选择人员' : '选择角色'}</h3>
              <button className="drawer-showcase-close" onClick={() => setDrawerType(null)}>
                ×
              </button>
            </div>
            <div className="drawer-showcase-body">
              {drawerType === 'name' ? (
                <RadioGroup
                  label="人员列表"
                  options={[
                    { label: '张三', value: '张三' },
                    { label: '李四', value: '李四' },
                    { label: '王五', value: '王五' },
                    { label: '赵六', value: '赵六' },
                  ]}
                  onConfirm={val => {
                    setSelectedName(val);
                    setDrawerType(null);
                  }}
                />
              ) : (
                <RadioGroup
                  label="角色列表"
                  options={[
                    { label: '管理员', value: '管理员' },
                    { label: '编辑', value: '编辑' },
                    { label: '访客', value: '访客' },
                  ]}
                  onConfirm={val => {
                    setSelectedRole(val);
                    setDrawerType(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON Schema display */}
      <div className="drawer-showcase-schema">
        <h4>等效 Amis JSON Schema：</h4>
        <pre>{JSON.stringify(drawerSchema, null, 2)}</pre>
      </div>
    </div>
  );
};

const RadioGroup: React.FC<{
  label: string;
  options: { label: string; value: string }[];
  onConfirm: (value: string) => void;
}> = ({ label, options, onConfirm }) => {
  const [selected, setSelected] = useState(options[0]?.value || '');

  return (
    <div>
      <div className="drawer-showcase-radios-label">{label}</div>
      <div className="drawer-showcase-radios">
        {options.map(opt => (
          <label
            key={opt.value}
            className={`drawer-showcase-radio ${selected === opt.value ? 'drawer-showcase-radio-checked' : ''}`}
          >
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => setSelected(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <div className="drawer-showcase-actions">
        <button
          className="drawer-showcase-btn drawer-showcase-btn-primary"
          onClick={() => onConfirm(selected)}
        >
          确认
        </button>
        <button
          className="drawer-showcase-btn"
          onClick={() => {}}
        >
          取消
        </button>
      </div>
    </div>
  );
};

const drawerSchema = {
  type: 'form',
  body: [
    {
      type: 'input-group',
      label: '选中人员',
      body: [
        {
          type: 'input-text',
          name: 'selectedName',
          readOnly: true,
          placeholder: '请从抽屉选择',
        },
        {
          type: 'button',
          label: '选择',
          level: 'primary',
          actionType: 'drawer',
          drawer: {
            title: '选择人员',
            position: 'right',
            width: 500,
            body: {
              type: 'form',
              body: [
                {
                  type: 'radios',
                  name: 'pickedName',
                  label: '人员列表',
                  options: [
                    { label: '张三', value: '张三' },
                    { label: '李四', value: '李四' },
                    { label: '王五', value: '王五' },
                  ],
                },
              ],
              actions: [
                {
                  type: 'button',
                  label: '确认',
                  level: 'primary',
                  onEvent: {
                    click: {
                      actions: [
                        {
                          actionType: 'setValue',
                          componentId: 'selectedName',
                          args: { value: '${pickedName}' },
                        },
                        { actionType: 'close' },
                      ],
                    },
                  },
                },
                { type: 'button', label: '取消', actionType: 'close' },
              ],
            },
          },
        },
      ],
    },
  ],
};

export default DrawerShowcase;
