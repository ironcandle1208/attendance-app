# Playwrightテスト実装の思考ログ

## 日時: 2025-06-22

## E2Eテスト実装の全体戦略

出欠確認Webアプリケーションに対して、Playwrightによる包括的なE2Eテストスイートを実装しました。

## テスト設計の基本方針

### 1. テストピラミッドに基づく設計

**E2Eテストの役割**:
- ユーザージャーニー全体の検証
- ブラウザ間の互換性確認
- リアルな使用シナリオでの動作検証
- UI/UX の実際の体験テスト

**対象範囲**:
- 認証フロー（登録・ログイン・ログアウト）
- イベント管理（作成・削除・一覧表示）
- 出欠管理（登録・更新・一覧・統計）
- レスポンシブデザイン（モバイル・タブレット・デスクトップ）

### 2. テストケース設計の思考プロセス

#### A. ユーザーストーリーベースのテストケース

**認証機能**:
```
As a ユーザー
I want to アカウントを作成できる
So that アプリケーションを利用できる
```

**実装したテストケース**:
- 正常なユーザー登録フロー
- バリデーションエラー（無効メール・短いパスワード）
- 登録後の自動ログイン
- 既存ユーザーのログイン
- ログアウト機能

#### B. ビジネスロジックの検証

**イベント管理**:
- 未来日時のみ許可する制約
- 作成者のみ削除可能な権限制御
- リアルタイムプレビュー機能

**出欠管理**:
- 1ユーザー1イベント1出欠の制約
- 出欠状況の統計計算
- 参加者一覧の表示順序

## テスト実装の技術的詳細

### 1. テスト環境の構築

```typescript
// playwright.config.ts
webServer: [
  {
    command: 'cd ../frontend && npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'cd ../backend && uvicorn app.main:app --reload --port 8000',
    port: 8000,
    reuseExistingServer: !process.env.CI,
  },
],
```

**設計判断**:
- **自動サーバー起動**: テスト実行時にフロントエンド・バックエンドを自動起動
- **CI/CD対応**: 本番環境とローカル環境での動作切り替え
- **ポート管理**: 開発環境と同じポート番号を使用

### 2. テストデータ管理戦略

```typescript
// fixtures/test-data.ts
export const testUsers = {
  user1: {
    name: 'テストユーザー1',
    email: 'test1@example.com',
    password: 'password123',
  },
  // ...
};
```

**データ管理の原則**:
- **分離性**: 各テストが独立して実行可能
- **一意性**: タイムスタンプを使用したユニークなデータ生成
- **再利用性**: 共通のテストデータを fixtures で管理

### 3. ヘルパー関数の設計

```typescript
// utils/auth-helpers.ts
export async function registerUser(page: Page, userData: typeof testUsers.user1) {
  await page.goto('/register');
  // ... フォーム入力
  await page.click('button[type="submit"]');
  // ... 成功確認
}
```

**ヘルパー設計の考慮事項**:
- **再利用性**: 複数のテストで共通して使用される操作
- **保守性**: UIの変更時に1箇所だけ修正すれば済む
- **可読性**: テストコードの意図が明確になる

## テスト分類と実装戦略

### 1. 認証機能テスト (`auth.spec.ts`)

**実装したテストケース**:

#### 正常系テスト
- ユーザー登録の成功フロー
- 登録済みユーザーのログイン
- ログアウト機能

#### 異常系テスト
- 無効なメールアドレスでの登録
- 短いパスワードでの登録
- 間違ったパスワードでのログイン

#### セキュリティテスト
- 未認証状態での保護されたページアクセス
- ログアウト後の状態確認

**実装の工夫**:
```typescript
const uniqueUser = {
  ...testUsers.user1,
  email: `test-${Date.now()}@example.com`,
};
```
- タイムスタンプによるユニークなメールアドレス生成
- テスト間のデータ競合を回避

### 2. イベント管理テスト (`events.spec.ts`)

**実装したテストケース**:

#### CRUD操作
- イベント作成（正常系・異常系）
- イベント削除（権限制御含む）
- イベント一覧表示

#### UX機能
- リアルタイムプレビュー
- フォームバリデーション
- ナビゲーション

#### ビジネスルール
- 過去日時での作成制限
- 作成者のみ削除可能

**特に考慮した点**:
```typescript
test('過去の日時では作成できない', async ({ page }) => {
  // ... 過去日時を入力
  await expect(page.locator('text=未来の日時を選択してください')).toBeVisible();
});
```
- ビジネスルールの確実な検証
- エラーメッセージの正確性確認

### 3. 出欠管理テスト (`attendance.spec.ts`)

**実装したテストケース**:

#### 出欠登録機能
- 初回出欠登録
- 出欠状況の変更
- コメント機能

#### 一覧・統計機能
- 参加者一覧表示
- 出欠状況統計
- 自分の出欠強調表示

#### 複雑なシナリオ
- 複数ユーザーでの出欠登録
- 作成者の出欠登録
- 統計数値の正確性検証

**技術的な工夫**:
```typescript
test.beforeEach(async ({ browser }) => {
  // 作成者でイベントを作成
  const page1 = await browser.newPage();
  await registerUser(page1, creator);
  // ... イベント作成
  await page1.close();
});
```
- 複数ブラウザコンテキストを使用した複雑なセットアップ
- テスト間の状態共有の適切な管理

### 4. レスポンシブデザインテスト (`responsive.spec.ts`)

**実装したテストケース**:

#### デバイス別テスト
- モバイル（iPhone 12）
- タブレット（iPad Pro）  
- デスクトップ
- カスタム画面サイズ

#### インタラクション
- タッチイベント
- 画面サイズ変更時の適応
- レイアウト崩れの検証

**実装の特徴**:
```typescript
const context = await browser.newContext({ ...devices['iPhone 12'] });
const page = await context.newPage();
```
- Playwright の devices 設定を活用
- 実際のデバイス環境に近いテスト

## テストの品質向上策

### 1. 待機戦略

```typescript
await expect(page.locator('text=ログイン')).toBeVisible();
```

**考慮事項**:
- **動的コンテンツ**: React の状態変更を適切に待機
- **API呼び出し**: 非同期処理の完了を確認
- **アニメーション**: CSS トランジションの考慮

### 2. セレクタ戦略

**優先順位**:
1. `text=` セレクタ（ユーザーが実際に見る内容）
2. `role=` セレクタ（アクセシビリティ準拠）
3. `data-testid` 属性（テスト専用）
4. CSS セレクタ（最後の手段）

**理由**:
- UIの変更に対する耐性
- 実際のユーザー操作に近い
- アクセシビリティの向上

### 3. エラーハンドリング

```typescript
test('間違ったパスワードでログインできない', async ({ page }) => {
  // ... 間違ったパスワードでログイン試行
  await expect(page.locator('text=ログインに失敗しました')).toBeVisible();
});
```

**実装方針**:
- エラーメッセージの正確な検証
- ユーザーフレンドリーなエラー表示の確認
- システムの堅牢性テスト

## CI/CD統合の考慮

### 1. パフォーマンス最適化

```typescript
// playwright.config.ts
fullyParallel: true,
workers: process.env.CI ? 1 : undefined,
retries: process.env.CI ? 2 : 0,
```

**設定理由**:
- **並列実行**: ローカル環境での高速化
- **CI制限**: CI環境でのリソース制約に配慮
- **リトライ**: ネットワークの不安定性に対応

### 2. レポート機能

```typescript
reporter: 'html',
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
```

**デバッグ支援**:
- 失敗時のスクリーンショット自動保存
- ビデオ録画による操作履歴
- トレース機能による詳細ログ

## テスト実行環境の多様性

### 1. ブラウザエンジン対応

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
],
```

**クロスブラウザテストの意義**:
- エンジン固有のバグ検出
- 実際のユーザー環境での動作保証
- CSS/JavaScript の互換性確認

### 2. モバイル対応検証

**重要な検証項目**:
- タッチイベントの動作
- 画面サイズへの適応
- パフォーマンス（モバイル環境特有）

## テストの保守性向上

### 1. Page Object Model の簡易版

```typescript
// utils/auth-helpers.ts
export async function loginUser(page: Page, userData: typeof testUsers.user1) {
  // ログイン操作を関数化
}
```

**メリット**:
- UI変更時の修正箇所を最小化
- テストコードの重複削除
- 新しいテストケース追加の効率化

### 2. テストデータの管理

```typescript
// fixtures/test-data.ts
export const testEvents = {
  event1: { /* ... */ },
  pastEvent: { /* バリデーションテスト用 */ },
};
```

**設計思想**:
- 用途別のテストデータ分類
- 再利用可能なデータ構造
- テストの意図を明確にする命名

## 今後の拡張可能性

### 1. 追加可能なテストケース

**パフォーマンステスト**:
- ページロード時間の測定
- 大量データでの動作検証
- メモリリーク検出

**アクセシビリティテスト**:
- スクリーンリーダー対応
- キーボードナビゲーション
- カラーコントラスト

### 2. 高度なテストシナリオ

**ネットワーク障害**:
- オフライン状態での動作
- 接続不良時の挙動
- API障害時のフォールバック

**セキュリティテスト**:
- XSS脆弱性
- CSRF攻撃耐性
- 認証バイパス試行

## 学びと成果

### 1. 効果的だった実装パターン

**データドリブンテスト**:
```typescript
const statuses = ['attending', 'not_attending', 'maybe'];
for (let i = 0; i < users.length; i++) {
  // 各ユーザーで異なる出欠状況を登録
}
```

**複数コンテキスト活用**:
- 異なるユーザーセッションの同時管理
- 複雑なインタラクションの検証

### 2. 直面した課題と解決策

**課題**: 非同期処理の適切な待機
**解決策**: Playwright の `expect().toBeVisible()` を活用

**課題**: テストデータの競合
**解決策**: タイムスタンプによるユニークID生成

**課題**: レスポンシブテストの複雑性
**解決策**: デバイス設定の体系的な活用

## 品質保証への貢献

### 1. 早期バグ検出

- UI/UXの一貫性確認
- ブラウザ間の動作差異検出
- リグレッション防止

### 2. 継続的品質改善

- 自動化による効率的なテスト実行
- CI/CDパイプラインとの統合
- 開発チームへのフィードバック提供

## まとめ

出欠確認Webアプリケーションに対して、包括的なE2Eテストスイートを実装しました。このテストスイートにより、以下が実現できます：

✅ **ユーザージャーニーの完全検証**
✅ **クロスブラウザ・クロスデバイス対応**
✅ **継続的品質保証の自動化**
✅ **リグレッション防止**
✅ **開発効率の向上**

Playwrightの強力な機能を活用し、実際のユーザー体験に近いテスト環境を構築することで、高品質なWebアプリケーションの開発・運用をサポートできる体制が整いました。