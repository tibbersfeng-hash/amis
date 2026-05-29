import { test, expect } from '@playwright/test';

test.describe('Mission - i18n Field Stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Helper: switch language on mission page =====
  async function switchLanguage(page: any, lang: string) {
    await page.evaluate((l: string) => {
      const s = document.querySelector('.preview-panel .language-select') as HTMLSelectElement;
      if (s) { s.value = l; s.dispatchEvent(new Event('change', { bubbles: true })); }
    }, lang);
    await page.waitForTimeout(1000);
  }

  // =================================================================
  // 正例 (Positive): Expected behaviors that should work correctly
  // =================================================================

  test.describe('Positive: Language switching displays correct language', () => {
    test('default Chinese fields display Chinese content', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const shortName = await activePane.locator('input[name="missionShortName"]').inputValue();
      expect(shortName).toContain('夏季任务');
    });

    test('switching to English displays English content', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await switchLanguage(page, 'en');
      const shortName = await activePane.locator('input[name="missionShortName"]').inputValue();
      expect(shortName).toContain('Summer Mission');
    });

    test('switching back to Chinese re-displays Chinese content', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'zh');
      const shortName = await activePane.locator('input[name="missionShortName"]').inputValue();
      expect(shortName).toContain('夏季任务');
    });

    test('multiple rapid language switches always show correct content', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const input = activePane.locator('input[name="missionShortName"]');

      await switchLanguage(page, 'en');
      expect(await input.inputValue()).toContain('Summer');

      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toContain('夏季');

      await switchLanguage(page, 'en');
      expect(await input.inputValue()).toContain('Summer');

      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toContain('夏季');
    });

    test('all i18n fields switch together', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await switchLanguage(page, 'en');

      const shortName = await activePane.locator('input[name="missionShortName"]').inputValue();
      expect(shortName).toContain('Summer');

      const longName = await activePane.locator('input[name="missionLongName"]').inputValue();
      expect(longName).toContain('Summer');

      const desc = await activePane.locator('input[name="missionDescription"]').inputValue();
      expect(desc).toContain('mission');

      const award = await activePane.locator('input[name="awardDescription"]').inputValue();
      expect(award).toContain('Earn');
    });
  });

  test.describe('Positive: Focus/click does not revert language', () => {
    test('clicking English field keeps English', async ({ page }) => {
      await switchLanguage(page, 'en');
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="awardDescription"]');
      await input.click();
      await page.waitForTimeout(500);
      expect(await input.inputValue()).toContain('Earn');
      expect(await input.inputValue()).not.toContain('积分');
    });

    test('focusing English field keeps English', async ({ page }) => {
      await switchLanguage(page, 'en');
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionLongName"]');
      await input.focus();
      await page.waitForTimeout(500);
      expect(await input.inputValue()).toContain('Summer');
    });

    test('typing in English field keeps English', async ({ page }) => {
      await switchLanguage(page, 'en');
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');
      await input.fill('');
      await input.fill('My Custom Mission');
      expect(await input.inputValue()).toBe('My Custom Mission');
    });
  });

  test.describe('Positive: User edits persist across language round-trip', () => {
    test('editing Chinese, switching to English and back preserves Chinese edit', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('我的自定义任务');
      await page.waitForTimeout(300);

      // Switch to English, then back
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'zh');

      // Chinese edit should be preserved
      expect(await input.inputValue()).toBe('我的自定义任务');
    });

    test('editing English, switching to Chinese and back preserves English edit', async ({ page }) => {
      await switchLanguage(page, 'en');
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="awardDescription"]');

      // Edit English
      await input.fill('');
      await input.fill('Custom reward description');
      await page.waitForTimeout(300);

      // Switch to Chinese, then back
      await switchLanguage(page, 'zh');
      await switchLanguage(page, 'en');

      // English edit should be preserved
      expect(await input.inputValue()).toBe('Custom reward description');
    });

    test('editing both languages independently, round-trip preserves both', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionLongName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('自定义中文长名称');
      await page.waitForTimeout(300);

      // Switch to English and edit
      await switchLanguage(page, 'en');
      await input.fill('');
      await input.fill('Custom English Long Name');
      await page.waitForTimeout(300);

      // Verify Chinese edit preserved
      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toBe('自定义中文长名称');

      // Verify English edit preserved
      await switchLanguage(page, 'en');
      expect(await input.inputValue()).toBe('Custom English Long Name');
    });

    test('editing Chinese, switching en->zh->en->zh multiple times preserves edit', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('持久化测试');
      await page.waitForTimeout(300);

      // Multiple round-trips
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'zh');
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'zh');

      expect(await input.inputValue()).toBe('持久化测试');
    });
  });

  // =================================================================
  // 反例 (Negative): Behaviors that should NOT happen
  // =================================================================

  test.describe('Negative: Languages are independent', () => {
    test('editing Chinese should NOT change English content', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Get original English
      await switchLanguage(page, 'en');
      const originalEn = await input.inputValue();

      // Switch to Chinese and edit
      await switchLanguage(page, 'zh');
      await input.fill('');
      await input.fill('完全不同的中文');
      await page.waitForTimeout(300);

      // Switch back to English — should still show original English, not the Chinese edit
      await switchLanguage(page, 'en');
      expect(await input.inputValue()).toBe(originalEn);
    });

    test('editing English should NOT change Chinese content', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="awardDescription"]');

      // Get original Chinese
      const originalZh = await input.inputValue();

      // Switch to English and edit
      await switchLanguage(page, 'en');
      await input.fill('');
      await input.fill('Completely different English');
      await page.waitForTimeout(300);

      // Switch back to Chinese — should still show original Chinese
      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toBe(originalZh);
    });

    test('Chinese and English values can be completely different', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      await switchLanguage(page, 'en');
      await input.fill('');
      await input.fill('EN-VALUE');
      await page.waitForTimeout(300);

      await switchLanguage(page, 'zh');
      await input.fill('');
      await input.fill('中文值');
      await page.waitForTimeout(300);

      // Verify they are independent
      await switchLanguage(page, 'en');
      expect(await input.inputValue()).toBe('EN-VALUE');
      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toBe('中文值');
    });
  });

  test.describe('Negative: Clicking/focusing does not revert', () => {
    test('clicking Chinese field after English switch does NOT revert to English', async ({ page }) => {
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'zh');

      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionLongName"]');
      await input.click();
      await page.waitForTimeout(500);

      expect(await input.inputValue()).toContain('夏季');
      expect(await input.inputValue()).not.toContain('Summer');
    });

    test('blur and re-focus does NOT reset to config defaults', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Edit
      await input.fill('');
      await input.fill('自定义');
      await page.waitForTimeout(300);

      // Blur by clicking elsewhere
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);

      // Re-focus
      await input.focus();
      await page.waitForTimeout(500);

      expect(await input.inputValue()).toBe('自定义');
    });
  });

  // =================================================================
  // 组合场景 (Combined): Tab switching + language switching
  // =================================================================

  test.describe('Combined: Tab switch + language switch', () => {
    test('edit on Mission Setup tab, switch tabs, switch language, come back preserves edit', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const input = activePane.locator('input[name="missionShortName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('Tab测试编辑');
      await page.waitForTimeout(300);

      // Switch to Sub-Mission Rules tab
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
      await page.waitForTimeout(500);

      // Switch language to English
      await switchLanguage(page, 'en');

      // Switch back to Mission Setup — should show English (global language is English)
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first().click({ force: true });
      await page.waitForTimeout(500);

      // Should show English value (not the original config value)
      expect(await input.inputValue()).toContain('Summer Mission');

      // Now switch back to Chinese to verify Chinese edit is preserved
      await switchLanguage(page, 'zh');
      expect(await input.inputValue()).toBe('Tab测试编辑');
    });

    test('edit on Sub-Mission Rules tab, switch language, switch back to Setup tab preserves English', async ({ page }) => {
      // First edit on Setup tab
      const setupInput = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');
      await setupInput.fill('');
      await setupInput.fill('自定义中文');
      await page.waitForTimeout(300);

      // Switch to Sub-Mission Rules
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
      await page.waitForTimeout(500);

      // Switch to English
      await switchLanguage(page, 'en');

      // Switch back to Setup tab
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first().click({ force: true });
      await page.waitForTimeout(500);

      // Should show English (since language is now English)
      const enValue = await setupInput.inputValue();
      expect(enValue).toContain('Summer');
    });

    test('rapid tab + language interleaving does not crash', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('交错测试');
      await page.waitForTimeout(300);

      // Tab switch
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
      await page.waitForTimeout(300);

      // Language switch
      await switchLanguage(page, 'en');

      // Tab switch back
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first().click({ force: true });
      await page.waitForTimeout(300);

      // Should show English (current language)
      expect(await input.inputValue()).toContain('Summer');

      // Language switch back
      await switchLanguage(page, 'zh');

      // Edit should still be there
      expect(await input.inputValue()).toBe('交错测试');
    });

    test('Skin Setting tab: edit + language round-trip preserves', async ({ page }) => {
      // Skin Setting is tab 3
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
      await page.waitForTimeout(500);

      // Check if there are any i18n fields on this tab (there shouldn't be based on pageRegistry)
      // But verify the language switch still works without crashing
      await switchLanguage(page, 'en');

      // Switch back
      await switchLanguage(page, 'zh');

      // Navigation back to Mission Setup should work
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first().click({ force: true });
      await page.waitForTimeout(300);

      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');
      expect(await input.inputValue()).toContain('夏季任务');
    });
  });

  // =================================================================
  // Save + i18n: verify edited values are captured in save
  // =================================================================

  test.describe('Save + i18n', () => {
    test('edited i18n values appear in save output', async ({ page }) => {
      const input = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');

      // Edit Chinese
      await input.fill('');
      await input.fill('保存测试中文');
      await page.waitForTimeout(300);

      // Switch to English and edit
      await switchLanguage(page, 'en');
      const enInput = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="missionShortName"]');
      await enInput.fill('');
      await enInput.fill('Save Test English');
      await page.waitForTimeout(300);

      // Set up console capture
      await page.evaluate(() => {
        (window as any).__testConsoleLogs = [];
        const origLog = console.log;
        console.log = (...args: unknown[]) => {
          (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
          origLog.apply(console, args);
        };
      });

      // Save
      await page.locator('.footer-btn--save').click();
      await page.waitForTimeout(500);

      const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));

      // Both edited values should appear in save output
      expect(logs).toContain('保存测试中文');
      expect(logs).toContain('Save Test English');
    });
  });
});
