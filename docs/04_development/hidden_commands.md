# 隠しコマンド（開発者向け）

このドキュメントは開発者・デバッグ・デモンストレーション用の隠しコマンドをまとめたものです。

> [!WARNING]
> これらのコマンドは開発・デモ目的のものです。エンドユーザーには公開しないでください。

## 過去比較モード: サンプルファイル自動読み込み

### 概要
デモ環境やテスト環境で、3つのサンプルファイルを一瞬で読み込むための隠しコマンド。

### トリガー
過去比較モード時、**サイドバーのタイトル領域（「BFD Analytics」ロゴ）をShift+ダブルクリック**


### 動作
以下の3つのサンプルファイルを自動的に読み込みます：
- `sample_202506.xlsx` → `2025年6月`
- `sample_202406.xlsx` → `2024年6月`
- `sample_202304.xlsx` → `2023年4月`

### 使用条件
- 過去比較モードが選択されている必要があります
- サンプルファイルが `public/` ディレクトリに配置されている必要があります

### 用途
- **デモンストレーション**: クライアントへのプレゼンテーション時の準備時間短縮
- **テスト**: 開発中の機能テスト
- **トレーニング**: 新規ユーザーへのトレーニング環境構築

### 実装詳細
- **実装ファイル**: `components/Sidebar.tsx`
- **イベントリスナー**: グローバルモードタブの`onDoubleClick`イベント
- **キー検出**: `event.ctrlKey && event.shiftKey`

### コード例
```typescript
const handleGlobalModeDoubleClick = async (event: React.MouseEvent) => {
  // Ctrl+Shift+ダブルクリック検出
  if (event.ctrlKey && event.shiftKey && globalMode === 'historical') {
    try {
      // 3つのサンプルファイルを順次読み込み
      const files = [
        { path: 'sample_202506.xlsx', name: 'sample_202506.xlsx' },
        { path: 'sample_202406.xlsx', name: 'sample_202406.xlsx' },
        { path: 'sample_202304.xlsx', name: 'sample_202304.xlsx' }
      ];
      
      for (const file of files) {
        const response = await fetch(file.path);
        const blob = await response.blob();
        // ファイル処理...
      }
      
      console.log('3つのサンプルファイルを読み込みました（隠しコマンド）');
    } catch (error) {
      console.error('サンプルファイル読み込みエラー:', error);
    }
  }
};
```

## 詳細分析モード: サンプルファイル自動読み込み

### 概要
開発・テスト環境で、サンプルファイルを瞬時に読み込むための隠しコマンド。

### トリガー
詳細分析モード時、**サイドバーのタイトル領域（「BFD Analytics」ロゴ）をShift+ダブルクリック**

### 動作
`sample_202506.xlsx` を自動的に読み込みます。

### 使用条件
- 詳細分析モードが選択されている必要があります
- サンプルファイルが `public/` ディレクトリに配置されている必要があります

### 用途
- **開発**: 機能開発中の即座のデータロード
- **テスト**: テストケースの実行
- **デモンストレーション**: プレゼンテーション準備

### 実装詳細
- **実装ファイル**: `components/Sidebar.tsx`
- **イベントリスナー**: タイトル領域の`onDoubleClick`イベント
- **キー検出**: `event.shiftKey`

### コード例
```typescript
const handleTitleDoubleClick = async (e: React.MouseEvent) => {
  if (e.shiftKey && globalMode === 'detailed') {
    try {
      const response = await fetch('/sample_202506.xlsx');
      if (!response.ok) {
        alert('sample_202506.xlsxが見つかりませんでした');
        return;
      }
      const blob = await response.blob();
      const file = new File([blob], 'sample_202506.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      await onFileDrop(file);
      console.log('Sample data loaded via hidden command');
    } catch (error) {
      console.error('Failed to load sample_202506.xlsx:', error);
      alert('sample_202506.xlsxの読み込みに失敗しました');
    }
  }
};
```

---

## 関連ドキュメント

### デバッグモード
デバッグモード機能については、別ドキュメントを参照してください：
- [デバッグモード](./debug_mode.md) - APIキー設定なしでAI機能をテスト

---

## 将来的な拡張案

### データリセットコマンド
すべてのデータとLocalStorageをクリアするコマンド（開発中のみ）

### 削除済みの拡張案
以下の機能は既に実装されています：
- ~~詳細分析モード用隠しコマンド~~ → 実装済み（上記参照）
- ~~デバッグモード切り替え~~ → 実装済み（[debug_mode.md](./debug_mode.md) 参照）

## 注意事項

### セキュリティ
- 本番環境では、これらのコマンドを無効化または削除することを推奨します
- 環境変数（`import.meta.env.DEV`）で開発環境のみ有効化することを検討してください

### 保守性
- 隠しコマンドの追加・変更時は、このドキュメントを必ず更新してください
- コード内にコメントを残し、将来の開発者が理解できるようにしてください

## 履歴

| 日付 | 変更内容 |
|:---|:---|
| 2025-11-30 | 過去比較モード用サンプルファイル自動読み込みコマンド実装 |
| 2025-12-05 | 隠しコマンドドキュメントを04_development/に集約 |
| 2025-12-05 | 詳細分析モード用隠しコマンドを追加 |
| 2025-12-05 | デバッグモードを別ドキュメント(debug_mode.md)に分離 |

