import { Page, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

export async function registerUser(page: Page, userData: typeof testUsers.user1) {
  await page.goto('/register');
  
  await page.fill('input[name="name"]', userData.name);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  
  await page.click('button[type="submit"]');
  
  // 登録成功後、ダッシュボードにリダイレクトされることを確認
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=こんにちは、' + userData.name + 'さん')).toBeVisible();
}

export async function loginUser(page: Page, userData: typeof testUsers.user1) {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  
  await page.click('button[type="submit"]');
  
  // ログイン成功後、ダッシュボードにリダイレクトされることを確認
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=こんにちは、' + userData.name + 'さん')).toBeVisible();
}

export async function logoutUser(page: Page) {
  await page.click('button:has-text("ログアウト")');
  
  // ログアウト後、ログインページにリダイレクトされることを確認
  await expect(page).toHaveURL('/login');
}

// テストデータのクリーンアップ用
export async function clearTestData(page: Page) {
  // 本来はAPIを直接呼び出してデータベースをクリーンアップするが、
  // 簡易版として画面操作でクリーンアップ
  await page.goto('/');
  
  // 存在する全てのテストイベントを削除
  const eventLinks = page.locator('a[href*="/events/"]');
  const count = await eventLinks.count();
  
  for (let i = 0; i < count; i++) {
    await eventLinks.first().click();
    
    // 削除ボタンが存在する場合（作成者の場合）
    const deleteButton = page.locator('button:has-text("削除")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // 確認ダイアログで削除を承認
      page.on('dialog', dialog => dialog.accept());
      
      await expect(page).toHaveURL('/');
    } else {
      await page.goto('/');
    }
  }
}