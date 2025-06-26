import { test, expect } from '@playwright/test';
import { testUsers, testEvents } from '../fixtures/test-data';
import { registerUser } from '../utils/auth-helpers';

test.describe('イベント管理機能テスト', () => {
  let user: typeof testUsers.user1;

  test.beforeEach(async ({ page }) => {
    // 各テスト前に新しいユーザーを作成してログイン
    user = {
      ...testUsers.user1,
      email: `event-test-${Date.now()}@example.com`,
    };
    
    await registerUser(page, user);
  });

  test('イベントを作成できる', async ({ page }) => {
    // イベント作成ページに移動
    await page.click('text=新しいイベントを作成');
    await expect(page).toHaveURL('/create-event');
    
    // イベント情報を入力
    await page.fill('input[name="title"]', testEvents.event1.title);
    await page.fill('textarea[name="description"]', testEvents.event1.description);
    await page.fill('input[name="event_date"]', testEvents.event1.event_date);
    
    // プレビューが更新されることを確認
    await expect(page.locator('text=' + testEvents.event1.title)).toBeVisible();
    await expect(page.locator('text=' + testEvents.event1.description)).toBeVisible();
    
    // イベントを作成
    await page.click('button:has-text("イベントを作成")');
    
    // イベント詳細ページに遷移することを確認
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.locator('h1:has-text("' + testEvents.event1.title + '")')).toBeVisible();
  });

  test('必須項目が未入力の場合エラーが表示される', async ({ page }) => {
    await page.click('text=新しいイベントを作成');
    
    // タイトルを空のまま送信
    await page.click('button:has-text("イベントを作成")');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=タイトルを入力してください')).toBeVisible();
  });

  test('過去の日時では作成できない', async ({ page }) => {
    await page.click('text=新しいイベントを作成');
    
    await page.fill('input[name="title"]', testEvents.pastEvent.title);
    await page.fill('input[name="event_date"]', testEvents.pastEvent.event_date);
    
    await page.click('button:has-text("イベントを作成")');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=未来の日時を選択してください')).toBeVisible();
  });

  test('作成したイベントがダッシュボードに表示される', async ({ page }) => {
    // イベントを作成
    await page.click('text=新しいイベントを作成');
    await page.fill('input[name="title"]', testEvents.event2.title);
    await page.fill('textarea[name="description"]', testEvents.event2.description);
    await page.fill('input[name="event_date"]', testEvents.event2.event_date);
    await page.click('button:has-text("イベントを作成")');
    
    // ダッシュボードに戻る
    await page.click('text=ダッシュボード');
    
    // 作成したイベントが表示されることを確認
    await expect(page.locator('text=' + testEvents.event2.title)).toBeVisible();
    await expect(page.locator('text=' + testEvents.event2.description)).toBeVisible();
    await expect(page.locator('text=作成者: ' + user.name)).toBeVisible();
  });

  test('イベント作成者はイベントを削除できる', async ({ page }) => {
    // イベントを作成
    await page.click('text=新しいイベントを作成');
    await page.fill('input[name="title"]', '削除テストイベント');
    await page.fill('input[name="event_date"]', testEvents.event1.event_date);
    await page.click('button:has-text("イベントを作成")');
    
    // イベント詳細ページで削除ボタンが表示されることを確認
    await expect(page.locator('button:has-text("削除")')).toBeVisible();
    
    // 削除を実行
    page.on('dialog', dialog => dialog.accept()); // 確認ダイアログを承認
    await page.click('button:has-text("削除")');
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL('/');
  });

  test('イベント詳細ページから戻ることができる', async ({ page }) => {
    // イベントを作成
    await page.click('text=新しいイベントを作成');
    await page.fill('input[name="title"]', 'ナビゲーションテスト');
    await page.fill('input[name="event_date"]', testEvents.event1.event_date);
    await page.click('button:has-text("イベントを作成")');
    
    // ダッシュボードリンクをクリック
    await page.click('text=ダッシュボード');
    await expect(page).toHaveURL('/');
    
    // ブランドリンクをクリック
    await page.click('text=出欠管理アプリ');
    await expect(page).toHaveURL('/');
  });

  test('空の状態でもダッシュボードが正しく表示される', async ({ page }) => {
    await page.goto('/');
    
    // 空状態のメッセージが表示されることを確認
    await expect(page.locator('text=イベントがありません')).toBeVisible();
    await expect(page.locator('text=最初のイベントを作成')).toBeVisible();
    
    // 空状態からもイベント作成に移動できることを確認
    await page.click('text=最初のイベントを作成');
    await expect(page).toHaveURL('/create-event');
  });

  test('キャンセルボタンでイベント作成をキャンセルできる', async ({ page }) => {
    await page.click('text=新しいイベントを作成');
    
    // 何か入力してからキャンセル
    await page.fill('input[name="title"]', 'キャンセルテスト');
    await page.click('text=キャンセル');
    
    // ダッシュボードに戻ることを確認
    await expect(page).toHaveURL('/');
  });
});