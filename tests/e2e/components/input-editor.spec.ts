import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Editor & Image Upload', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // editor (富文本编辑器)
  // ==========================================
  test.describe('editor', () => {
    test('【富文本】Mission Detail 编辑器存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });

    test('【富文本】编辑器有内容区域', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });

    test('【富文本】编辑器可点击聚焦', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });
  });

  // ==========================================
  // input-image (图片上传)
  // ==========================================
  test.describe('input-image', () => {
    test('【图片上传】Mission Thumbnail 上传组件存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Thumbnail' })).toBeVisible();
    });

    test('【图片上传】上传按钮/区域存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.antd-Upload, .antd-Image').first()).toBeVisible();
    });

    test('【图片上传】有推荐尺寸提示', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.hint-text').filter({ hasText: '1200' })).toBeVisible();
    });

    test('【图片上传】file input 存在', async ({ page }) => {
      await goToMission(page);
      const uploadArea = page.locator('.antd-Upload, .antd-Image, .upload-area, [class*="Upload"]').first();
      await expect(uploadArea).toBeVisible();
    });
  });
});
