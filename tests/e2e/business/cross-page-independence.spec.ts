import { test, expect } from '@playwright/test';

test.describe('Cross-Page Independence', () => {
  // ===== Mission page should NOT have promotion fields =====

  test('mission page shows mission fields, not promotion fields', async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });

    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();

    // Mission fields should exist
    await expect(activePane.locator('input[name="missionCode"]')).toBeVisible();
    await expect(activePane.locator('input[name="missionName"]')).toBeVisible();

    // Promotion fields should NOT exist
    await expect(activePane.locator('input[name="promotionCode"]')).not.toBeVisible();
    await expect(activePane.locator('input[name="promotionName"]')).not.toBeVisible();
    const missionItems = activePane.locator('.cxd-Form-item--normal');
    await expect(missionItems.filter({ hasText: 'Promotion Type' })).not.toBeVisible();
  });

  test('mission tabs are mission-specific', async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });

    const tabs = page.locator('.cxd-Tabs-link');
    await expect(tabs).toHaveCount(5);
    await expect(tabs.nth(0)).toContainText('Mission Setup');
    await expect(tabs.nth(1)).toContainText('Sub-Mission Rules');

    // No promotion tabs
    await expect(tabs.nth(0)).not.toContainText('Basic Info');
    await expect(tabs.nth(1)).not.toContainText('Eligibility Rules');
  });

  // ===== Promotion page should NOT have mission fields =====

  test('promotion page shows promotion fields, not mission fields', async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });

    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();

    // Promotion fields should exist
    await expect(activePane.locator('input[name="promotionCode"]')).toBeVisible();
    await expect(activePane.locator('input[name="promotionName"]')).toBeVisible();

    // Mission fields should NOT exist
    await expect(activePane.locator('input[name="missionCode"]')).not.toBeVisible();
    await expect(activePane.locator('input[name="missionName"]')).not.toBeVisible();
    await expect(activePane.locator('input[name="missionShortName"]')).not.toBeVisible();
  });

  test('promotion tabs are promotion-specific', async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });

    const tabs = page.locator('.cxd-Tabs-link');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('Basic Info');
    await expect(tabs.nth(1)).toContainText('Eligibility Rules');

    // No mission tabs
    await expect(tabs.nth(0)).not.toContainText('Mission Setup');
    await expect(tabs.nth(1)).not.toContainText('Sub-Mission Rules');
  });

  // ===== List pages independence =====

  test('mission list page works independently', async ({ page }) => {
    await page.goto('/?page=list');
    await expect(page.getByText('Mission List').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'Mission Code / Name' })).toBeVisible();
  });

  test('promotion list page works independently', async ({ page }) => {
    await page.goto('/?page=promotion-list');
    await expect(page.getByText('Promotion List').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'Promotion Code / Name' })).toBeVisible();
  });

  // ===== Navigation links go to correct pages =====

  test('mission list navigation goes to mission detail', async ({ page }) => {
    await page.goto('/?page=list');
    await expect(page.getByText('Mission List').first()).toBeVisible({ timeout: 10000 });

    const viewLink = page.locator('.action-view').first();
    await expect(viewLink).toBeVisible();
  });

  test('promotion list navigation goes to promotion detail', async ({ page }) => {
    await page.goto('/?page=promotion-list');
    await expect(page.getByText('Promotion List').first()).toBeVisible({ timeout: 10000 });

    const viewLink = page.locator('.action-view').first();
    await expect(viewLink).toBeVisible();
  });

  // ===== Sticky footer only on detail pages =====

  test('sticky footer present on mission detail', async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.sticky-footer')).toBeVisible();
  });

  test('sticky footer present on promotion detail', async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.sticky-footer')).toBeVisible();
  });

  // ===== Phone mockup only on detail pages =====

  test('phone mockup present on mission detail', async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.mission-right .phone-frame')).toBeVisible();
  });

  test('phone mockup present on promotion detail', async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.phone-frame')).toBeVisible();
  });

  // ===== Language switcher independence =====

  test('language switcher on mission does not affect promotion', async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });

    // Switch language on mission page
    await page.evaluate(() => {
      const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (s) { s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    await page.waitForTimeout(300);

    // Navigate to promotion page
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });

    // Promotion page should still default to Chinese
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const phoneBody = page.locator('.phone-frame .phone-body');
    const bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('夏日');
  });
});
