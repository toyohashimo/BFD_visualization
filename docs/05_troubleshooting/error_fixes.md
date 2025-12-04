# エラー修正レポート - LocalStorage互換性問題

## 問題の発生

リファクタリング後、以下のエラーが発生しました：

### エラー1: LocalStorage JSONパースエラー
```
Failed to load funnel_analysis_mode from localStorage: 
SyntaxError: Unexpected token 's', "segment_x_"... is not valid JSON
```

### エラー2: データ未定義エラー
```
Cannot read properties of undefined (reading 'ベルーナ')
```

---

## 原因分析

### 原因1: LocalStorageデータ形式の不一致

**旧バージョン**:
```typescript
// 文字列をそのまま保存
localStorage.setItem('funnel_analysis_mode', 'segment_x_multi_brand');
localStorage.setItem('funnel_target_brand', 'ユニクロ');
localStorage.setItem('funnel_selected_item', 'FW');
```

**新バージョン (usePersistence.ts)**:
```typescript
// JSON.stringify()で保存
localStorage.setItem(key, JSON.stringify('segment_x_multi_brand'));
// => '"segment_x_multi_brand"' (JSON形式)

// 読み込み時
JSON.parse('segment_x_multi_brand'); // ← エラー！引用符なしは無効なJSON
```

### 原因2: データの初期化タイミング

- `useDataManagement`の初期値が空オブジェクトに設定（Excel読み込み前提）
- サンプルファイルの読み込み中にChartAreaがレンダリングされる
- `data[sheet]`が`undefined`になる

---

## 実施した修正

### 修正1: usePersistence.ts - 互換性レイヤーの追加 ✅

```typescript
const [state, setState] = useState<T>(() => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return initialValue;
    
    // JSONパースを試み、失敗したら文字列として扱う（互換性対応）
    try {
      return JSON.parse(item);
    } catch {
      // 旧形式の文字列データをそのまま返す
      return item as T;
    }
  } catch (error) {
    console.warn(`Failed to load ${key}, using initial value:`, error);
    return initialValue;
  }
});
```

### 修正2: App.tsx - データ読み込み前のガード ✅

```typescript
// データの有効性チェック
const hasValidData = useMemo(() => {
  return Object.keys(data).length > 0;
}, [data]);

// ChartAreaをレンダリング前にチェック
{!hasValidData || !sheet ? (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="inline-block animate-spin ..."></div>
      <p className="text-gray-600">データを読み込み中...</p>
    </div>
  </div>
) : (
  <ChartArea ... />
)}
```

### 修正3: useDataManagement.ts - 初期値を空に変更 ✅

```typescript
// 初期値（空のオブジェクト）
const EMPTY_DATA: SheetData = {};

export const useDataManagement = () => {
  const [data, setData] = useState<SheetData>(EMPTY_DATA);
  // ...
}
```

### 修正4: サンプルファイル自動読み込みの改善 ✅

```typescript
useEffect(() => {
  const loadSampleFile = async () => {
    try {
      const response = await fetch('/sample_202506.xlsx');
      if (!response.ok) return;
      
      const arrayBuffer = await response.arrayBuffer();
      const result = await loadFromArrayBuffer(arrayBuffer);
      
      // ファイル読み込み成功後、sheetとbrandsを初期化
      if (result && result.sheetData) {
        const firstSheet = Object.keys(result.sheetData)[0];
        if (firstSheet) {
          setSheet(firstSheet);
          const brands = Object.keys(result.sheetData[firstSheet]).slice(0, 3);
          if (brands.length > 0) {
            setSelectedBrands(brands);
          }
        }
      }
    } catch (error) {
      console.error('Failed to auto-load sample file:', error);
    }
  };

  if (!hasValidData) {
    loadSampleFile();
  }
}, []);
```

---

## 修正結果

### ✅ ビルド成功
```
✓ 2335 modules transformed.
dist/assets/index-CLdq3BND.js  1,228.74 kB │ gzip: 368.95 kB
✓ built in 6.79s
```

### ✅ 動作確認
1. **LocalStorageエラー解消**: 旧形式のデータも正しく読み込める
2. **データ未定義エラー解消**: ローディング画面を表示し、データ読み込み完了後にChartAreaをレンダリング
3. **スムーズな初期化**: サンプルファイルが自動的に読み込まれ、初期状態が正しく設定される

---

## ユーザーアクション

### 推奨: LocalStorageをクリア

エラーを完全に解消するために、以下を実行してください：

**方法1: ブラウザコンソール（推奨）**
```javascript
// F12 → Console
localStorage.clear();
location.reload();
```

**方法2: 開発者ツール**
1. F12を押す
2. Applicationタブ
3. Storage → Local Storage → localhost:3000
4. 右クリック → Clear

---

## 今後の互換性

今回の修正により、以下が保証されます：

1. **後方互換性**: 旧形式のlocalStorageデータも読み込める
2. **前方互換性**: 新しいデータはJSON形式で保存される
3. **エラー耐性**: データ読み込み失敗時は初期値にフォールバック
4. **ロバスト性**: データ未定義時のクラッシュを防ぐガード条件

---

## 追加ドキュメント

- `docs/LOCALSTORAGE_MIGRATION.md` - 移行ガイド
- `src/utils/localStorageCleanup.ts` - クリーンアップユーティリティ

---

---

## 追加修正: UI/UX改善 (2025-11-29)

### 修正5: ラベル表記の統一 ✅

グラフ左上のラベル表記を統一しました：

- 「データシート」→「セグメント」
- 「ブランド選択」→「ブランド」
- 「分析項目」→「項目」
- 「ブランド比較」→「ブランド」
- 「セグメント比較」→「セグメント」

**影響範囲**: `constants/analysisConfigs.ts` - 全12モード

### 修正6: モード4・モード5の挙動修正 ✅

**問題**: モード4とモード5でブランドとセグメントの挙動が逆になっていた

**修正内容**:

#### モード4 (`timeline_brand_multi_segment`)
```typescript
// 修正前
segments: { role: 'FILTER', ... }
brands: { role: 'SERIES', ... }
dataTransform: { filter: 'segments', series: 'brands' }

// 修正後
segments: { role: 'SERIES', ... }  // セグメントがSA
brands: { role: 'FILTER', ... }    // ブランドがフィルタ
dataTransform: { filter: 'brands', series: 'segments' }
// → グラフ左上に「ブランド」を表示
```

#### モード5 (`timeline_segment_multi_brand`)
```typescript
// 修正前
segments: { role: 'SERIES', ... }
brands: { role: 'FILTER', ... }
dataTransform: { filter: 'brands', series: 'segments' }

// 修正後
segments: { role: 'FILTER', ... }  // セグメントがフィルタ
brands: { role: 'SERIES', ... }    // ブランドがSA
dataTransform: { filter: 'segments', series: 'brands' }
// → グラフ左上に「セグメント」を表示
```

**修正結果**:
- ✅ モード4: セグメントがSAとして正しく動作
- ✅ モード5: ブランドがSAとして正しく動作
- ✅ グラフ左上のラベルが正しく表示される

---

**修正完了日**: 2025-11-29  
**最終更新日**: 2025-11-29  
**ステータス**: ✅ 完全解決

