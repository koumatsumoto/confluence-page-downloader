confluence-page-downloader

confluence-page-downloaderは、Confluence APIを通じて指定ページのコンテンツを取得し、HTMLまたはMarkdown形式で保存できるTypeScript/Node.js製のコマンドラインツールです。

主な機能

Confluenceページを指定してコンテンツを取得

HTML／Markdown形式でファイル出力

デフォルトの保存ファイル名にページIDを使用

環境変数による認証情報設定

シンプルなコマンド操作


必須要件

Node.js v22以上

npm


インストール

npm install -g confluence-page-downloader

環境変数設定

export CONFLUENCE_BASE_URL="https://xxx.atlassian.net/wiki"
export CONFLUENCE_USERNAME="your-username"
export CONFLUENCE_API_TOKEN="your-api-token"

使い方

cpdown <ConfluenceページのURL> [保存先ファイルパス]

保存先ファイルパスを省略した場合、ページIDを <ページID>.md または <ページID>.html としてカレントディレクトリに保存します。

拡張子に応じて出力形式を自動判定します。


例：ファイル名省略（ページID: 123456）

cpdown https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456
# -> カレントディレクトリに 123456.md または 123456.html が作成されます

例：任意のパス指定

cpdown https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456 ./docs/custom.md

オプション

--format <html|markdown>   出力形式を明示的に指定 (省略時は拡張子またはデフォルト設定を参照)
--help                     使用方法の表示
--version                  バージョン情報の表示

開発・テスト

git clone https://github.com/your-org/confluence-page-downloader.git
cd confluence-page-downloader
npm install
npm run build
npm test

貢献

バグ報告、機能追加の提案、プルリクエストを歓迎します。Issueを立ててからPRをお送りください。

ライセンス

MIT
