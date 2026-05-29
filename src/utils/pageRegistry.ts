/**
 * Page metadata registry for multi-business page support.
 * Controls whether each page shows sticky footer, phone mockup, i18n, etc.
 */
export interface PageMeta {
  name: string;
  hasStickyFooter: boolean;
  hasPhoneMockup: boolean;
  hasI18n: boolean;
  i18nFields?: string[];
  mode: 'list' | 'detail';
}

export const pageRegistry: Record<string, PageMeta> = {
  list: {
    name: 'list',
    hasStickyFooter: false,
    hasPhoneMockup: false,
    hasI18n: false,
    mode: 'list',
  },
  mission: {
    name: 'mission',
    hasStickyFooter: true,
    hasPhoneMockup: true,
    hasI18n: true,
    i18nFields: [
      'missionShortName', 'missionLongName', 'missionDescription',
      'awardDescription', 'missionDetail', 'tcContent', 'startMission',
      'missionSegmentDescription',
    ],
    mode: 'detail',
  },
  'promotion-list': {
    name: 'promotion-list',
    hasStickyFooter: false,
    hasPhoneMockup: false,
    hasI18n: false,
    mode: 'list',
  },
  promotion: {
    name: 'promotion',
    hasStickyFooter: true,
    hasPhoneMockup: true,
    hasI18n: true,
    i18nFields: [
      'bannerTitle', 'bannerSubtitle', 'ctaText',
      'richContent', 'tcContent',
    ],
    mode: 'detail',
  },
};

export function getPageMeta(pageName: string): PageMeta {
  return pageRegistry[pageName] ?? {
    name: pageName,
    hasStickyFooter: false,
    hasPhoneMockup: false,
    hasI18n: false,
    mode: 'detail',
  };
}
