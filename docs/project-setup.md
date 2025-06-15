# プロジェクトセットアップ

## 概要

このプロジェクトは、ESモジュール（`package.json`に`"type": "module"`を設定）として構成されたTypeScriptアプリケーションです。

Confluence API v2を使用してページコンテンツを取得し、HTML/Markdown形式で保存する機能を提供します。

## 機能

- **設定管理** (`config.mts`) - 環境変数による認証情報管理
- **Confluence APIクライアント** (`confluence-client.mts`) - ページ取得機能
- **ファイル保存** (`file-writer.mts`) - HTML/Markdown形式でのファイル保存
- **メイン機能** (`main.mts`) - ページダウンロードの統合機能

## API仕様

### 環境変数

以下の環境変数が必要です：

- `CONFLUENCE_USER_EMAIL`: ユーザーのメールアドレス
- `CONFLUENCE_API_TOKEN`: API トークン

**注意**: `CONFLUENCE_BASE_URL` は削除されました。CLI実行時に引数として指定されたURLから自動的にベースURLが抽出されます。

### 主要な関数

#### `downloadPage(options: DownloadOptions)`

Confluenceページをダウンロードしてファイルとして保存します。

```typescript
interface DownloadOptions {
  url: string; // Confluence ページのURL
  outputPath?: string; // 出力先ファイルパス（省略時は自動生成）
  format?: OutputFormat; // 出力形式 ('html' | 'markdown')
}
```

#### `extractPageId(url: string)`

Confluence URLからページIDを抽出します。

#### `fetchConfluencePage(config, pageId)`

指定されたページIDのコンテンツをConfluence APIから取得します。

#### `savePageToFile(page, filePath, format?)`

ページデータを指定された形式でファイルに保存します。

## 依存関係

プロジェクトでは以下の依存関係を使用しています：

- **TypeScript**: `typescript@5.8.3` - TypeScriptコンパイラ
- **@types/node**: `@types/node@24.0.1` - Node.jsの型定義
- **Vitest**: `vitest@3.2.3` - テストフレームワーク
- **@vitest/coverage-v8**: `@vitest/coverage-v8@3.2.3` - Vitestのカバレッジレポート
- **Prettier**: `prettier@3.5.3` - コードフォーマッター

## 主要な設定

### ESモジュール設定

このプロジェクトはESモジュールとして設定されています：

- `package.json`に`"type": "module"`を含む
- CommonJS（`require`/`module.exports`）ではなくESモジュール構文（`import`/`export`）を使用
- TypeScriptはESモジュールにコンパイルされる

### ts-nodeを使用しない設定

このプロジェクトでは、TypeScriptの直接実行に**ts-nodeを使用しません**。代わりに：

- TypeScriptファイルを`tsc`でJavaScriptにコンパイル
- コンパイルされたJavaScriptファイルをNode.jsで実行

### 実行方法

アプリケーションを実行するには：

```bash
npm start
```

このコマンドは以下を実行します：

1. TypeScriptファイルをJavaScriptにコンパイル
2. コンパイルされたJavaScriptをNode.jsで実行

## 重要な注意点

### Node.jsのType Stripping機能について

`npm start`実行時に以下の警告が表示される場合があります：

```
(node:xxxx) ExperimentalWarning: Type Stripping is an experimental feature and might change at any time
```

**この警告について：**

- Node.jsがTypeScriptファイルを直接実行する実験的機能を使用しているため表示されます
- 機能的な問題はなく、アプリケーションは正常に動作します
- 将来のNode.jsバージョンでこの機能が変更される可能性があります

### ESモジュールでの直接実行判定

ESモジュールでは、ファイルが直接実行されたかの判定方法が異なります：

**CommonJS（使用不可）:**

```javascript
if (require.main === module) {
  main();
}
```

**ESモジュール（使用）:**

```javascript
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

## 開発ワークフロー

1. `src/`ディレクトリにTypeScriptコードを記述
2. `npm start`でコンパイル・実行
3. `npm test`でテスト実行
4. `npm run fmt`でコードフォーマット
5. `npm run ci`で全チェック実行

### テストフレームワーク設定

このプロジェクトではテストフレームワークとして**Vitest**を使用しています：

- `vitest.config.ts`で設定を管理
- Node.js環境でテストを実行
- グローバルAPIを有効化（`describe`, `test`, `expect`などが自動でインポート）
- カバレッジレポート機能（v8エンジン使用）
- TypeScriptファイルを直接テスト可能

**主要な設定項目：**

```typescript
export default defineConfig({
  test: {
    environment: "node", // Node.js環境で実行
    globals: true, // グローバルAPIを有効化
    include: ["src/**/*.test.{ts,mts}"], // テストファイルのパターン
    coverage: {
      reporter: ["text", "json", "html"], // カバレッジレポート形式
    },
  },
});
```

**テスト実行方法：**

```bash
npm test               # テスト実行（カバレッジ付き）
npm run test:watch     # ウォッチモードでテスト実行
```
