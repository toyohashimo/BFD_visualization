import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { useAISettings } from '../src/hooks/useAISettings';
import { testAPIKey, GEMINI_MODELS, DEFAULT_MODEL } from '../src/services/aiSummaryService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, saveSettings, resetToDefault } = useAISettings();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [prompt, setPrompt] = useState(settings.prompt);
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens || 10000);
  const [temperature, setTemperature] = useState(settings.temperature || 0.1);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // モーダルが開いたときに設定を読み込む
  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.apiKey);
      setPrompt(settings.prompt);
      setModel(settings.model || DEFAULT_MODEL);
      setMaxTokens(settings.maxTokens || 10000);
      setTemperature(settings.temperature || 0.1);
      setTestResult(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSettings({
      apiKey,
      prompt,
      model,
      maxTokens,
      temperature,
    });
    setTestResult(null);
    onClose();
  };

  const handleReset = () => {
    if (confirm('プロンプトをデフォルトに戻しますか？')) {
      resetToDefault();
      setPrompt(settings.prompt);
      setModel(settings.model || DEFAULT_MODEL);
      setMaxTokens(settings.maxTokens || 10000);
      setTemperature(settings.temperature || 0.1);
    }
  };

  const handleTestAPIKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'APIキーを入力してください。' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testAPIKey(apiKey, model);
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: `テストに失敗しました: ${error.message || '不明なエラー'}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">AIサマリー設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* API Key Section */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              Gemini APIキー
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="APIキーを入力してください"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showApiKey ? 'APIキーを隠す' : 'APIキーを表示'}
                >
                  {showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                onClick={handleTestAPIKey}
                disabled={isTesting || !apiKey.trim()}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>テスト中...</span>
                  </>
                ) : (
                  'テスト'
                )}
              </button>
            </div>
            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              APIキーはGoogle AI Studio（
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                https://makersuite.google.com/app/apikey
              </a>
              ）で取得できます。
            </p>
          </div>

          {/* Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-gray-700">
                プロンプト設定
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                デフォルトに戻す
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              placeholder="プロンプトを入力してください"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-800 mb-2">使用可能な変数:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><code className="bg-blue-100 px-1 rounded">{'{{analysisMode}}'}</code> - 分析モード名</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{sheet}}'}</code> - 選択セグメント</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{selectedBrands}}'}</code> - 選択ブランド（カンマ区切り）</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{selectedItem}}'}</code> - 選択項目</li>
                <li><code className="bg-blue-100 px-1 rounded">{'{{chartData}}'}</code> - チャートデータ（JSON形式）</li>
              </ul>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <label className="block text-sm font-bold text-gray-700">
              Geminiモデル
            </label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-3 pr-8 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm appearance-none cursor-pointer"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {GEMINI_MODELS.find(m => m.value === model)?.description || 'モデルの説明'}
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700">詳細設定</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">
                  最大トークン数
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 10000)}
                  min={100}
                  max={4000}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500">100-4000の範囲で設定</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">
                  温度（Temperature）
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500">0.0-2.0の範囲（高いほど創造的）</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

