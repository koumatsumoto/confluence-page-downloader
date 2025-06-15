# リリースプロセス

この文書は confluence-page-downloader パッケージのリリースプロセスについて説明します。

## バージョンアップ・タグ付け手順

リリース時には以下コマンドで version を上げてタグ付けします：

```sh
npm version [patch|minor|major] -m "chore(release): publish version %s"
```

開発時のリリースコマンド

```sh
npm version major -m "chore(release): publish version %s"
npm version minor -m "chore(release): publish version %s"
npm version patch -m "chore(release): publish version %s"
```

## 前提条件

1. GitHub リポジトリの設定で `NPM_TOKEN` シークレットが設定されていること
2. main ブランチですべてのテストが通ることを確認済みであること
3. `package.json` のバージョン番号を更新済みであること

## リリース手順

### 1. リリース準備

1. `package.json` のバージョンを [セマンティックバージョニング](https://semver.org/) に従って更新する
2. 該当する場合は `CHANGELOG.md` に新バージョンの変更内容を記載する
3. これらの変更を main ブランチにコミットする

### 2. リリースタグの作成とプッシュ

```bash
# バージョン番号でタグを作成（例: v1.0.0）
git tag v1.0.0

# タグを GitHub にプッシュ
git push origin v1.0.0
```

### 3. 自動リリースプロセス

タグがプッシュされると、GitHub Actions が自動的に以下を実行します：

1. test ジョブを実行してすべてのテストが通ることを確認
2. テストが通った場合、publish ジョブを実行して NPM にパッケージをリリース

### 4. リリースの確認

1. GitHub Actions のワークフロー実行が正常に完了したことを確認する
2. [npmjs.com](https://www.npmjs.com/package/confluence-page-downloader) でパッケージが利用可能になったことを確認する

## NPM トークンの設定

自動パブリッシュのための NPM トークンを設定するには：

1. [NPM アカウント設定](https://www.npmjs.com/settings/tokens) にアクセス
2. "Automation" タイプの新しいアクセストークンを作成
3. GitHub リポジトリの設定で `NPM_TOKEN` という名前のシークレットとしてトークンを追加

## トラブルシューティング

### よくある問題

- **NPM_TOKEN not found**: GitHub リポジトリ設定でシークレットが正しく設定されているか確認
- **Permission denied**: NPM トークンが正しい権限を持っているか確認
- **Version already exists**: そのバージョン番号が既にパブリッシュされていないか確認

### 手動リリース

自動リリースが失敗した場合は、手動でパブリッシュできます：

```bash
npm login
npm publish
```
