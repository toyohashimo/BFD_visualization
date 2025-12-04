# BFD Analytics Documentation

**最終更新**: 2025-12-05

BFD Analytics（Brand Funnel Dashboard）の包括的なドキュメンテーションへようこそ。

## 📖 クイックナビゲーション

### ユーザー向け
- **[ユーザーマニュアル](01_overview/USER_MANUAL.md)** - 完全な使用ガイド
- **[クイックスタート](03_guides/quick_start.md)** - 5分で始める
- **[トラブルシューティング](05_troubleshooting/)** - よくある問題の解決

### 開発者向け
- **[技術仕様書](01_overview/technical_spec.md)** - システムアーキテクチャ
- **[新モード追加方法](04_development/adding_new_mode.md)** - 拡張ガイド
- **[変更履歴](06_changelog/CHANGELOG.md)** - バージョン履歴

## 📁 ドキュメント構成

### [01_overview/](01_overview/) - プロジェクト概要
プロジェクトの全体像を理解するための基本ドキュメント
- `requirements.md` - 要件定義書
- `specification.md` - 仕様書
- `technical_spec.md` - 技術仕様書
- `data_structure.md` - Excelデータ構造
- `USER_MANUAL.md` - ユーザーマニュアル

### [02_features/](02_features/) - 機能別ドキュメント
各機能の詳細説明
- **[modes/](02_features/modes/)** - 全23の分析モード
  - `detailed_analysis/` - 詳細分析モード (Mode 1-14)
  - `historical_comparison/` - 過去比較モード (Mode 1-9)
- **[data_management/](02_features/data_management/)** - データ管理機能
- **[visualization/](02_features/visualization/)** - 可視化機能
- **[ai_summary/](02_features/ai_summary/)** - AI要約機能

### [03_guides/](03_guides/) - 使い方ガイド
実践的な使用方法とベストプラクティス
- クイックスタート
- 詳細分析ガイド
- 過去比較ガイド
- ベストプラクティス

### [04_development/](04_development/) - 開発者ガイド
開発者向けの技術情報
- アーキテクチャ概要
- 新機能の追加方法
- テストガイド
- コントリビューションガイド

### [05_troubleshooting/](05_troubleshooting/) - トラブルシューティング
問題解決とFAQ

### [06_changelog/](06_changelog/) - 変更履歴
バージョン履歴と更新情報

### [07_archive/](07_archive/) - アーカイブ
過去の実装記録と歴史的資料

## 🎯 目的別ガイド

### 初めての方
1. [ユーザーマニュアル](01_overview/USER_MANUAL.md) で全体像を把握
2. [クイックスタート](03_guides/quick_start.md) で基本操作を学習
3. [分析モード一覧](02_features/modes/) で使いたい機能を探す

### マーケター・アナリスト
1. [仕様書](01_overview/specification.md) で各モードの使い方を確認
2. [詳細分析ガイド](03_guides/detailed_analysis_guide.md) で分析手法を学習
3. [ベストプラクティス](03_guides/best_practices.md) で効果的な活用法を習得

### 開発者
1. [技術仕様書](01_overview/technical_spec.md) でアーキテクチャを理解
2. [開発者ガイド](04_development/) で開発方法を確認
3. [変更履歴](06_changelog/CHANGELOG.md) で最新の更新を把握

## 🚀 主要機能

### 分析モード
- **詳細分析**: 14種類のモードで多角的なブランド分析
- **過去比較**: 9種類のモードで時系列トレンド分析
- **AI要約**: 各分析結果を自動要約

### データ管理
- **匿名化機能**: DEMOモードでデータプライバシー保護
- **ブランド名正規化**: 表記ゆれの自動補正
- **複数データソース**: 最大3ファイルの同時比較

### 可視化
- **4種類のグラフ**: 縦棒、横棒、折れ線、レーダー
- **10種類のカラーテーマ**: 用途に応じたカラーパレット
- **エクスポート機能**: PNG画像・CSV形式での出力

## 📝 ドキュメント更新履歴

| 日付 | 変更内容 |
|:---|:---|
| 2025-12-05 | ドキュメント構造を全面的に再編成。7階層構造に整理し、66ファイルを40-45ファイルに統合 |
| 2025-12-01 | 過去比較モード（Mode 1-9）完全実装 |
| 2025-11-29 | アーキタイプ分析（Mode 13-14）追加 |
| 2025-11-28 | ブランドパワー分析（Mode 9-12）追加 |

## 🔗 関連リンク

- **リポジトリ**: [GitHub](../)
- **課題報告**: [Issues](../issues)
- **プロジェクトルートREADME**: [../README.md](../README.md)

## 📄 ライセンス

このドキュメントはBFD Analyticsプロジェクトの一部として提供されています。

---

**Note**: ドキュメントに関するフィードバックや改善提案は、プロジェクトリポジトリのIssueセクションでお願いします。
