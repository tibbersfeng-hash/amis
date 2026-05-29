import React from 'react';
import { DateRangePickerComponent } from './index';
import { getComponentI18n } from '../../utils/i18n-config';

const DateRangePickerShowcase: React.FC = () => {
  const t = getComponentI18n();
  const [data, setData] = React.useState<Record<string, unknown>>({});

  const handleChange = (newData: Record<string, unknown>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: 400 }}>
          <div className="showcase-demo-label">Date Range Picker</div>
          <DateRangePickerComponent
            startName="startTime"
            endName="endTime"
            label="Registration Period"
            format="YYYY-MM-DD HH:mm:ss"
            required
            data={data}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: 400 }}>
          <div className="showcase-demo-label">Date Range Picker (no label)</div>
          <DateRangePickerComponent
            startName="start2"
            endName="end2"
            data={data}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Current i18n labels</div>
          <pre className="showcase-json-block" style={{ fontSize: 12, padding: 12 }}>
            {JSON.stringify({
              selectDateRange: t.selectDateRange,
              startLabel: t.startLabel,
              endLabel: t.endLabel,
              confirm: t.confirm,
              cancel: t.cancel,
              months: t.months.slice(0, 3),
              weekdays: t.weekdays,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DateRangePickerShowcase;
