# LocalStorage 移行ガイド

## 問題

旧バージョンのApp.tsxと新バージョンのlocalStorageデータ形式に互換性の問題があります。

### エラーの原因

**旧バージョン**:
```javascript
localStorage.setItem('funnel_analysis_mode', 'segment_x_multi_brand'); // 文字列そのまま
localStorage.setItem('funnel_target_brand', 'ユニクロ'); // 文字列そのまま
localStorage.setItem('funnel_selected_item', 'FW'); // 文字列そのまま
```

**新バージョン** (usePersistence):
```javascript
localStorage.setItem('funnel_analysis_mode', JSON.stringify('segment_x_multi_brand')); // JSON形式
// 読み込み時
JSON.parse('segment_x_multi_brand'); // ← エラー！
```

---

## 解決方法

### 方法1: LocalStorageをクリア（推奨）

ブラウザの開発者ツールで以下を実行:

```javascript
// 全てのファネル関連データをクリア
localStorage.removeItem('funnel_analysis_mode');
localStorage.removeItem('funnel_target_brand');
localStorage.removeItem('funnel_selected_brands');
localStorage.removeItem('funnel_selected_segments');
localStorage.removeItem('funnel_selected_item');
localStorage.removeItem('chart_height');

// または全てクリア
localStorage.clear();

// ページをリロード
location.reload();
```

### 方法2: 自動互換性対応（実装済み）

`usePersistence.ts`を修正して、旧形式のデータも読み込めるようにしました。

```typescript
// JSONパースを試み、失敗したら文字列として扱う
try {
  return JSON.parse(item);
} catch {
  return item as T; // 旧形式の文字列をそのまま返す
}
```

---

## 手順

1. **ブラウザでlocalStorageをクリア**
   ```
   F12 → Console タブ → 上記のスクリプトを実行
   ```

2. **ページをリロード**
   ```
   Ctrl + R または F5
   ```

3. **動作確認**
   - エラーが消えることを確認
   - データが初期状態から開始されることを確認

---

## 注意事項

- localStorageをクリアすると、保存されていた設定が全て初期化されます
- サンプルデータは自動的に再読み込みされます
- 必要に応じて、再度ブランドやセグメントを選択してください

---

## 技術的詳細

### 旧バージョンのlocalStorage保存方法
```typescript
// 旧バージョン（リファクタリング前）
useEffect(() => {
  localStorage.setItem('funnel_analysis_mode', analysisMode);
}, [analysisMode]);
```

### 新バージョンのlocalStorage保存方法
```typescript
// usePersistence.ts
localStorage.setItem(key, JSON.stringify(valueToStore));
```

この違いにより、旧データを新バージョンで読み込む際にJSONパースエラーが発生していました。

