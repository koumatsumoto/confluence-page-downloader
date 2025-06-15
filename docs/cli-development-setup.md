# CLI開発環境セットアップガイド

このドキュメントでは、confluence-page-downloaderのCLI機能を開発環境で設定・テストする手順を説明します。

## 前提条件

- Node.js v24以上がインストールされていること
- npm がインストールされていること
- プロジェクトの依存関係がインストール済みであること

## CLI実装の概要

### 技術仕様

- **エントリーポイント**: `src/cli.mts`
- **コマンド名**: `cpdown`
- **使用技術**:
  - Node.js 24の`--experimental-strip-types`機能
  - TypeScriptファイル（`.mts`）を直接実行
  - `commander`パッケージによるコマンドライン引数解析

### ファイル構成

```
src/
├── cli.mts          # CLIエントリーポイント
├── main.mts         # 主要なダウンロード機能
├── config.mts       # 設定管理
├── confluence-client.mts  # Confluence API クライアント
└── file-writer.mts  # ファイル出力処理
```

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. CLIファイルの実行権限付与

```bash
chmod +x src/cli.mts
```

### 3. ローカル開発用のCLIコマンド作成

npm linkを使用してローカル環境にCLIコマンドを登録：

```bash
npm link
```

実行後、`cpdown`コマンドがグローバルに利用可能になります。

### 4. CLI動作確認

#### ヘルプ表示

```bash
cpdown --help
```

期待される出力：

```
Usage: cpdown [options] <url> [output]

Download Confluence pages as HTML or Markdown files

Arguments:
  url                Confluence page URL
  output             Output file path (optional)

Options:
  -V, --version      output the version number
  -f, --format <format>  Output format: html or md (default: "md")
  -h, --help         display help for command
```

#### バージョン表示

```bash
cpdown --version
```

期待される出力：

```
1.0.0
```

### 5. 環境変数の設定

実際のConfluence APIを使用してテストする場合は、以下の環境変数を設定：

```bash
export CONFLUENCE_BASE_URL="https://your-domain.atlassian.net/wiki"
export CONFLUENCE_USERNAME="your-username"
export CONFLUENCE_API_TOKEN="your-api-token"
```

## 開発時のテスト方法

### 1. 直接実行によるテスト

npm linkを使用せずに直接テストする場合：

```bash
node --experimental-strip-types src/cli.mts --help
```

### 2. 機能テスト

環境変数を設定後、実際のConfluence URLでテスト：

```bash
cpdown https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456
```

### 3. フォーマット指定テスト

```bash
# Markdown形式（デフォルト）
cpdown <URL> output.md

# HTML形式
cpdown <URL> output.html

# フォーマット明示指定
cpdown <URL> -f html
# または
cpdown <URL> --format md
```

## package.json設定

CLIとして機能させるために、`package.json`に以下の設定が必要：

```json
{
  "bin": {
    "cpdown": "./src/cli.mts"
  },
  "dependencies": {
    "commander": "^12.0.0"
  }
}
```

## トラブルシューティング

### shebang行のエラー

以下のエラーが発生する場合：

```
/usr/bin/env: 'node --experimental-strip-types': No such file or directory
```

**解決方法**: shebang行に`-S`オプションを追加

```bash
#!/usr/bin/env -S node --experimental-strip-types
```

### npm linkが動作しない

**症状**: `cpdown`コマンドが見つからない

**解決方法**:

1. npm unlinkでリセット: `npm unlink -g confluence-page-downloader`
2. 再度npm linkを実行: `npm link`

### 型エラーが発生する

**症状**: TypeScriptの型エラー

**解決方法**:

1. ビルドチェック: `npm run build`
2. テスト実行: `npm test`
3. 全体品質チェック: `npm run ci`

## 開発ワークフロー

### 1. CLIコードの修正後

```bash
# フォーマット
npm run fmt

# 品質チェック
npm run ci
```

### 2. 新機能追加後

```bash
# テスト追加・更新
# 対応するテストファイルを編集

# ドキュメント更新
# README.mdの使用例を更新

# 統合テスト
npm run ci
```

### 3. リリース準備

```bash
# バージョン更新
# package.jsonとsrc/cli.mtsのバージョンを同期

# 最終確認
npm run ci
cpdown --version
cpdown --help
```

## 注意事項

- Node.js 24の`--experimental-strip-types`は実験的機能のため、警告メッセージが表示されます
- 本番環境でのデプロイ時は、TypeScriptをビルドした`.js`ファイルの使用を検討してください
- CLI開発時は必ず`npm run ci`で品質確認を行ってください

## 参考情報

- [Node.js Type Stripping](https://nodejs.org/api/cli.html#--experimental-strip-types)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [npm link Documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
