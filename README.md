# confluence-page-downloader

confluence-page-downloader は、Confluence API を通じて指定ページのコンテンツを取得し、HTML または Markdown 形式で保存できる TypeScript/Node.js 製のコマンドラインツールです。

## 主な機能

- Confluence ページを指定してコンテンツを取得
- HTML／Markdown 形式でファイル出力
- デフォルトの保存ファイル名にページ ID を使用
- 環境変数による認証情報設定
- シンプルなコマンド操作

## 必須要件

- Node.js v22 以上
- npm

## インストール

```bash
npm install -g confluence-page-downloader
```

## 環境変数設定

```bash
export CONFLUENCE_BASE_URL="https://xxx.atlassian.net/wiki"
export CONFLUENCE_USERNAME="your-username"
export CONFLUENCE_API_TOKEN="your-api-token"
```

## 使い方

```bash
cpdown <ConfluenceページのURL> [保存先ファイルパス]
```

保存先ファイルパスを省略した場合、ページ ID を `<ページID>.md` または `<ページID>.html` としてカレントディレクトリに保存します。

拡張子に応じて出力形式を自動判定します。

### 例：ファイル名省略（ページ ID: 123456）

```bash
cpdown https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456
# -> カレントディレクトリに 123456.md または 123456.html が作成されます
```

### 例：任意のパス指定

```bash
cpdown https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456 ./docs/custom.md
```

## オプション

- `--format <html|markdown>` : 出力形式を明示的に指定 (省略時は拡張子またはデフォルト設定を参照)
- `--help` : 使用方法の表示
- `--version` : バージョン情報の表示

## 開発・テスト

```bash
git clone https://github.com/your-org/confluence-page-downloader.git
cd confluence-page-downloader
npm install
npm run build
npm test
```

## 貢献

バグ報告、機能追加の提案、プルリクエストを歓迎します。Issue を立ててから PR をお送りください。

## ライセンス

MIT
