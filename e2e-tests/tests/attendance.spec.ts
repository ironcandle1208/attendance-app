import { test, expect } from '@playwright/test';
import { testUsers, testEvents, attendanceStatuses } from '../fixtures/test-data';
import { registerUser } from '../utils/auth-helpers';

test.describe('出欠管理機能テスト', () => {
  let creator: typeof testUsers.user1;
  let participant: typeof testUsers.user2;

  test.beforeEach(async ({ browser }) => {
    // テスト用のユーザーを2人作成
    creator = {
      ...testUsers.user1,
      email: `creator-${Date.now()}@example.com`,
    };
    
    participant = {
      ...testUsers.user2,
      email: `participant-${Date.now()}@example.com`,
    };

    // 作成者でイベントを作成
    const page1 = await browser.newPage();
    await registerUser(page1, creator);
    await page1.click('text=新しいイベントを作成');
    await page1.fill('input[name="title"]', testEvents.event1.title);
    await page1.fill('textarea[name="description"]', testEvents.event1.description);
    await page1.fill('input[name="event_date"]', testEvents.event1.event_date);
    await page1.click('button:has-text("イベントを作成")');
    await page1.close();
  });

  test('参加者が出欠登録できる', async ({ page }) => {
    await registerUser(page, participant);
    
    // 作成されたイベントをクリック
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠登録ボタンが表示されることを確認
    await expect(page.locator('button:has-text("出欠を登録する")')).toBeVisible();
    
    // 出欠登録フォームを開く
    await page.click('button:has-text("出欠を登録する")');
    
    // 参加を選択
    await page.check('input[value="attending"]');
    await page.fill('textarea[name="comment"]', 'よろしくお願いします！');
    
    // 登録
    await page.click('button:has-text("保存")');
    
    // 登録完了後、現在の出欠状況が表示されることを確認
    await expect(page.locator('text=現在の出欠状況')).toBeVisible();
    await expect(page.locator('text=参加')).toBeVisible();
    await expect(page.locator('text=よろしくお願いします！')).toBeVisible();
  });

  test('出欠状況を変更できる', async ({ page }) => {
    await registerUser(page, participant);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 最初に参加で登録
    await page.click('button:has-text("出欠を登録する")');
    await page.check('input[value="attending"]');
    await page.click('button:has-text("保存")');
    
    // 出欠を変更
    await page.click('button:has-text("出欠を変更する")');
    await page.check('input[value="not_attending"]');
    await page.fill('textarea[name="comment"]', '急用ができました');
    await page.click('button:has-text("保存")');
    
    // 変更が反映されることを確認
    await expect(page.locator('text=不参加')).toBeVisible();
    await expect(page.locator('text=急用ができました')).toBeVisible();
  });

  test('参加者一覧に出欠情報が表示される', async ({ page }) => {
    await registerUser(page, participant);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠登録
    await page.click('button:has-text("出欠を登録する")');
    await page.check('input[value="maybe"]');
    await page.fill('textarea[name="comment"]', 'まだ未定です');
    await page.click('button:has-text("保存")');
    
    // 参加者一覧に自分が表示されることを確認
    await expect(page.locator('h2:has-text("参加者一覧")')).toBeVisible();
    await expect(page.locator(`text=${participant.name}`)).toBeVisible();
    await expect(page.locator('text=未定')).toBeVisible();
    await expect(page.locator('text=まだ未定です')).toBeVisible();
    await expect(page.locator('text=(あなた)')).toBeVisible();
  });

  test('出欠状況統計が正しく表示される', async ({ browser }) => {
    // 複数のユーザーで出欠登録
    const users = [
      { ...participant, email: `user1-${Date.now()}@example.com` },
      { ...participant, name: 'ユーザー2', email: `user2-${Date.now()}@example.com` },
      { ...participant, name: 'ユーザー3', email: `user3-${Date.now()}@example.com` },
    ];
    
    const statuses = ['attending', 'not_attending', 'maybe'];
    
    for (let i = 0; i < users.length; i++) {
      const userPage = await browser.newPage();
      await registerUser(userPage, users[i]);
      await userPage.click(`text=${testEvents.event1.title}`);
      await userPage.click('button:has-text("出欠を登録する")');
      await userPage.check(`input[value="${statuses[i]}"]`);
      await userPage.click('button:has-text("保存")');
      await userPage.close();
    }
    
    // 統計を確認
    await registerUser(page, { ...participant, email: `viewer-${Date.now()}@example.com` });
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠状況統計が表示されることを確認
    await expect(page.locator('h2:has-text("出欠状況")')).toBeVisible();
    await expect(page.locator('text=参加').locator('..').locator('text=1人')).toBeVisible();
    await expect(page.locator('text=不参加').locator('..').locator('text=1人')).toBeVisible();
    await expect(page.locator('text=未定').locator('..').locator('text=1人')).toBeVisible();
  });

  test('出欠登録をキャンセルできる', async ({ page }) => {
    await registerUser(page, participant);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠登録フォームを開く
    await page.click('button:has-text("出欠を登録する")');
    
    // 何か選択してからキャンセル
    await page.check('input[value="attending"]');
    await page.click('button:has-text("キャンセル")');
    
    // フォームが閉じて、登録ボタンが再表示されることを確認
    await expect(page.locator('button:has-text("出欠を登録する")')).toBeVisible();
  });

  test('出欠登録なしでも参加者一覧が表示される', async ({ page }) => {
    await registerUser(page, participant);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠登録せずに参加者一覧を確認
    await expect(page.locator('h2:has-text("参加者一覧")')).toBeVisible();
    await expect(page.locator('text=まだ誰も出欠登録していません')).toBeVisible();
  });

  test('作成者も出欠登録できる', async ({ page }) => {
    await registerUser(page, creator);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 作成者でも出欠登録ボタンが表示されることを確認
    await expect(page.locator('button:has-text("出欠を登録する")')).toBeVisible();
    
    // 出欠登録
    await page.click('button:has-text("出欠を登録する")');
    await page.check('input[value="attending"]');
    await page.fill('textarea[name="comment"]', '主催者として参加します');
    await page.click('button:has-text("保存")');
    
    // 登録が成功することを確認
    await expect(page.locator('text=参加')).toBeVisible();
    await expect(page.locator('text=主催者として参加します')).toBeVisible();
  });

  test('必須項目が選択されていない場合はエラーが表示される', async ({ page }) => {
    await registerUser(page, participant);
    await page.click(`text=${testEvents.event1.title}`);
    
    // 出欠状況を選択せずに送信
    await page.click('button:has-text("出欠を登録する")');
    await page.click('button:has-text("保存")');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=出欠状況を選択してください')).toBeVisible();
  });
});