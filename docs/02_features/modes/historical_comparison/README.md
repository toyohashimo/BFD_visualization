# 過去比較モード (Mode 1-9)

最大3つのExcelファイルを読み込み、時系列でのデータ推移を分析します。

## 📋 モード一覧

### 基本モード (Mode 01-06)
| Mode | ファイル | 説明 |
|:-----|:---------|:-----|
| 01 | [mode01_funnel1.md](mode01_funnel1.md) | ファネル①指標の時系列推移 |
| 02 | [mode02_funnel2.md](mode02_funnel2.md) | ファネル②指標（時系列）の推移 |
| 03 | [mode03_brand_image.md](mode03_brand_image.md) | ブランドイメージTOP30の推移 |
| 04 | [mode04_brand_power.md](mode04_brand_power.md) | ブランドパワー（現在）の推移 |
| 05 | [mode05_future_power.md](mode05_future_power.md) | 将来性パワーの推移 |
| 06 | (アーキタイプ分析の推移) | 12原型の推移 |

### ブランド軸モード (Mode 07-09) - NEW
| Mode | ファイル | 説明 |
|:-----|:---------|:-----|
| 07 | [mode06_funnel_brand_axis.md](mode06_funnel_brand_axis.md) | ファネル分析（ブランド軸） |
| 08 | [mode07_timeline_brand_axis.md](mode07_timeline_brand_axis.md) | タイムライン分析（ブランド軸） |
| 09 | [mode08_brand_image_brand_axis.md](mode08_brand_image_brand_axis.md) | ブランドイメージ分析（ブランド軸） |

## 📝 概要

### [overview.md](overview.md)
過去比較モードの全般的な説明、データソース管理機能等

## 🎯 使用シーン

### トレンド分析
Mode 01-02でファネル指標の経年変化を追跡

### イメージ変化
Mode 03でブランドイメージの推移を可視化

### パワー評価
Mode 04-05でブランド力の変化を測定

### ブランド比較
Mode 07-09で複数ブランドの時系列比較

## 💡 特記事項

- 全モードで単一セグメント・単一ブランドを選択
- データソースは最大3ファイルまで読み込み可能
- ファイル名から期間を自動抽出（例: `BFD_202506.xlsx` → `2025年6月`）
