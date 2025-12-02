# BFD Analytics - ドキュメント一覧

## 📚 ドキュメント索引

このディレクトリには、BFD Analyticsの各種ドキュメントがカテゴリ別に整理されています。

---

## 📁 ドキュメント構成

```
docs/
├── 📄 README_DOCS.md                    (本ファイル)
├── 📘 USER_MANUAL.md                    取扱説明書（エンドユーザー向け）
│
├── 📋 requirements/                     要件定義
│   ├── requirements_definition.md       要件定義書
│   ├── technical_specification.md       技術仕様書
│   ├── specification.md                 仕様書
│   ├── sample_excel_structure.md        Excelフォーマット説明
│   ├── mode*_requirements.md            各モードの要件定義
│   └── HISTORICAL_*_REQUIREMENTS.md     過去比較モードの要件定義
│
├── 🔨 implementation/                   実装関連
│   ├── HISTORICAL_MODE*_IMPLEMENTATION_REPORT.md  過去比較モード実装報告書
│   ├── HISTORICAL_MODE*_IMPLEMENTATION.md         過去比較モード実装詳細
│   ├── mode*_implementation_summary.md            各モード実装サマリー
│   ├── MODE1-5_COMPLETE_REPORT.md                  Mode 1-5完全報告書
│   └── ブランド名表記ゆれ_実装*.md                 ブランド名表記ゆれ実装関連
│
├── 📖 guides/                          ガイド・マニュアル
│   ├── HISTORICAL_MODES_MASTER_GUIDE.md            過去比較モード完全ガイド
│   ├── HISTORICAL_MODES_IMPLEMENTATION_GUIDE.md    過去比較モード実装ガイド
│   ├── HISTORICAL_MODE2_COMPLETE_GUIDE.md          Mode 2完全実装ガイド
│   ├── HISTORICAL_COMPARISON_SUMMARY.md            過去比較モードサマリー
│   ├── HISTORICAL_MODE4-9_IMPLEMENTATION_PLAN.md   Mode 4-9実装計画
│   ├── HISTORICAL_MODE8_SUMMARY.md                 Mode 8サマリー
│   └── ブランド名表記ゆれ解決策.md                  ブランド名表記ゆれ解決策
│
├── 📝 changelog/                       変更履歴
│   └── CHANGELOG.md                    変更履歴
│
├── 🔧 troubleshooting/                 トラブルシューティング
│   ├── troubleshooting_graph_not_showing.md        グラフ表示問題
│   ├── ERROR_FIX_REPORT.md                         エラー修正報告
│   └── POST_REFACTORING_FIXES.md                   リファクタリング後修正
│
├── 🔄 refactoring/                     リファクタリング関連
│   ├── APP_REFACTORING_DETAIL.md                   アプリリファクタリング詳細
│   └── LOCALSTORAGE_MIGRATION.md                    LocalStorage移行
│
└── ⭐ features/                        機能別ドキュメント
    ├── archetype_analysis_requirements.md           アーキタイプ分析要件
    ├── brand_power_analysis_summary.md              ブランドパワー分析概要
    ├── demo_mode_restriction.md                     DEMOモード制限
    ├── HISTORICAL_UX_IMPROVEMENTS.md               過去比較モードUX改善
    └── mode11_final_report.md                       Mode 11最終報告
```

---

## 📖 主要ドキュメント

### 基本ドキュメント

#### [要件定義書](requirements/requirements_definition.md)
- **対象読者**: プロジェクトオーナー、ステークホルダー、開発チーム
- **内容**: プロジェクトの目的、機能要件、非機能要件、制約事項
- **最終更新**: 2025-11-29 (v2.3)

#### [仕様書](requirements/specification.md)
- **対象読者**: ユーザー、QAエンジニア、サポート担当
- **内容**: 全12モードの詳細、UI構成、操作方法、データ構造
- **最終更新**: 2025-11-29 (v2.5)

#### [技術仕様書](requirements/technical_specification.md)
- **対象読者**: 開発者、アーキテクト
- **内容**: システム概要、技術スタック、アーキテクチャ設計、データフロー
- **最終更新**: 2025-11-29 (v2.3)

#### [README.md](../README.md)
- **対象読者**: すべてのユーザー
- **内容**: プロジェクト概要、セットアップ、使用方法、更新履歴
- **最終更新**: 2025-11-29 (v2.3)

#### [取扱説明書](USER_MANUAL.md)
- **対象読者**: エンドユーザー、マーケティング担当者、データアナリスト
- **内容**: アプリケーションの完全な使用方法、全20モードの詳細説明、Excelファイルの準備方法、トラブルシューティング
- **最終更新**: 2025-12-01 (v3.0.0-beta)

---

## 🔧 技術ドキュメント

### データ関連

#### [Excelフォーマット説明](requirements/sample_excel_structure.md)
- **対象読者**: データ準備担当者、開発者
- **内容**: Excelファイルの構造、必須フォーマット、列定義
- **最終更新**: 2025-11-26

### トラブルシューティング

#### [グラフが表示されない問題の解決](troubleshooting/troubleshooting_graph_not_showing.md)
- **対象読者**: ユーザー、サポート担当
- **内容**: グラフ表示問題の診断手順、解決方法、よくある原因
- **最終更新**: 2025-11-28

---

## 📊 機能別ドキュメント

### 過去比較モード（Historical Comparison Mode）

#### [過去比較モード完全ガイド](guides/HISTORICAL_MODES_MASTER_GUIDE.md)
- **対象読者**: 開発者、次のモード実装担当者
- **内容**: Mode 1-5の実装パターン、ベストプラクティス、完全な実装ガイド
- **最終更新**: 2025-11-30

#### [Mode 1 実装報告書](implementation/HISTORICAL_MODE1_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: 基盤構築の詳細、遭遇した問題と解決策、アーキテクチャ設計
- **最終更新**: 2025-11-30

#### [Mode 2 実装報告書](implementation/HISTORICAL_MODE3_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: 設定駆動型の実証、実装時間5分の達成、Mode 1との差分
- **最終更新**: 2025-11-30

#### [Mode 3 実装報告書](implementation/HISTORICAL_MODE5_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: ブランドイメージ分析（過去比較）の実装、動的項目対応、実装時間35分
- **最終更新**: 2025-11-30

#### [Mode 4 実装報告書](implementation/HISTORICAL_MODE7_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: ブランドパワー分析①（過去比較）の実装、実装時間3分
- **最終更新**: 2025-11-30

#### [Mode 5 実装報告書](implementation/HISTORICAL_MODE8_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: ブランドパワー分析②（過去比較）の実装、実装時間10分
- **最終更新**: 2025-11-30

#### [Mode 5 実装完了サマリー](guides/HISTORICAL_MODE8_SUMMARY.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 5の実装完了サマリー、機能概要、実装時間
- **最終更新**: 2025-11-30

#### [Mode 6 要件定義](requirements/HISTORICAL_MODE6_REQUIREMENTS.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: アーキタイプ分析（過去比較）の要件、12タイプのアーキタイプ対応
- **最終更新**: 2025-12-01

#### [Mode 6 実装報告書](implementation/HISTORICAL_MODE9_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: アーキタイプ分析（過去比較）の実装、12タイプ対応、実装時間
- **最終更新**: 2025-11-30

#### [Mode 7 要件定義](requirements/HISTORICAL_MODE7_REQUIREMENTS.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: ブランド軸過去比較の要件、新パターン（パターン3）の詳細
- **最終更新**: 2025-12-01

#### [Mode 7 実装報告書](implementation/HISTORICAL_MODE2_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: パターン3の確立、実装時間62分、Mode 8-14への展開準備
- **最終更新**: 2025-12-01

#### [Mode 7 完全実装ガイド](guides/HISTORICAL_MODE2_COMPLETE_GUIDE.md)
- **対象読者**: Mode 8以降の実装担当者
- **内容**: 実装の全フェーズ、UI改善の経緯、チェックリスト、ベストプラクティス
- **最終更新**: 2025-12-01

#### [Mode 8 要件定義](requirements/HISTORICAL_MODE8_REQUIREMENTS.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: ブランド軸過去比較（タイムライン）の要件、Mode 7との差分、実装効率化
- **最終更新**: 2025-12-01

#### [Mode 8 実装報告書](implementation/HISTORICAL_MODE4_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: 実装時間12分の達成、Mode 7の資産活用、80.6%の効率化
- **最終更新**: 2025-12-01

#### [Mode 9 要件定義](requirements/HISTORICAL_MODE9_REQUIREMENTS.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: ブランドイメージ分析（ブランド軸×過去比較）の要件、動的項目対応、Mode 7/8との差分
- **最終更新**: 2025-12-01

#### [Mode 9 実装報告書](implementation/HISTORICAL_MODE6_IMPLEMENTATION_REPORT.md)
- **対象読者**: 開発者
- **内容**: 実装時間25分の達成、動的項目対応、パターン3の拡張
- **最終更新**: 2025-12-01

### ブランドイメージ分析（Mode 7 & 8）

#### [Mode 7 要件定義](requirements/mode7_brand_image_segment_brands_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 7の詳細要件、技術仕様、実装方針
- **最終更新**: 2025-11-26

### ブランドパワー分析（Mode 9 & 10 & 11 & 12）

#### [ブランドパワー分析概要](features/brand_power_analysis_summary.md)
- **対象読者**: ユーザー、マーケター
- **内容**: Mode 9 & 10の概要、BP1～BP4指標の説明、使用例、分析ポイント
- **最終更新**: 2025-11-29

#### [ブランドパワー分析要件定義（Mode 9）](requirements/mode9_brand_power_segment_brands_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 9の詳細要件、BP1～BP4指標の説明、技術仕様、実装方針
- **最終更新**: 2025-11-29

#### [ブランドパワー分析要件定義（Mode 10）](requirements/mode10_brand_power_brand_segments_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 10の詳細要件、モード9との差分、実装方針、ビジネス価値
- **最終更新**: 2025-11-29

#### [将来性パワー分析要件定義（Mode 11）](requirements/mode11_future_power_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 11の詳細要件、FP1～FP6指標の説明、技術仕様、実装方針
- **最終更新**: 2025-11-29

#### [将来性パワー分析要件定義（Mode 12）](requirements/mode12_future_power_brand_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 12の詳細要件、モード10との差分、実装方針、ビジネス価値
- **最終更新**: 2025-11-29

#### [アーキタイプ分析要件定義（Mode 13）](requirements/mode13_archetype_segment_brands_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 13の詳細要件、12タイプのアーキタイプ、技術仕様、実装方針
- **最終更新**: 2025-11-29

#### [アーキタイプ分析要件定義（Mode 14）](requirements/mode14_archetype_brand_segments_requirements.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: Mode 14の詳細要件、モード12との差分、ビジネス価値、使用例
- **最終更新**: 2025-11-29

#### [アーキタイプ分析実装サマリー](implementation/mode13_mode14_implementation_summary.md)
- **対象読者**: 開発者
- **内容**: Mode 13・14の実装詳細、データフロー、技術的な工夫
- **最終更新**: 2025-11-29

---

## 🚀 リリース情報

#### [変更履歴（CHANGELOG）](changelog/CHANGELOG.md)
- **対象読者**: すべてのユーザー、開発者
- **内容**: バージョン別の新機能、改善、バグ修正、技術的マイルストーン
- **最終更新**: 2025-11-30 (v2.10.0)

---

## 🔍 特定トピック

### ブランド名表記ゆれ解決

#### [ブランド名表記ゆれ解決策](guides/ブランド名表記ゆれ解決策.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: ブランド名の表記ゆれを解決するためのアプローチと実装方針
- **最終更新**: 2025-01

#### [ブランド名表記ゆれ実装ガイド](implementation/ブランド名表記ゆれ_実装ガイド.md)
- **対象読者**: 開発者
- **内容**: ブランド名表記ゆれ解決機能の実装手順
- **最終更新**: 2025-01

#### [ブランド名表記ゆれ実装完了報告](implementation/ブランド名表記ゆれ_実装完了報告.md)
- **対象読者**: 開発者、プロジェクトマネージャー
- **内容**: ブランド名表記ゆれ解決機能の実装完了報告
- **最終更新**: 2025-01

### DEMOモード制限

#### [DEMOモード時の分析モード制限](features/demo_mode_restriction.md)
- **対象読者**: ユーザー、サポート担当
- **内容**: DEMOモード時の動作、制限内容、理由
- **最終更新**: 2025-11-27

### リファクタリング

#### [アプリリファクタリング詳細](refactoring/APP_REFACTORING_DETAIL.md)
- **対象読者**: 開発者
- **内容**: アプリケーションのリファクタリング詳細
- **最終更新**: 2025-11

#### [LocalStorage移行](refactoring/LOCALSTORAGE_MIGRATION.md)
- **対象読者**: 開発者
- **内容**: LocalStorageの移行に関する詳細
- **最終更新**: 2025-11

---

## 📖 ドキュメントの読み方

### 初めてのユーザー

1. **[取扱説明書](USER_MANUAL.md)** - アプリケーションの完全な使用方法（推奨）
2. **[README.md](../README.md)** - プロジェクト概要と基本的な使い方を理解
3. **[仕様書](requirements/specification.md)** - 各分析モードの使い方を確認
4. **[Excelフォーマット説明](requirements/sample_excel_structure.md)** - データの準備方法を学習

### 開発者

1. **[技術仕様書](requirements/technical_specification.md)** - システムアーキテクチャを理解
2. **[要件定義書](requirements/requirements_definition.md)** - プロジェクトの背景と要件を把握
3. **[CHANGELOG.md](changelog/CHANGELOG.md)** - 最新の変更内容を確認
4. **[過去比較モード完全ガイド](guides/HISTORICAL_MODES_MASTER_GUIDE.md)** - 過去比較モードの実装パターンを学習

### マーケター・アナリスト

1. **[取扱説明書](USER_MANUAL.md)** - アプリケーションの完全な使用方法（推奨）
2. **[ブランドパワー分析概要](features/brand_power_analysis_summary.md)** - ブランドパワー分析の活用方法（現在パワー）
3. **[将来性パワー分析要件定義](requirements/mode11_future_power_requirements.md)** - ブランド将来性の評価方法
4. **[アーキタイプ分析要件定義](requirements/mode13_archetype_segment_brands_requirements.md)** - ブランドパーソナリティの12タイプ評価
5. **[仕様書](requirements/specification.md)** - 各モードの詳細な使い方

### サポート担当

1. **[取扱説明書](USER_MANUAL.md)** - アプリケーションの完全な使用方法とトラブルシューティング（推奨）
2. **[トラブルシューティング](troubleshooting/troubleshooting_graph_not_showing.md)** - よくある問題の解決方法
3. **[DEMOモード制限](features/demo_mode_restriction.md)** - DEMOモードの制限事項
4. **[仕様書](requirements/specification.md)** - 機能の詳細な説明

---

## 📝 ドキュメント作成・更新ガイドライン

### ドキュメントの原則

1. **明確性**: 読者が理解しやすい言葉で書く
2. **完全性**: 必要な情報がすべて含まれている
3. **最新性**: コードの変更に合わせて更新する
4. **一貫性**: 用語や書式を統一する

### 更新時の注意事項

- **バージョン番号**: ドキュメント冒頭に記載
- **最終更新日**: 変更時に必ず更新
- **変更履歴**: 大きな変更は記録する
- **相互参照**: 関連ドキュメントへのリンクを追加

### ファイル配置ルール

- **要件定義**: `requirements/` フォルダ
- **実装関連**: `implementation/` フォルダ
- **ガイド・マニュアル**: `guides/` フォルダ
- **変更履歴**: `changelog/` フォルダ
- **トラブルシューティング**: `troubleshooting/` フォルダ
- **リファクタリング**: `refactoring/` フォルダ
- **機能別**: `features/` フォルダ

---

## 🔄 ドキュメント更新履歴

| 日付 | 対象ドキュメント | 変更内容 |
|:---|:---|:---|
| 2025-01 | README_DOCS.md | ドキュメント構造をカテゴリ別フォルダに整理 |
| 2025-12-01 | README_DOCS.md | 過去比較モード Mode 1-9の全ドキュメントを正確に反映、ファイル名と内容の対応を修正 |
| 2025-12-01 | Mode 9実装完了 | 過去比較モード Mode 9の実装完了（要件定義+実装報告書、実装時間25分） |
| 2025-12-01 | Mode 8実装完了 | 過去比較モード Mode 8の実装完了（要件定義+実装報告書+サマリー、実装時間12分） |
| 2025-12-01 | Mode 7実装完了 | 過去比較モード Mode 7の実装完了（要件定義+実装報告書+完全実装ガイド、実装時間62分） |
| 2025-11-30 | Mode 6実装完了 | 過去比較モード Mode 6の実装完了（要件定義+実装報告書） |
| 2025-11-30 | Mode 5実装完了 | 過去比較モード Mode 5の実装完了（実装報告書+サマリー、実装時間10分） |
| 2025-11-30 | Mode 4実装完了 | 過去比較モード Mode 4の実装完了（実装報告書、実装時間3分） |
| 2025-11-30 | Mode 3実装完了 | 過去比較モード Mode 3の実装完了（実装報告書、実装時間35分） |
| 2025-11-30 | Mode 2実装完了 | 過去比較モード Mode 2の実装完了（実装報告書、実装時間5分） |
| 2025-11-30 | 全ドキュメント | v2.10.0対応（エラーハンドリング改善、UI改善、隠しコマンド変更） |
| 2025-11-30 | 全ドキュメント | v2.9.0対応（コードクリーンアップ、不要ファイル削除） |
| 2025-11-30 | 全ドキュメント | v2.8.0対応（カラーテーマ10種類追加、UI改善、サンプルファイル自動読み込み削除） |
| 2025-11-29 | 全ドキュメント | v2.7.0対応（Mode 13・14追加、アーキタイプ分析サポート） |
| 2025-11-29 | 全ドキュメント | v2.5.0対応（Mode 12追加） |
| 2025-11-29 | 全ドキュメント | v2.4.0対応（Mode 11追加、FP指標サポート） |
| 2025-11-29 | 全ドキュメント | v2.3.0対応（Mode 9 & 10追加、BP指標サポート） |
| 2025-11-28 | Mode 7関連 | Mode 8追加、ブランドイメージ分析の拡張 |
| 2025-11-27 | DEMOモード関連 | DEMOモード制限機能の追加 |
| 2025-11-26 | 全ドキュメント | v2.0.0対応（6モード対応、設定駆動型） |

---

## 📧 フィードバック

ドキュメントに関するフィードバックやご質問は、プロジェクトリポジトリのIssueセクションでお願いします。

---

## 📜 ライセンス

このドキュメントは、BFD Analyticsプロジェクトの一部として提供されています。ライセンス情報については、プロジェクトオーナーにお問い合わせください。

---

**最終更新**: 2025-01（ドキュメント構造をカテゴリ別フォルダに整理）  
**ドキュメント管理責任者**: [名前]
