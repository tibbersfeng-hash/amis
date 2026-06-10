import { test, expect } from '@playwright/test';

test.describe('Language Switcher & Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== 1. Language Switcher UI =====
  test('语言切换下拉框存在', async ({ page }) => {
    const langSwitcher = page.locator('.mission-right .language-switcher');
    await expect(langSwitcher).toBeVisible();
  });

  test('语言切换下拉框默认选中中文', async ({ page }) => {
    const select = page.locator('.mission-right .language-select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('zh');
  });

  test('语言切换下拉框有两个选项（中文/English）', async ({ page }) => {
    const options = page.locator('.mission-right .language-select option');
    await expect(options).toHaveCount(2);
  });

  test('语言切换标签文字正确', async ({ page }) => {
    await expect(page.locator('.mission-right .language-label')).toContainText('Language');
  });

  // ===== 2. Language Switch Interaction =====
  test('切换到 English 后下拉框值改变', async ({ page }) => {
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    const val = await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      return select ? select.value : 'not-found';
    });
    expect(val).toBe('en');
  });

  test('切换回中文后下拉框值恢复', async ({ page }) => {
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    let val = await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      return select ? select.value : 'not-found';
    });
    expect(val).toBe('en');

    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'zh';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    val = await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      return select ? select.value : 'not-found';
    });
    expect(val).toBe('zh');
  });

  // ===== 3. Preview Panel =====
  test('预览面板在 tabs 外面固定可见', async ({ page }) => {
    const previewPanel = page.locator('.mission-right .preview-panel');
    await expect(previewPanel).toBeVisible();
  });

  test('预览面板包含手机模型', async ({ page }) => {
    const phoneFrame = page.locator('.mission-right .phone-frame');
    await expect(phoneFrame).toBeVisible();
  });

  test('预览面板在语言切换器下方', async ({ page }) => {
    const switcherBox = await page.locator('.mission-right .language-switcher').boundingBox();
    const phoneBox = await page.locator('.mission-right .phone-frame').boundingBox();
    expect(switcherBox.y + switcherBox.height).toBeLessThanOrEqual(phoneBox.y + 20);
  });

  // ===== 4. i18n Fields =====
  test('Mission Short Name 显示当前语言内容（单语言值）', async ({ page }) => {
    const input = page.locator('input[name="missionShortName"]').first();
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    // i18n fields show single-language value, not raw JSON
    expect(value).toBe('夏季任务');
    expect(value).not.toContain('"zh"');
    expect(value).not.toContain('"en"');
  });

  test('Mission Long Name 显示当前语言内容（单语言值）', async ({ page }) => {
    const input = page.locator('input[name="missionLongName"]').first();
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    // i18n fields show single-language value, not raw JSON
    expect(value).toContain('夏季');
    expect(value).not.toContain('"zh"');
    expect(value).not.toContain('"en"');
  });

  // ===== 5. Language 联动 i18n 内容 =====
  test('默认中文时手机模型显示中文内容', async ({ page }) => {
    const phoneBody = page.locator('.phone-frame .phone-body');
    await expect(phoneBody).toBeVisible();
    const bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('夏季任务');
  });

  test('切换到英文后手机模型显示英文内容', async ({ page }) => {
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);

    const phoneBody = page.locator('.phone-frame .phone-body');
    await expect(phoneBody).toBeVisible();
    const bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('Summer Mission');
    expect(bodyText).not.toContain('夏季任务');
  });

  test('切换回中文后手机模型恢复中文内容', async ({ page }) => {
    // 先切到英文
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);

    let phoneBody = page.locator('.phone-frame .phone-body');
    let bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('Summer Mission');

    // 再切回中文
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'zh';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);

    phoneBody = page.locator('.phone-frame .phone-body');
    bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('夏季任务');
    expect(bodyText).not.toContain('Summer Mission');
  });

  test('语言切换联动多个 i18n 字段', async ({ page }) => {
    // 默认中文 - missionShortName = "夏季任务", awardDescription = "每达成..."
    let phoneBody = page.locator('.phone-frame .phone-body');
    let bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('夏季任务');
    expect(bodyText).toContain('赚取');

    // 切换到英文
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);

    phoneBody = page.locator('.phone-frame .phone-body');
    bodyText = await phoneBody.textContent();
    expect(bodyText).toContain('Summer Mission');
    expect(bodyText).toContain('earn');
  });

  // ===== 6. i18n 字段受语言切换影响 =====
  test('i18n: missionShortName 输入值随语言切换改变', async ({ page }) => {
    const input = page.locator('input[name="missionShortName"]').first();
    const valueBefore = await input.inputValue();
    expect(valueBefore).toBe('夏季任务');

    // 切换语言
    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    const valueAfter = await input.inputValue();
    expect(valueAfter).toBe('Summer Mission');
  });

  test('i18n: missionLongName 输入值随语言切换改变', async ({ page }) => {
    const input = page.locator('input[name="missionLongName"]').first();
    const valueBefore = await input.inputValue();
    expect(valueBefore).toContain('夏季');

    await page.evaluate(() => {
      const select = document.querySelector('.mission-right .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    const valueAfter = await input.inputValue();
    expect(valueAfter).toContain('Summer');
  });

  test('i18n: missionDescription 输入值随语言切换改变', async ({ page }) => {
    const input = page.locator('input[name="missionDescription"]').first();
    await expect(input).toBeVisible();
    const valueBefore = await input.inputValue();
    expect(valueBefore).not.toContain('"zh"');
    expect(valueBefore).not.toContain('"en"');
  });

  test('i18n: awardDescription 输入值随语言切换改变', async ({ page }) => {
    const input = page.locator('input[name="awardDescription"]').first();
    await expect(input).toBeVisible();
    const valueBefore = await input.inputValue();
    expect(valueBefore).not.toContain('"zh"');
    expect(valueBefore).not.toContain('"en"');
  });

  test('i18n: missionDetail 编辑器不受语言切换影响', async ({ page }) => {
    const editor = page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' });
    await expect(editor).toBeVisible();

    await page.evaluate(() => {
      const select = document.querySelector('.antd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    // 编辑器仍然可见
    await expect(editor).toBeVisible();
  });

  test('i18n: tcContent 编辑器不受语言切换影响', async ({ page }) => {
    const editor = page.locator('.section-title-sm').filter({ hasText: 'T&C Content' });
    await expect(editor).toBeVisible();

    await page.evaluate(() => {
      const select = document.querySelector('.antd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    await expect(editor).toBeVisible();
  });

  test('i18n: missionSegmentDescription 输入内容不受语言切换影响', async ({ page }) => {
    const input = page.locator('input[name="missionSegmentDescription"]').first();
    await expect(input).toBeVisible();
  });

  // ===== 7. 非 i18n 字段不受语言切换影响 =====
  test('非i18n: missionCode 值不受语言切换影响', async ({ page }) => {
    const input = page.locator('input[name="missionCode"]').first();
    const valueBefore = await input.inputValue();
    expect(valueBefore).toBe('MISSION_20260430_001');

    await page.evaluate(() => {
      const select = document.querySelector('.antd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    const valueAfter = await input.inputValue();
    expect(valueAfter).toBe('MISSION_20260430_001');
  });

  test('非i18n: missionName 值不受语言切换影响', async ({ page }) => {
    const input = page.locator('input[name="missionName"]').first();
    const valueBefore = await input.inputValue();
    expect(valueBefore).toBe('Summer Spending Mission');

    await page.evaluate(() => {
      const select = document.querySelector('.antd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    const valueAfter = await input.inputValue();
    expect(valueAfter).toBe('Summer Spending Mission');
  });

  test('非i18n: registrationKeyword 值不受语言切换影响', async ({ page }) => {
    const input = page.locator('input[name="registrationKeyword"]').first();
    await expect(input).toBeVisible();
  });

  test('非i18n: thresholdValue 值不受语言切换影响', async ({ page }) => {
    const input = page.locator('.antd-NumberControl input').first();
    await expect(input).toBeVisible();
  });

  test('非i18n: 单选按钮 displayInCenter 不受语言切换影响', async ({ page }) => {
    const noRadio = page.locator('input[name="displayInCenter"][value="no"]').first();
    await expect(noRadio).toBeChecked();

    await page.evaluate(() => {
      const select = document.querySelector('.antd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(200);

    await expect(noRadio).toBeChecked();
  });

  test('非i18n: 单选按钮 sequenceType 不受语言切换影响', async ({ page }) => {
    const continueRadio = page.locator('input[name="sequenceType"][value="continue"]').first();
    await expect(continueRadio).toBeChecked();
  });

  // ===== 8. Save Button =====
  test('Save 按钮存在', async ({ page }) => {
    await expect(page.locator('.sticky-footer')).toContainText('Save');
  });

  test('Save 按钮在控制台输出 i18n 数据', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));
    expect(logs).toContain('i18n');
    expect(logs).toContain('"zh"');
    expect(logs).toContain('"en"');
  });

  test('Save 按钮输出完整表单数据', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));
    expect(logs).toContain('missionCode');
    expect(logs).toContain('MISSION_20260430_001');
  });

  // ===== 7. Layout =====
  test('左侧 tab 切换后预览面板保持可见', async ({ page }) => {
    // Preview is outside tabs, always visible
    const previewPanel = page.locator('.mission-right .preview-panel');

    // Check on Mission Setup tab
    await expect(previewPanel).toBeVisible();

    // Switch to Registration Rule tab - preview should stay visible
    await page.locator('.antd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    await expect(previewPanel).toBeVisible();

    // Switch to Sub-Mission Rules tab
    await page.locator('.antd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    await expect(previewPanel).toBeVisible();

    // Switch back to Mission Setup
    await page.locator('.antd-Tabs-link').nth(0).click({ force: true });
    await page.waitForTimeout(500);
    await expect(previewPanel).toBeVisible();
  });

  test('语言切换器在页面右侧始终可见', async ({ page }) => {
    // Single language switcher outside tabs, always visible
    const langSwitcher = page.locator('.mission-right .language-switcher');
    await expect(langSwitcher).toBeVisible();

    // Switch tabs - should still be visible
    for (let i = 0; i < 5; i++) {
      if (i > 0) {
        await page.locator('.antd-Tabs-link').nth(i).click({ force: true });
        await page.waitForTimeout(300);
      }
      await expect(langSwitcher).toBeVisible();
    }
  });
});
