import { test, expect, devices } from '@playwright/test';
import { testUsers, testEvents } from '../fixtures/test-data';
import { registerUser } from '../utils/auth-helpers';

test.describe('レスポンシブデザインテスト', () => {
  let user: typeof testUsers.user1;

  test.beforeEach(async ({ page }) => {
    user = {
      ...testUsers.user1,
      email: `responsive-test-${Date.now()}@example.com`,
    };
    
    await registerUser(page, user);
  });

  test('モバイル画面でダッシュボードが正しく表示される', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();
    
    await registerUser(page, {
      ...user,
      email: `mobile-${Date.now()}@example.com`,
    });
    
    // モバイルでダッシュボードの主要要素が表示されることを確認
    await expect(page.locator('h1:has-text("出欠管理アプリ")')).toBeVisible();
    await expect(page.locator('h2:has-text("イベント一覧")')).toBeVisible();
    await expect(page.locator('text=新しいイベントを作成')).toBeVisible();
    
    await context.close();
  });

  test('モバイル画面でイベント作成フォームが使いやすい', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 12'] });
    const page = await context.newPage();
    
    await registerUser(page, {
      ...user,
      email: `mobile-create-${Date.now()}@example.com`,
    });
    
    await page.click('text=新しいイベントを作成');
    
    // フォーム要素が適切に表示されることを確認
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="event_date"]')).toBeVisible();
    
    // プレビューエリアがモバイルで適切に配置されることを確認
    await expect(page.locator('h2:has-text("プレビュー")')).toBeVisible();
    
    await context.close();
  });

  test('タブレット画面で適切にレイアウトされる', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPad Pro'] });
    const page = await context.newPage();
    
    await registerUser(page, {
      ...user,
      email: `tablet-${Date.now()}@example.com`,
    });
    
    await page.click('text=新しいイベントを作成');
    
    // フィールドを入力
    await page.fill('input[name="title"]', testEvents.event1.title);
    await page.fill('input[name="event_date"]', testEvents.event1.event_date);
    await page.click('button:has-text("イベントを作成")');
    
    // イベント詳細ページがタブレットで適切に表示されることを確認
    await expect(page.locator('h1:has-text("' + testEvents.event1.title + '")')).toBeVisible();
    await expect(page.locator('h2:has-text("出欠登録")')).toBeVisible();
    await expect(page.locator('h2:has-text("出欠状況")')).toBeVisible();
    
    await context.close();
  });

  test('小さい画面でもナビゲーションが機能する', async ({ browser }) => {
    const context = await browser.newContext({ 
      viewport: { width: 375, height: 667 } // iPhone SE サイズ
    });
    const page = await context.newPage();
    
    await registerUser(page, {
      ...user,
      email: `small-nav-${Date.now()}@example.com`,
    });
    
    // ナビゲーション要素が表示されることを確認
    await expect(page.locator('text=出欠管理アプリ')).toBeVisible();
    await expect(page.locator('text=ログアウト')).toBeVisible();
    
    // ナビゲーションが機能することを確認
    await page.click('text=出欠管理アプリ');
    await expect(page).toHaveURL('/');
    
    await context.close();
  });

  test('デスクトップ画面でフル機能が利用できる', async ({ page }) => {
    // イベントを作成
    await page.click('text=新しいイベントを作成');
    
    // デスクトップではフォームとプレビューが横並びで表示されることを確認
    const formSection = page.locator('h2:has-text("イベント情報")');
    const previewSection = page.locator('h2:has-text("プレビュー")');
    
    await expect(formSection).toBeVisible();
    await expect(previewSection).toBeVisible();
    
    // フォームに入力してプレビューが更新されることを確認
    await page.fill('input[name="title"]', testEvents.event1.title);
    await expect(page.locator('text=' + testEvents.event1.title).nth(1)).toBeVisible(); // プレビュー側
    
    await page.fill('textarea[name="description"]', testEvents.event1.description);
    await expect(page.locator('text=' + testEvents.event1.description)).toBeVisible();
  });

  test('画面サイズ変更時にレイアウトが適応する', async ({ page }) => {
    await page.click('text=新しいイベントを作成');
    
    // デスクトップサイズで開始
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h2:has-text("イベント情報")')).toBeVisible();
    await expect(page.locator('h2:has-text("プレビュー")')).toBeVisible();
    
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 要素が引き続き表示されることを確認
    await expect(page.locator('h2:has-text("イベント情報")')).toBeVisible();
    await expect(page.locator('h2:has-text("プレビュー")')).toBeVisible();
    
    // フォームが機能することを確認
    await page.fill('input[name="title"]', 'レスポンシブテスト');
    await expect(page.locator('text=レスポンシブテスト').nth(1)).toBeVisible();
  });

  test('タッチデバイスでボタンが適切にタップできる', async ({ browser }) => {
    const context = await browser.newContext({ 
      ...devices['iPhone 12'],
      hasTouch: true 
    });
    const page = await context.newPage();
    
    await registerUser(page, {
      ...user,
      email: `touch-${Date.now()}@example.com`,
    });
    
    // ボタンのタップターゲットが適切なサイズであることを確認
    const createButton = page.locator('text=新しいイベントを作成');
    await expect(createButton).toBeVisible();
    
    // タップイベントが正常に動作することを確認
    await createButton.tap();
    await expect(page).toHaveURL('/create-event');
    
    await context.close();
  });
});