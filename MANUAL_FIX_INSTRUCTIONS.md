# モード別AIサマリープロンプト実装 - 手動修正手順

## 現在の状況

- ✅ `src/services/modePrompts.ts` にMODE_PROMPTSを作成済み
- ✅ `src/services/comparisonInstructions.ts` にgetComparisonInstruction関数を作成済み
- ✅ `src/services/aiSummaryService.ts` にMODE_PROMPTSのインポートを追加済み
- ⏳ `aiSummaryService.ts`の以下2箇所を手動で修正する必要があります

## 手動修正が必要な箇所

### 修正1: comparisonInstructions.tsをインポート

**ファイル**: `src/services/aiSummaryService.ts`  
**行番号**: 4行目付近（インポート部分）

**追加するコード**:
```typescript
import { getComparisonInstruction } from './comparisonInstructions';
```

### 修正2: generateAISummary関数内のプロンプト取得処理を更新

**ファイル**: `src/services/aiSummaryService.ts`  
**行番号**: 222-223行目付近

**変更前**:
```typescript
    // プロンプトを構築
    const prompt = replacePromptVariables(settings.prompt || DEFAULT_PROMPT, request);
```

**変更後**:
```typescript
    // モード別プロンプトを取得（フォールバックとしてDEFAULT_PROMPTを使用）
    const modePrompt = MODE_PROMPTS[request.context.analysisMode] || DEFAULT_PROMPT;
    
    // プロンプトを構築（settingsのプロンプトが設定されていればそれを優先）
    const basePrompt = settings.prompt || modePrompt;
    const prompt = replacePromptVariables(basePrompt, request);
```

### 修正3: replacePromptVariables関数内でgetComparisonInstructionを使用

**ファイル**: `src/services/aiSummaryService.ts`  
**行番号**: 167-180行目付近（comparisonInstruction生成部分）

**変更前**:
```typescript
  // 複数ブランドの場合の比較指示を生成
  let comparisonInstruction = '';
  if (maskedBrands.length > 1) {
    const firstBrand = maskedBrands[0];
    const otherBrands = maskedBrands.slice(1);
    comparisonInstruction = `【重要：複数ブランド比較分析】
複数ブランドが含まれています。以下の点に注意して分析してください：
- **${firstBrand}を基準ブランドとして設定**し、他のブランド（${otherBrands.join('、')}）との比較分析を行ってください
- ${firstBrand}の各指標の値を基準として、他のブランドがどの程度高い/低いかを明確に示してください
- ブランド間の差が大きいポイントや特徴的な違いを重点的に指摘してください
- 比較結果は簡潔にまとめてください

`;
  }
```

**変更後**:
```typescript
  // モード別の比較指示を取得
  const comparisonInstruction = getComparisonInstruction(
    context.analysisMode,
    maskedBrands,
    context.selectedSegments || []
  );
```

## 確認方法

修正後、以下を確認してください：

1. **TypeScriptのコンパイルエラーがないか確認**
   ```bash
   npm run dev
   ```

2. **各モードでAIサマリーが正しく生成されるか確認**
   - モード1: ファネル分析①（セグメント×ブランド） → ブランド比較指示
   - モード2: ファネル分析①（ブランド×セグメント） → セグメント比較指示  
   - モード3: ファネル分析①（項目×ブランド×セグメント） → マトリクス比較指示
   - モード4～6: 上記の時系列版

## 理由

Windowsの改行コード（CRLF）の問題により、ツールでの自動編集が失敗しました。
上記3箇所を手動で修正することで、モード別プロンプト機能が完成します。
