import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';
import { registerUser, loginUser, logoutUser } from '../utils/auth-helpers';

test.describe('認証機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にログアウト状態にする
    await page.goto('/');
  });

  test('ユーザー登録ができる', async ({ page }) => {
    const uniqueUser = {
      ...testUsers.user1,
      email: `test-${Date.now()}@example.com`,
    };
    
    await registerUser(page, uniqueUser);
    
    // ダッシュボードが表示されることを確認
    await expect(page.locator('h1:has-text("出欠管理アプリ")')).toBeVisible();
    await expect(page.locator('h2:has-text("イベント一覧")')).toBeVisible();
  });

  test('無効なメールアドレスで登録できない', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible();
  });

  test('短いパスワードで登録できない', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=パスワードは6文字以上で入力してください')).toBeVisible();
  });

  test('登録済みユーザーでログインできる', async ({ page }) => {
    // まず新しいユーザーを登録
    const uniqueUser = {
      ...testUsers.user1,
      email: `login-test-${Date.now()}@example.com`,
    };
    
    await registerUser(page, uniqueUser);
    await logoutUser(page);
    
    // 登録したユーザーでログイン
    await loginUser(page, uniqueUser);
    
    // ダッシュボードが表示されることを確認
    await expect(page.locator('h2:has-text("イベント一覧")')).toBeVisible();
  });

  test('間違ったパスワードでログインできない', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=ログインに失敗しました')).toBeVisible();
  });

  test('ログアウトできる', async ({ page }) => {
    const uniqueUser = {
      ...testUsers.user1,
      email: `logout-test-${Date.now()}@example.com`,
    };
    
    await registerUser(page, uniqueUser);
    await logoutUser(page);
    
    // ログインページに遷移していることを確認
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2:has-text("ログイン")')).toBeVisible();
  });

  test('未認証状態では保護されたページにアクセスできない', async ({ page }) => {
    await page.goto('/');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login');
  });

  test('登録ページとログインページ間の遷移ができる', async ({ page }) => {
    await page.goto('/login');
    
    // 登録ページへのリンクをクリック
    await page.click('text=アカウントをお持ちでない方はこちら');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2:has-text("アカウント作成")')).toBeVisible();
    
    // ログインページへのリンクをクリック
    await page.click('text=すでにアカウントをお持ちの方はこちら');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2:has-text("ログイン")')).toBeVisible();
  });
});