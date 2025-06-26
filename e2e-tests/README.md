# 出欠確認アプリ E2Eテスト

PlaywrightによるE2Eテストスイートです。

## セットアップ

```bash
# E2Eテストディレクトリに移動
cd e2e-tests

# 依存関係をインストール
npm install

# Playwrightブラウザをインストール
npm run install-browsers
```

## テスト実行

```bash
# 全テストを実行
npm test

# ヘッド付きモードで実行（ブラウザが表示される）
npm run test:headed

# デバッグモードで実行
npm run test:debug

# UIモードで実行（Playwright Test UI）
npm run test:ui

# テストレポートを表示
npm run report
```

## テストスイート構成

### 1. 認証機能テスト (`auth.spec.ts`)
- ユーザー登録
- ログイン・ログアウト
- バリデーション
- 認証状態の確認

### 2. イベント管理テスト (`events.spec.ts`)
- イベント作成・削除
- フォームバリデーション
- ダッシュボード表示
- ナビゲーション

### 3. 出欠管理テスト (`attendance.spec.ts`)
- 出欠登録・更新
- 参加者一覧表示
- 出欠状況統計
- 権限制御

### 4. レスポンシブデザインテスト (`responsive.spec.ts`)
- モバイル・タブレット・デスクトップ対応
- タッチデバイス対応
- 画面サイズ変更時の動作

## テスト環境

- **フロントエンド**: http://localhost:5173
- **バックエンド**: http://localhost:8000
- **自動起動**: `playwright.config.ts`で設定済み

## 対応ブラウザ

- Chrome (Desktop)
- Firefox (Desktop)
- Safari (Desktop)
- Chrome (Mobile)
- Safari (Mobile)

## テストデータ

`fixtures/test-data.ts`にテスト用のユーザーとイベントデータを定義。

## ヘルパー関数

`utils/auth-helpers.ts`に認証関連のヘルパー関数を実装：
- `registerUser()` - ユーザー登録
- `loginUser()` - ユーザーログイン
- `logoutUser()` - ログアウト
- `clearTestData()` - テストデータクリーンアップ

## CI/CD対応

- 並列実行設定
- リトライ機能
- スクリーンショット・動画記録
- HTMLレポート生成

## 注意事項

- テスト実行前にアプリケーションが起動していることを確認
- 各テストは独立して実行されるため、テストデータの競合を避けるためにユニークなメールアドレスを使用
- モバイルテスト実行時はタッチイベントが正しく動作することを確認