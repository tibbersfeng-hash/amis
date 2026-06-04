import { test, expect } from '@playwright/test';

test.describe('List Page — 列表页渲染与交互', () => {
  test('酒店列表: 渲染所有酒店行', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 标题
    await expect(page.getByText('酒店列表')).toBeVisible();

    // 表头列
    await expect(page.getByText('酒店名称')).toBeVisible();
    await expect(page.getByText('酒店代码')).toBeVisible();
    await expect(page.getByText('所在城市')).toBeVisible();

    // 所有酒店数据行（6 条）
    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('深圳福田香格里拉')).toBeVisible();
    await expect(page.getByText('成都盛贸饭店')).toBeVisible();
    await expect(page.getByText('广州JEN酒店')).toBeVisible();
    await expect(page.getByText('上海浦东嘉里大酒店')).toBeVisible();
    await expect(page.getByText('北京嘉里大酒店')).toBeVisible();

    // 总数 + 分页信息（含 i18n 测试数据）
    await expect(page.getByText('共 7 条记录，第 1/1 页')).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/list-page-hotels.png',
      fullPage: true,
    });
  });

  test('餐厅列表: 渲染所有餐厅行', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await expect(page.getByText('餐厅列表')).toBeVisible();
    await expect(page.getByText('香宫')).toBeVisible();
    await expect(page.getByText('咖啡苑')).toBeVisible();
    await expect(page.getByText('粤绣中餐厅')).toBeVisible();
    await expect(page.getByText('天香阁')).toBeVisible();
    await expect(page.getByText('共 6 条记录')).toBeVisible();
  });

  test('搜索: 按城市过滤酒店', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 在"城市"搜索框中输入"北京"
    const cityInputs = page.locator('.search-field').filter({ hasText: '城市' }).locator('input');
    await cityInputs.fill('北京');
    await page.waitForTimeout(500);

    // 应只显示北京的结果
    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('北京嘉里大酒店')).toBeVisible();
    await expect(page.getByText('已过滤')).toBeVisible();

    // 深圳不应该出现
    await expect(page.getByText('深圳福田香格里拉')).not.toBeVisible();
  });

  test('搜索: 按品牌下拉过滤', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 选择品牌为"香格里拉"
    await page.locator('.search-field').filter({ hasText: '品牌' }).locator('select').selectOption('shangri-la');
    await page.waitForTimeout(500);

    // 应只显示香格里拉品牌
    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('深圳福田香格里拉')).toBeVisible();
    await expect(page.getByText('上海浦东嘉里大酒店')).not.toBeVisible();
  });

  test('搜索: 关键字搜索酒店名称', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 在"搜索"框中输入"香港"→应匹配"香格里拉"
    // 实际上搜索框的name是keyword，搜索所有字段
    const keywordInput = page.locator('.search-field').filter({ hasText: '搜索' }).locator('input');
    await keywordInput.fill('香格里拉');
    await page.waitForTimeout(500);

    await expect(page.getByText('北京香格里拉饭店')).toBeVisible();
    await expect(page.getByText('深圳福田香格里拉')).toBeVisible();
    await expect(page.getByText('成都盛贸饭店')).not.toBeVisible();
  });

  test('搜索重置: 重置按钮清除所有搜索条件', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 先搜索过滤
    const cityInput = page.locator('.search-field').filter({ hasText: '城市' }).locator('input');
    await cityInput.fill('北京');
    await page.waitForTimeout(300);
    await expect(page.getByText('已过滤')).toBeVisible();

    // 点重置
    await page.getByText('重置').click();
    await page.waitForTimeout(300);

    // 恢复全部（已过滤消失）
    await expect(page.getByText('已过滤')).not.toBeVisible();
  });

  test('排序: 点击表头切换排序', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 点击"客房数"表头排序
    await page.getByText('客房数').click();
    await page.waitForTimeout(300);

    // 排序后数据变化（第一个应为客房数最少的）
    const rows = page.locator('.list-page-table tbody tr');
    // 成都盛贸398间最少，应排第一
    await expect(rows.first()).toContainText('成都盛贸饭店');

    // 再次点击切换降序
    await page.getByText('客房数').click();
    await page.waitForTimeout(300);
    // 北京香格里拉568间最多
    await expect(rows.first()).toContainText('北京香格里拉饭店');
  });

  test('点击行跳转到详情页', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=hotel-basic');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // 点击北京香格里拉行
    await page.getByText('北京香格里拉饭店').click();
    await page.waitForTimeout(2000);

    // 应跳转到详情页
    expect(page.url()).toContain('/remote?dataType=hotel-basic&dataId=hotel-beijing-shangrila');
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('北京香格里拉饭店');
  });

  test('空的 dataType 显示错误提示', async ({ page }) => {
    await page.goto('http://localhost:5173/list');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('请指定 dataType 参数')).toBeVisible();
  });

  test('不存在的 dataType 显示错误提示', async ({ page }) => {
    await page.goto('http://localhost:5173/list?dataType=nonexistent-type');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.getByText('List schema not found')).toBeVisible();
  });
});
