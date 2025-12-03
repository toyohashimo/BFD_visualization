import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChartDataPoint } from '../types';
import { formatSegmentName } from '../utils/formatters';
import { GLOBAL_MODE_LABELS } from '../types/globalMode';

export interface AISummaryRequest {
  chartData: ChartDataPoint[];
  context: {
    globalMode: 'detailed' | 'historical';
    analysisMode: string;
    chartType: string;
    sheet: string;
    targetBrand: string;
    selectedBrands: string[];
    selectedSegments: string[];
    selectedItem: string;
    dataSources?: Array<{ name: string; isActive: boolean }>;
    isAnonymized?: boolean; // DEMOモード判定
  };
  metadata: {
    itemLabels: Record<string, string>;
    brandNames: Record<string, string>;
  };
}

export interface AISettings {
  apiKey: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// 利用可能なGeminiモデル（2025年11月時点の最新情報）
export const GEMINI_MODELS = [
  {
    value: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (推奨・安定版・高速・低コスト)',
    description: '価格パフォーマンスに優れたモデル。大規模処理、低レイテンシ、高ボリュームタスクに最適。'
  },
  {
    value: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash-Lite (最速・超低コスト)',
    description: '最速のFlashモデル。コスト効率と高スループットに最適化。'
  },
  {
    value: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro (高品質・推論特化)',
    description: '高度な推論能力を持つモデル。複雑な問題解決、大規模データ分析に適している。'
  },
  {
    value: 'gemini-3-pro-preview',
    label: 'Gemini 3 Pro Preview (最新・最高性能)',
    description: '最新の高性能マルチモーダルモデル。マルチモーダル理解、エージェント機能に優れる。'
  },
  {
    value: 'gemini-2.5-flash-preview-09-2025',
    label: 'Gemini 2.5 Flash Preview (プレビュー版)',
    description: 'Gemini 2.5 Flashのプレビュー版。最新機能を試すことができます。'
  },
  {
    value: 'gemini-2.5-flash-lite-preview-09-2025',
    label: 'Gemini 2.5 Flash-Lite Preview (プレビュー版)',
    description: 'Gemini 2.5 Flash-Liteのプレビュー版。最新機能を試すことができます。'
  },
] as const;

export const DEFAULT_MODEL = 'gemini-2.5-flash';

export const DEFAULT_PROMPT = `あなたはデータ分析の専門家です。以下のチャートデータを分析して、日本語でシンプルにサマリーコメントを生成してください。

【現在の設定】
- グローバルモード: {{globalMode}}
- 分析モード: {{analysisMode}}
- 分析項目: {{selectedItem}}
- セグメント: {{segments}}
- ブランド: {{selectedBrands}}

【チャートデータの構造】
チャートデータは以下の形式の配列です：
- 各データポイントはオブジェクトで、以下の構造を持ちます：
  - \`name\`: 項目名やセグメント名など（文字列）
  - \`[ブランド名]\`: 各ブランドの値（数値、単位は%）
- 例: \`{ "name": "項目A", "ブランド1": 45.2, "ブランド2": 38.7 }\`

【チャートデータ】
{{chartData}}
※ データの値の単位は%です。

【指示】
{{comparisonInstruction}}
1. データの主要な傾向を簡潔に3-5点指摘してください
2. 最大値・最小値や特徴的なポイントを簡潔に指摘してください
3. データから読み取れる洞察や推奨事項を1-2点簡潔に提示してください
4. 専門的すぎず、わかりやすい日本語で記述してください
5. 箇条書きではなく、自然な文章形式で記述してください
6. **重要**: 結果は必ずシンプルにサマライズしてください。長文にならず、要点を簡潔にまとめてください

サマリー:`;

/**
 * プロンプトテンプレートの変数を置換
 * DEMOモードの場合はブランド名やセグメント名をマスク
 */
function replacePromptVariables(
  prompt: string,
  request: AISummaryRequest
): string {
  const { context, chartData, metadata } = request;
  const isAnonymized = context.isAnonymized || false;

  // グローバルモードの表示名を取得
  const globalModeLabel = GLOBAL_MODE_LABELS[context.globalMode] || context.globalMode;

  // DEMOモードの場合、ブランド名とセグメント名をマスク
  let maskedBrands = context.selectedBrands;
  let maskedTargetBrand = context.targetBrand;

  if (isAnonymized) {
    // ブランド名をマスク（metadata.brandNamesを使用）
    maskedBrands = context.selectedBrands.map((brand, index) => {
      return metadata.brandNames[brand] || `ブランド${index + 1}`;
    });

    maskedTargetBrand = metadata.brandNames[context.targetBrand] || 'ブランド1';
  }

  // セグメント名をクリーンアップ（複数の場合はカンマ区切り）
  let segmentsStr: string;
  if (context.selectedSegments && context.selectedSegments.length > 0) {
    // 複数セグメントが選択されている場合
    const cleanedSegments = context.selectedSegments.map((seg, index) => {
      const cleaned = formatSegmentName(seg, isAnonymized, index);
      console.log(`[AI Summary] Formatting segment (multi): "${seg}" -> "${cleaned}"`);
      return cleaned;
    });
    segmentsStr = cleanedSegments.join(', ');
  } else if (context.sheet) {
    // 単一セグメントの場合
    const cleaned = formatSegmentName(context.sheet, isAnonymized, 0);
    console.log(`[AI Summary] Formatting segment (single): "${context.sheet}" -> "${cleaned}"`);
    segmentsStr = cleaned;
  } else {
    segmentsStr = '未選択';
  }

  // チャートデータをマスク処理
  let maskedChartData = chartData;
  if (isAnonymized) {
    maskedChartData = chartData.map((point) => {
      const maskedPoint: ChartDataPoint = { name: point.name };
      // 各ブランドの値をマスクされたブランド名に置き換え
      Object.keys(point).forEach((key) => {
        if (key !== 'name') {
          // ブランド名がマップされている場合はマスク、そうでなければそのまま
          const maskedKey = metadata.brandNames[key] || key;
          maskedPoint[maskedKey] = point[key];
        }
      });
      return maskedPoint;
    });
  }

  // チャートデータを読みやすい形式に変換
  const chartDataStr = JSON.stringify(maskedChartData, null, 2);

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

  let result = prompt
    .replace(/\{\{globalMode\}\}/g, globalModeLabel)
    .replace(/\{\{analysisMode\}\}/g, context.analysisMode)
    .replace(/\{\{segments\}\}/g, segmentsStr)
    .replace(/\{\{selectedBrands\}\}/g, maskedBrands.join(', '))
    .replace(/\{\{selectedItem\}\}/g, context.selectedItem)
    .replace(/\{\{chartData\}\}/g, chartDataStr)
    .replace(/\{\{comparisonInstruction\}\}/g, comparisonInstruction);

  // 空の比較指示による空行を削除
  result = result.replace(/\n\n\n+/g, '\n\n');

  return result;
}

/**
 * Gemini APIを使用してAIサマリーを生成
 */
export async function generateAISummary(
  request: AISummaryRequest,
  settings: AISettings
): Promise<string> {
  if (!settings.apiKey) {
    throw new Error('Gemini APIキーが設定されていません。設定画面からAPIキーを入力してください。');
  }

  try {
    // Gemini APIクライアントを初期化
    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const modelName = settings.model || DEFAULT_MODEL;
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        // デフォルト値を10000に設定（思考トークンも考慮）
        maxOutputTokens: settings.maxTokens || 10000,
        temperature: settings.temperature || 0.1,
      },
    });

    // プロンプトを構築
    const prompt = replacePromptVariables(settings.prompt || DEFAULT_PROMPT, request);

    // リクエスト情報をコンソールに出力
    const actualMaxTokens = settings.maxTokens || 10000;
    const actualTemperature = settings.temperature || 0.1;
    const isAnonymized = request.context.isAnonymized || false;
    console.log('=== AIサマリー生成リクエスト ===');
    console.log('モデル:', modelName);
    console.log('設定:', {
      maxTokens: actualMaxTokens,
      temperature: actualTemperature,
    });
    if (actualMaxTokens <= 1000) {
      console.warn('⚠️ maxTokensが1000以下です。思考トークンが使われる場合、出力が生成されない可能性があります。10000以上に設定することを推奨します。');
    }
    console.log('DEMOモード:', isAnonymized ? 'ON（マスク処理あり）' : 'OFF');
    console.log('コンテキスト:', {
      globalMode: request.context.globalMode,
      analysisMode: request.context.analysisMode,
      chartType: request.context.chartType,
      sheet: request.context.sheet,
      targetBrand: request.context.targetBrand,
      selectedBrands: request.context.selectedBrands,
      selectedSegments: request.context.selectedSegments,
      selectedItem: request.context.selectedItem,
      dataSources: request.context.dataSources,
    });
    console.log('チャートデータ件数:', request.chartData.length);
    if (isAnonymized) {
      console.log('⚠️ DEMOモード: プロンプト内のブランド名とセグメント名はマスクされています');
    }
    console.log('プロンプト:', prompt);
    console.log('==============================');

    // APIを呼び出し
    const result = await model.generateContent(prompt);

    // レスポンスの詳細情報をログ出力
    console.log('=== API呼び出し結果 ===');
    console.log('result:', result);
    console.log('result.response:', result.response);

    const response = result.response;

    // レスポンスオブジェクトの詳細を確認
    console.log('=== レスポンス詳細 ===');
    console.log('response.candidates:', response.candidates);
    console.log('response.promptFeedback:', response.promptFeedback);
    console.log('response.usageMetadata:', response.usageMetadata);

    // 候補からテキストを取得
    let text = '';
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log('candidate:', candidate);
      console.log('candidate.content:', candidate.content);
      console.log('candidate.finishReason:', candidate.finishReason);
      console.log('candidate.content.parts:', candidate.content?.parts);

      // finishReasonを確認
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('警告: トークン制限に達しました。部分的に生成されたテキストを取得します。');
        console.warn('usageMetadata:', response.usageMetadata);
      }

      // まずtext()メソッドを試す
      try {
        const textFromMethod = response.text();
        console.log('response.text()の結果:', textFromMethod);
        if (textFromMethod && textFromMethod.length > 0) {
          text = textFromMethod;
        }
      } catch (textError) {
        console.warn('response.text()でエラー:', textError);
      }

      // text()が空の場合、partsから直接取得を試す
      if (!text && candidate.content) {
        // candidate.contentをJSON化して詳細を確認
        console.log('candidate.content (JSON):', JSON.stringify(candidate.content, null, 2));

        // partsが存在する場合
        if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
          text = candidate.content.parts
            .map((part: any) => {
              console.log('part:', part);
              return part.text || '';
            })
            .join('');
          console.log('partsから取得したテキスト:', text);
        }

        // partsが存在しない場合、content全体を確認
        if (!text && typeof candidate.content === 'object') {
          // contentオブジェクト内のテキストを探す
          const contentStr = JSON.stringify(candidate.content);
          console.log('content全体を確認:', contentStr);
        }
      }
    }

    // レスポンス情報をコンソールに出力
    console.log('=== AIサマリー生成レスポンス ===');
    console.log('最終的なレスポンステキスト:', text);
    console.log('レスポンス長:', text?.length || 0);
    if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      console.warn('注意: トークン制限により、レスポンスが途中で切れている可能性があります。');
      console.warn('maxOutputTokensを増やすか、プロンプトを短くすることを検討してください。');
    }
    console.log('==============================');

    if (!text || text.trim().length === 0) {
      const finishReason = response.candidates?.[0]?.finishReason;
      const usageMetadata = response.usageMetadata;

      if (finishReason === 'MAX_TOKENS') {
        throw new Error(
          `トークン制限に達しました。` +
          `使用トークン: ${usageMetadata?.totalTokenCount || '不明'}。` +
          `maxOutputTokensを増やすか、プロンプトを短くしてください。`
        );
      }

      throw new Error('AIからの応答が空でした。');
    }

    return text.trim();
  } catch (error: any) {
    // エラー情報をコンソールに出力
    console.error('=== AIサマリー生成エラー ===');
    console.error('エラーオブジェクト:', error);
    console.error('エラーメッセージ:', error.message || String(error));
    console.error('エラーステータス:', error.status || error.statusCode);
    console.error('エラースタック:', error.stack);
    console.error('==========================');

    // エラーメッセージを日本語化
    const errorMessage = error.message || String(error);
    const errorStatus = error.status || error.statusCode;

    if (errorStatus === 400 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
      throw new Error('APIキーが無効です。設定画面で正しいAPIキーを入力してください。');
    }

    if (errorStatus === 403 || errorMessage.includes('PERMISSION_DENIED')) {
      throw new Error('APIキーに権限がありません。APIキーが有効化されているか確認してください。');
    }

    if (errorStatus === 429 || errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('rate limit')) {
      throw new Error('APIの使用制限に達しました。しばらく時間をおいてから再度お試しください。');
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
    }

    // モデルが見つからない場合
    if (errorMessage.includes('model') || errorMessage.includes('not found')) {
      throw new Error('指定されたモデルが見つかりません。設定を確認してください。');
    }

    throw new Error(`サマリーの生成に失敗しました: ${errorMessage || '不明なエラー'}`);
  }
}

/**
 * APIキーの接続テスト
 * @param apiKey - テストするAPIキー
 * @param model - テストに使用するモデル（省略時はデフォルト）
 * @returns {Promise<{success: boolean, message: string}>} テスト結果とメッセージ
 */
export async function testAPIKey(apiKey: string, model?: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'APIキーが入力されていません。' };
  }

  // APIキーの形式チェック（通常はAIzaで始まる）
  if (!apiKey.startsWith('AIza')) {
    return {
      success: false,
      message: 'APIキーの形式が正しくない可能性があります。Google AI Studioで取得したAPIキーを確認してください。'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // 指定されたモデルまたはデフォルトモデルでテスト
    const modelName = model || DEFAULT_MODEL;
    const genModel = genAI.getGenerativeModel({ model: modelName });

    // テストリクエスト情報をコンソールに出力
    console.log('=== APIキーテストリクエスト ===');
    console.log('モデル:', modelName);
    console.log('テストプロンプト:', 'Hello');
    console.log('============================');

    // 簡単なテストリクエスト
    const result = await genModel.generateContent('Hello');
    const response = await result.response;
    const text = response.text();

    // テストレスポンス情報をコンソールに出力
    console.log('=== APIキーテストレスポンス ===');
    console.log('レスポンステキスト:', text);
    console.log('レスポンス長:', text?.length || 0);
    console.log('テスト結果:', text && text.length > 0 ? '成功' : '失敗（応答が空）');
    console.log('============================');

    if (text && text.length > 0) {
      return { success: true, message: 'APIキーは有効です。' };
    } else {
      return { success: false, message: 'APIキーは有効ですが、応答が空でした。' };
    }
  } catch (error: any) {
    // エラー情報をコンソールに出力
    console.error('=== APIキーテストエラー ===');
    console.error('エラーオブジェクト:', error);
    console.error('エラーメッセージ:', error.message || String(error));
    console.error('エラーステータス:', error.status || error.statusCode);
    console.error('エラースタック:', error.stack);
    console.error('========================');

    // エラーメッセージを詳細に解析
    const errorMessage = error.message || String(error);
    const errorStatus = error.status || error.statusCode;

    if (errorStatus === 400 || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
      return {
        success: false,
        message: 'APIキーが無効です。Google AI Studioで新しいAPIキーを取得してください。'
      };
    }

    if (errorStatus === 403 || errorMessage.includes('PERMISSION_DENIED')) {
      return {
        success: false,
        message: 'APIキーに権限がありません。APIキーが有効化されているか確認してください。'
      };
    }

    if (errorStatus === 429 || errorMessage.includes('QUOTA_EXCEEDED') || errorMessage.includes('rate limit')) {
      return {
        success: false,
        message: 'APIの使用制限に達しました。しばらく時間をおいてから再度お試しください。'
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      };
    }

    // その他のエラー
    return {
      success: false,
      message: `APIキーのテストに失敗しました: ${errorMessage || '不明なエラー'}`
    };
  }
}

