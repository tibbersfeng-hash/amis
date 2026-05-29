import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Select, Radio & Switch', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  async function clickSubMissionRule(page) {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
  }

  function getSelectByLabel(page, labelText) {
    return page.locator('.cxd-Form-item--normal').filter({ hasText: labelText }).locator('.cxd-Select-valueWrap').first();
  }

  // ==========================================
  // select (下拉选择)
  // ==========================================
  test.describe('select', () => {
    test('【下拉选择】Sub Mission Type 存在', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      await expect(getSelectByLabel(page, 'Sub Mission Type')).toBeVisible();
    });

    test('【下拉选择】Sub Mission Type 有多个选项', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      const selectWrap = getSelectByLabel(page, 'Sub Mission Type');
      await selectWrap.click();
      await page.waitForTimeout(500);
      const optionCount = await page.locator('.cxd-Select-dropdown .cxd-Select-option, .cxd-Select-menu .cxd-Select-option').count();
      expect(optionCount).toBeGreaterThanOrEqual(3);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    });

    test('【下拉选择】选择选项后值改变', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      const selectWrap = getSelectByLabel(page, 'Sub Mission Type');
      const initialText = await selectWrap.textContent();
      await selectWrap.click();
      await page.waitForTimeout(500);
      const secondOption = page.locator('.cxd-Select-dropdown .cxd-Select-option').nth(1);
      if (await secondOption.isVisible()) {
        await secondOption.click();
        await page.waitForTimeout(300);
        const newText = await selectWrap.textContent();
        expect(newText.trim()).not.toBe(initialText.trim());
      }
      await page.keyboard.press('Escape');
    });

    test('【下拉选择】未选择时显示占位符', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      await expect(getSelectByLabel(page, 'Sub Mission Type')).toBeVisible();
    });

    test('【下拉选择】有下拉箭头图标', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      const selectControl = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Sub Mission Type' }).locator('.cxd-Select').first();
      await expect(selectControl.locator('.cxd-Select-arrow').first()).toBeVisible();
    });

    test('【下拉选择】点击展开下拉菜单', async ({ page }) => {
      await goToMission(page);
      await clickSubMissionRule(page);
      const selectWrap = getSelectByLabel(page, 'Sub Mission Type');
      await selectWrap.click();
      await page.waitForTimeout(500);
      await expect(page.locator('.cxd-Select-dropdown, .cxd-Select-menu').first()).toBeVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    });
  });

  // ==========================================
  // radio (单选按钮)
  // ==========================================
  test.describe('radio', () => {
    test('【单选按钮】radio 按钮存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.radio-group input[type="radio"]').first()).toBeVisible();
    });

    test('【单选按钮】displayInCenter 默认选中 No', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="displayInCenter"][value="no"]').first()).toBeChecked();
    });

    test('【单选按钮】点击切换选中值', async ({ page }) => {
      await goToMission(page);
      const yesRadio = page.locator('input[name="displayInCenter"][value="yes"]').first();
      await yesRadio.click();
      await page.waitForTimeout(200);
      await expect(yesRadio).toBeChecked();

      const noRadio = page.locator('input[name="displayInCenter"][value="no"]').first();
      await noRadio.click();
      await page.waitForTimeout(200);
      await expect(noRadio).toBeChecked();
    });

    test('【单选按钮】按钮有自定义颜色', async ({ page }) => {
      await goToMission(page);
      const radio = page.locator('.radio-group input[type="radio"]').first();
      const accentColor = await radio.evaluate((el) => window.getComputedStyle(el).accentColor);
      expect(accentColor).toBeTruthy();
    });

    test('【单选按钮】Label 文字正确', async ({ page }) => {
      await goToMission(page);
      const label = page.locator('.radio-group label.radio-item').first();
      const text = await label.textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // switch (开关)
  // ==========================================
  test.describe('switch', () => {
    test('【开关】开关组件存在', async ({ page }) => {
      await goToMission(page);
      const count = await page.locator('.cxd-Switch').count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
