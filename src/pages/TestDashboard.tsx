import React from 'react';

interface NavSection {
  title: string;
  items: { label: string; link: string }[];
}

const NAV: NavSection[] = [
  {
    title: '酒店管理',
    items: [
      { label: '酒店列表 →', link: '/list?dataType=hotel-basic' },
      { label: '北京香格里拉（完整）', link: '/remote?dataType=hotel-basic&dataId=hotel-beijing-shangrila' },
      { label: '深圳香格里拉（完整）', link: '/remote?dataType=hotel-basic&dataId=hotel-shenzhen-shangrila' },
      { label: '成都盛贸（完整）', link: '/remote?dataType=hotel-basic&dataId=hotel-chengdu-traders' },
      { label: '上海嘉里（部分）', link: '/remote?dataType=hotel-basic&dataId=hotel-shanghai-kerry' },
      { label: '广州JEN（部分）', link: '/remote?dataType=hotel-basic&dataId=hotel-guangzhou-jen' },
      { label: '北京嘉里（部分）', link: '/remote?dataType=hotel-basic&dataId=hotel-beijing-kerry' },
      { label: 'i18n测试数据 →', link: '/remote?dataType=hotel-basic&dataId=hotel-i18n-test' },
      { label: '新建酒店（空表单）', link: '/remote?dataType=hotel-basic&dataId=new-hotel-test' },
    ],
  },
  {
    title: '餐厅管理',
    items: [
      { label: '餐厅列表 →', link: '/list?dataType=restaurant-basic' },
      { label: '香宫（完整）', link: '/remote?dataType=restaurant-basic&dataId=restaurant-beijing-shangrila-shangong' },
      { label: '粤绣中餐厅（完整）', link: '/remote?dataType=restaurant-basic&dataId=restaurant-shenzhen-shangrila-yuexiu' },
      { label: '天香阁（完整）', link: '/remote?dataType=restaurant-basic&dataId=restaurant-chengdu-traders-sky-pavilion' },
      { label: '咖啡苑（部分）', link: '/remote?dataType=restaurant-basic&dataId=restaurant-shanghai-kerry-coffee' },
      { label: '新建餐厅（空表单）', link: '/remote?dataType=restaurant-basic&dataId=new-restaurant-test' },
    ],
  },
  {
    title: 'i18n 测试',
    items: [
      { label: 'multiLang 表单 →', link: '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang' },
      { label: 'multiLang 列表 →', link: '/list?dataType=form-test-multi-lang' },
      { label: '无 multiLang 表单 →', link: '/remote?dataType=form-test-single-lang&dataId=form-test-single-lang' },
      { label: '无 multiLang 列表 →', link: '/list?dataType=form-test-single-lang' },
    ],
  },
  {
    title: '其他',
    items: [
      { label: 'Showcase 组件展示', link: '/showcase' },
    ],
  },
];

const TestDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Amis Mission CMS</h1>
        <p className="dashboard-subtitle">回归测试导航</p>
      </div>
      <div className="dashboard-grid">
        {NAV.map((section) => (
          <div key={section.title} className="dashboard-card">
            <h2 className="card-title">{section.title}</h2>
            <div className="card-links">
              {section.items.map((item) => (
                <a key={item.link} href={item.link} className="card-link">
                  <span className="link-text">{item.label}</span>
                  <span className="link-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDashboard;
