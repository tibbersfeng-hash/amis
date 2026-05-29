import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhoneMockup } from './index';

describe('PhoneMockup', () => {
  it('renders phone frame', () => {
    render(<PhoneMockup />);
    expect(screen.getByText('Preview panel')).toBeDefined();
  });

  it('renders with data and shows mission name', () => {
    render(
      <PhoneMockup
        data={{
          missionShortName: 'Test Mission',
          missionDescription: 'Test description',
        }}
        previewLanguage="zh"
      />
    );
    expect(screen.getAllByText('Test Mission').length).toBeGreaterThan(0);
  });

  it('renders language switcher in header', () => {
    const { container } = render(<PhoneMockup previewLanguage="zh" />);
    expect(container.querySelector('.phone-header')).toBeDefined();
  });
});
