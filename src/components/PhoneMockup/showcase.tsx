import React, { useState } from 'react';
import { PhoneMockup } from './index';

const PhoneMockupShowcase: React.FC = () => {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Phone Mockup with i18n data</div>
          <PhoneMockup
            data={{
              previewLanguage: lang,
              missionShortName: '夏季任务',
              missionLongName: '夏季消费任务 2025',
              missionDescription: '在活动期间内完成指定金额的房费消费即可逐步解锁多重奖励。',
              awardDescription: '每达成就可获积分奖励，终极目标解锁8倍积分券',
            }}
            previewLanguage={lang}
            onLanguageChange={setLang}
          />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Phone Mockup (empty)</div>
          <PhoneMockup />
        </div>
      </div>
    </div>
  );
};

export default PhoneMockupShowcase;
