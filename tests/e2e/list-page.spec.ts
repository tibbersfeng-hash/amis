import { test, expect } from '@playwright/test';

test.describe('List Page — Amis CRUD rendering', () => {
  test('酒店列表: 渲染 Amis CRUD 表格', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证 Amis CRUD 组件已渲染
    const crud = page.locator('.cxd-CRUD');
    await expect(crud).toBeVisible();

    // 表头列
    await expect(page.locator('.cxd-Table th')).toBeVisible();
    const headers = await page.locator('.cxd-Table th').allTextContents();
    expect(headers.some(h => h.includes('酒店名称'))).toBe(true);
    expect(headers.some(h => h.includes('酒店代码'))).toBe(true);
    expect(headers.some(h => h.includes('所在城市'))).toBe(true);
    expect(headers.some(h => h.includes('操作'))).toBe(true);

    // 所有酒店数据行
    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('深圳福田香格里拉')).toBeVisible();
    await expect(page.getByText('成都盛贸饭店')).toBeVisible();
    await expect(page.getByText('广州JEN酒店')).toBeVisible();
    await expect(page.getByText('上海浦东嘉里大酒店')).toBeVisible();
    await expect(page.getByText('北京嘉里大酒店')).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/list-page-hotels.png',
      fullPage: true,
    });
  });

  test('餐厅列表: 渲染 Amis CRUD 表格', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const crud = page.locator('.cxd-CRUD');
    await expect(crud).toBeVisible();

    await expect(page.getByText('香宫')).toBeVisible();
    await expect(page.getByText('咖啡苑')).toBeVisible();
    await expect(page.getByText('粤绣中餐厅')).toBeVisible();
    await expect(page.getByText('天香阁')).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/list-page-restaurants.png',
      fullPage: true,
    });
  });

  test('搜索: Amis CRUD 搜索表单', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 验证搜索表单存在
    const filterForm = page.locator('.crud-search-form');
    await expect(filterForm).toBeVisible();

    // 在"城市"搜索框中输入"北京"
    const cityInputs = page.locator('input[name="city"]');
    await expect(cityInputs.first()).toBeVisible();
    await cityInputs.first().fill('北京');

    // 点击查询按钮
    await page.locator('.crud-search-form button[type="submit"]').first().click();
    await page.waitForTimeout(1000);

    // 应只显示北京的结果
    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('北京嘉里大酒店')).toBeVisible();
  });

  test('搜索重置: Amis CRUD 重置按钮', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 先搜索过滤
    const cityInputs = page.locator('input[name="city"]');
    await cityInputs.first().fill('北京');

    // 点重置
    await page.locator('.crud-search-form button[type="reset"]').first().click();
    await page.waitForTimeout(500);

    // 输入框应清空
    await expect(cityInputs.first()).toHaveValue('');
  });

  test('操作列: 查看按钮链接正确', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 操作列应包含查看/编辑/删除按钮
    const ops = page.locator('.cxd-Table td .cxd-Button');
    await expect(ops.first()).toBeVisible();
    const opText = await ops.first().textContent();
    expect(opText).toContain('查看');
  });

  test('不存在的 dataType 显示错误提示', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=nonexistent-type');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page.getByText('List schema not found')).toBeVisible();
  });

  test('空的 dataType 显示错误提示', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page.getByText('请指定 dataType 参数')).toBeVisible();
  });
});
