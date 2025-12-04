# グラフ・データテーブル非表示問題 診断レポート

**作成日**: 2025-11-29
**報告**: グラフとデータテーブルが表示されない

---

## 🔍 考えられる原因（優先度順）

### 1. **selectedBrands が空の可能性** ⚠️ 最優先

#### 症状
- サイドバーにブランドは表示されているが、選択されていない
- `chartData` が空配列を返す

#### 確認方法
ブラウザのコンソール（F12）を開いて、以下のログを確認：
```
🔍 DEBUG: Generating chartData
```

特に以下の項目を確認：
- `selectedBrandsLength`: 0 の場合、ブランドが選択されていない
- `sheetData`: 0 の場合、シートデータが読み込まれていない

#### 原因
- `useEffect` の依存配列に問題がある可能性
- 初期化のタイミングが適切でない

#### 対策
**App.tsx の行100-110を確認**：

```typescript
useEffect(() => {
  if (sheet && data[sheet]) {
    const brands = Object.keys(data[sheet]);
    if (brands.length > 0 && selectedBrands.length === 0) {
      setSelectedBrands(brands.slice(0, 3));
    }
    // ...
  }
}, [sheet, data]);  // ⚠️ selectedBrands が依存配列にない！
```

**問題点**: `selectedBrands.length` をチェックしているのに、`selectedBrands` が依存配列にない

**修正案**:
```typescript
useEffect(() => {
  if (sheet && data[sheet] && selectedBrands.length === 0) {
    const brands = Object.keys(data[sheet]);
    if (brands.length > 0) {
      setSelectedBrands(brands.slice(0, 3));
    }
  }
}, [sheet, data, selectedBrands.length]);
```

---

### 2. **sheet が選択されていない可能性** ⚠️ 高優先度

#### 症状
- セグメント選択ドロップダウンで「全体」が表示されているが、内部的に空文字列

#### 確認方法
コンソールログで以下を確認：
```
sheet: "" (空文字列の場合が問題)
sheet: "全体（BFDシート_値）St4" (正常)
```

#### 原因
- 初期化のタイミング
- データ読み込み時の設定ミス

#### 対策
**App.tsx の行112-121を確認**：

同様の問題がある可能性。

---

### 3. **データ読み込みのタイミング** ⚠️ 中優先度

#### 症状
- サンプルExcelファイルが読み込まれる前に、chartDataの計算が走る

#### 確認方法
コンソールログで以下を確認：
```
dataKeys: [] (空配列の場合が問題)
dataKeys: ["全体（BFDシート_値）St4", "男性（BFDシート_値）St4", ...] (正常)
```

#### 原因
- `parseExcelData` の非同期処理が完了する前に描画される

#### 対策
ローディング状態を追加するか、データがない場合のガードを強化。

---

### 4. **transformDataForChart 関数の問題** ⚠️ 中優先度

#### 確認方法
コンソールログで以下を確認：
```
🔍 DEBUG: chartData result
  length: 0  (問題)
  length: 6  (正常 - ファネル分析の場合)
```

#### 原因
- filterValues または seriesValues が不正
- モード設定が正しくない

---

### 5. **ChartArea コンポーネントの条件分岐** ⚠️ 低優先度

#### 確認ポイント
`ChartArea.tsx` の行250付近で、chartDataの長さチェックがあるか確認。

---

## 🔧 即座に試すべき対策

### 対策1: useEffect の依存配列を修正

**ファイル**: `App.tsx`

```typescript
// 行 99-110 付近
useEffect(() => {
  if (sheet && data[sheet] && selectedBrands.length === 0) {
    const brands = Object.keys(data[sheet]);
    if (brands.length > 0) {
      console.log('🔧 Setting initial brands:', brands.slice(0, 3));
      setSelectedBrands(brands.slice(0, 3));
    }
    if (brands.length > 0 && !targetBrand) {
      setTargetBrand(brands[0]);
    }
  }
}, [sheet, data, selectedBrands.length, targetBrand]);

useEffect(() => {
  const segments = Object.keys(data);
  if (segments.length > 0 && selectedSegments.length === 0) {
    console.log('🔧 Setting initial segments:', segments.slice(0, 3));
    setSelectedSegments(segments.slice(0, 3));
  }
  if (segments.length > 0 && !sheet) {
    setSheet(segments[0]);
  }
}, [data, selectedSegments.length, sheet]);
```

### 対策2: デバッグ情報の確認

1. ブラウザをリロード（Ctrl+F5）
2. F12 でコンソールを開く
3. 以下のログを確認：

```
🔍 DEBUG: Generating chartData
🔧 Setting initial brands
🔧 Setting initial segments
```

### 対策3: 手動でブランドを選択

サイドバーの「ブランド」セクションで、手動で3つのブランドにチェックを入れる。

---

## 📊 期待される正常な状態

### コンソールログ（正常時）

```
🔧 Setting initial segments: ["全体（BFDシート_値）St4", "男性（BFDシート_値）St4", "女性（BFDシート_値）St4"]
🔧 Setting initial brands: ["コロナ Relala（リララ）", "富士通ゼネラル nocria（ノクリア）", "ダイキン うるさら"]
🔍 DEBUG: Generating chartData {
  analysisMode: "segment_x_multi_brand",
  sheet: "全体（BFDシート_値）St4",
  targetBrand: "コロナ Relala（リララ）",
  selectedItem: "FT",
  selectedBrandsLength: 3,
  selectedSegmentsLength: 3,
  dataKeys: [...],
  sheetData: 65
}
🔍 DEBUG: chartData result {
  length: 6,
  firstItem: { name: "認知あり(TOP2)", ... }
}
```

### UI状態（正常時）

- セグメントセクション: 「全体」が選択されている
- ブランドセクション: 3つのブランドにチェックが入っている
- グラフエリア: 集合縦棒グラフが表示される
- データテーブル: 6行×4列のテーブルが表示される

---

## 🚨 緊急対応フロー

1. **ブラウザのコンソールを開く**（F12）
2. **ページをリロード**（Ctrl+F5）
3. **コンソールログを確認**
4. **以下のどのパターンか判定**：

### パターンA: `selectedBrandsLength: 0`
→ **対策1を実施**（useEffect修正）

### パターンB: `sheet: ""`
→ セグメントが選択されていない。手動で「全体」を選択。

### パターンC: `dataKeys: []`
→ データが読み込まれていない。サーバーを再起動。

### パターンD: `chartData result length: 0`
→ transformDataForChart に問題。さらに調査が必要。

---

## 📝 次のステップ

1. **ブラウザコンソールのログを確認**
2. **どのパターンに該当するか判定**
3. **該当する対策を実施**
4. **結果を報告**

---

**現在の状態**: デバッグログを追加済み。ブラウザのコンソール確認待ち。

