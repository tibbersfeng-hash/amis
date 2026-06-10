import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const API_DIR = path.resolve(__dirname, '../../public/api/data');

test.describe('Remote Page — 酒店/餐厅业务数据渲染', () => {
  test('酒店-完整数据: 北京香格里拉饭店', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=hotel-beijing-shangrila');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 表单渲染
    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    // 标题包含"酒店基础信息"
    await expect(page.getByText('酒店基础信息')).toBeVisible();

    // 完整字段验证
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('北京香格里拉饭店');
    await expect(page.locator('input[name="hotelCode"]')).toHaveValue('CNBJN001');
    await expect(page.locator('input[name="address"]')).toHaveValue('北京市海淀区紫竹院路29号');
    await expect(page.locator('input[name="city"]')).toHaveValue('北京');
    await expect(page.locator('input[name="contactPerson"]')).toHaveValue('李经理');
    await expect(page.locator('input[name="contactPhone"]')).toHaveValue('010-68412211');
    await expect(page.locator('input[name="contactEmail"]')).toHaveValue('beijing@shangri-la.com');
    // Amis input-number 组件通过 placeholder 匹配
    await expect(page.getByPlaceholder('请输入客房数量')).toHaveValue('568');
    await expect(page.locator('textarea[name="description"]')).toHaveValue(/昆玉河畔/);

    // 截图
    await page.screenshot({
      path: 'tests/e2e/screenshots/remote-hotel-full.png',
      fullPage: true,
    });
  });

  test('酒店-部分数据: 上海浦东嘉里大酒店', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=hotel-shanghai-kerry');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    // 存在的字段有值
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('上海浦东嘉里大酒店');
    await expect(page.locator('input[name="hotelCode"]')).toHaveValue('CNSHN002');

    // 不存在的字段应该为空
    await expect(page.locator('input[name="address"]')).toHaveValue('');
    await expect(page.locator('input[name="contactPerson"]')).toHaveValue('');
    await expect(page.getByPlaceholder('请输入客房数量')).toHaveValue('');
    await expect(page.locator('textarea[name="description"]')).toHaveValue('');
  });

  test('酒店-空数据（新记录）: 不存在的 dataId', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=test-nonexistent-record');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    // 所有字段均为空
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('');
    await expect(page.locator('input[name="hotelCode"]')).toHaveValue('');
    await expect(page.locator('input[name="address"]')).toHaveValue('');
    await expect(page.locator('textarea[name="description"]')).toHaveValue('');
  });

  test('餐厅-完整数据: 香宫（北京香格里拉）', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=restaurant-basic&dataId=restaurant-beijing-shangrila-shangong');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    await expect(page.getByText('餐厅基础信息')).toBeVisible();
    await expect(page.locator('input[name="restaurantName"]')).toHaveValue('香宫');
    await expect(page.locator('input[name="hotelCode"]')).toHaveValue('CNBJN001');
    await expect(page.locator('input[name="floor"]')).toHaveValue('2F');
    // Amis input-number 通过 placeholder 匹配
    await expect(page.getByPlaceholder('请输入座位数量')).toHaveValue('200');
    await expect(page.locator('input[name="cuisine"]')).toHaveValue('粤菜、淮扬菜');
    await expect(page.locator('input[name="manager"]')).toHaveValue('王经理');
    await expect(page.locator('textarea[name="description"]')).toHaveValue(/香格里拉/);

    await page.screenshot({
      path: 'tests/e2e/screenshots/remote-restaurant-full.png',
      fullPage: true,
    });
  });

  test('餐厅-部分数据: 咖啡苑（上海嘉里）', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=restaurant-basic&dataId=restaurant-shanghai-kerry-coffee');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    await expect(page.locator('input[name="restaurantName"]')).toHaveValue('咖啡苑');
    await expect(page.locator('input[name="hotelCode"]')).toHaveValue('CNSHN002');

    // 部分字段为空
    await expect(page.locator('input[name="floor"]')).toHaveValue('');
    await expect(page.locator('input[name="manager"]')).toHaveValue('');
  });

  test('深圳酒店-完整数据展示', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=hotel-shenzhen-shangrila');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const form = page.locator('.antd-Form');
    await expect(form).toBeVisible();

    await expect(page.locator('input[name="hotelName"]')).toHaveValue('深圳福田香格里拉');
    await expect(page.locator('input[name="city"]')).toHaveValue('深圳');
    await expect(page.getByPlaceholder('请输入客房数量')).toHaveValue('548');
    await expect(page.locator('textarea[name="description"]')).toHaveValue(/福田中央商务区/);
  });
});

test.describe('Remote Page — POST /api/page/save 提交保存', () => {
  // 使用不同的 dataId 避免并行测试冲突
  const CREATE_DATA_ID = 'e2e-test-hotel-create';
  const UPDATE_DATA_ID = 'e2e-test-hotel-update';

  function deleteFile(id: string) {
    const f = path.join(API_DIR, `${id}-data.json`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  test('新建记录: POST 提交并验证文件创建', async ({ page }) => {
    // 确保测试开始前不存在残留文件
    deleteFile(CREATE_DATA_ID);

    // 先在浏览器打开空表单
    await page.goto(`http://localhost:5173/remote?dataType=hotel-basic&dataId=${CREATE_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 填写表单
    await page.locator('input[name="hotelName"]').fill('E2E新建酒店');
    await page.locator('input[name="hotelCode"]').fill('E2ECRT001');
    await page.locator('input[name="city"]').fill('南京');
    // 品牌为必填项 — 不选则 Amis 校验不通过无法提交
    await page.locator('.antd-Select').first().click();
    await page.waitForTimeout(300);
    await page.locator('.antd-Select-option').filter({ hasText: '香格里拉' }).click();
    await page.waitForTimeout(300);

    // 监听 POST 响应
    const responsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/page/save') && resp.status() === 200
    );

    // 点击提交按钮
    await page.locator('button[type="submit"]').click();

    const response = await responsePromise;
    const result = await response.json();

    // 验证响应 — 新建应该返回 "新增成功"
    expect(result.status).toBe(0);
    expect(result.msg).toBe('新增成功');
    expect(result.dataId).toBe(CREATE_DATA_ID);
    expect(result.isNew).toBe(true);

    // 验证文件已创建且内容正确
    const createdFile = path.join(API_DIR, `${CREATE_DATA_ID}-data.json`);
    expect(fs.existsSync(createdFile)).toBe(true);

    const fileContent = JSON.parse(fs.readFileSync(createdFile, 'utf-8'));
    // multiLang 字段自动存为 {zh, en} 对象
    expect(fileContent.hotelName).toEqual({ zh: 'E2E新建酒店', en: 'E2E新建酒店' });
    expect(fileContent.hotelCode).toBe('E2ECRT001');
    expect(fileContent.city).toEqual({ zh: '南京', en: '南京' });

    // 验证元数据字段未被写入
    expect(fileContent.dataId).toBeUndefined();
    expect(fileContent.dataType).toBeUndefined();

    // 清理本测试创建的文件
    deleteFile(CREATE_DATA_ID);
  });

  test('更新记录: POST 提交合并数据', async ({ page }) => {
    // 先创建一个初始数据文件
    const initialData = {
      hotelName: 'E2E更新酒店',
      hotelBrand: 'shangri-la',
      hotelCode: 'E2EUPD001',
      city: '初始城市',
      contactPerson: '初始联系人',
    };
    const filePath = path.join(API_DIR, `${UPDATE_DATA_ID}-data.json`);
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');

    // 加载表单
    await page.goto(`http://localhost:5173/remote?dataType=hotel-basic&dataId=${UPDATE_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证初始数据已渲染
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('E2E更新酒店');
    await expect(page.locator('input[name="city"]')).toHaveValue('初始城市');

    // 修改部分字段
    await page.locator('input[name="city"]').fill('更新后的城市');
    await page.locator('input[name="contactPhone"]').fill('099-88887777');

    // 提交
    const responsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/page/save') && resp.status() === 200
    );
    await page.locator('button[type="submit"]').click();

    const response = await responsePromise;
    const result = await response.json();

    expect(result.status).toBe(0);
    expect(result.msg).toBe('保存成功');
    expect(result.dataId).toBe(UPDATE_DATA_ID);
    expect(result.isNew).toBe(false);

    // 验证: 文件包含合并后数据（新字段 + 旧字段保留）
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // multiLang 字段自动转为 {zh, en} 格式
    expect(fileContent.hotelName).toEqual({ zh: 'E2E更新酒店', en: 'E2E更新酒店' });
    expect(fileContent.hotelCode).toBe('E2EUPD001');           // 非 multiLang，不变
    expect(fileContent.city).toEqual({ zh: '更新后的城市', en: '更新后的城市' });
    expect(fileContent.contactPhone).toBe('099-88887777');     // 新增，非 multiLang
    expect(fileContent.contactPerson).toEqual({ zh: '初始联系人', en: '初始联系人' });
    expect(fileContent.hotelBrand).toBe('shangri-la');         // 非 multiLang，不变

    // 清理本测试创建的文件
    deleteFile(UPDATE_DATA_ID);
  });
});
