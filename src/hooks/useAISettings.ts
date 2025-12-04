import { useState, useCallback, useEffect } from 'react';
import { AISettings, DEFAULT_MODEL, DEFAULT_PROMPT } from '../services/aiSummaryService';

const STORAGE_KEY_API_KEY = 'ai_summary_api_key';
const STORAGE_KEY_MODEL = 'ai_summary_model';
const STORAGE_KEY_MAX_TOKENS = 'ai_summary_max_tokens';
const STORAGE_KEY_TEMPERATURE = 'ai_summary_temperature';
const STORAGE_KEY_DEBUG_MODE = 'ai_summary_debug_mode';

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  prompt: '', // 互換性のため空文字列を保持（使用されない）
  model: DEFAULT_MODEL,
  maxTokens: 10000, // デフォルトを10000に設定
  temperature: 0.1, // デフォルトを0.1に設定（より一貫性のある出力）
  isDebugMode: false, // デフォルトはOFF
};

/**
 * デフォルトAPIキーを取得（環境変数から）
 */
const getDefaultApiKey = (): string => {
  const encrypted = import.meta.env.VITE_DEFAULT_GEMINI_API_KEY;
  if (!encrypted) return '';

  // Base64デコード（簡易的な暗号化）
  try {
    return atob(encrypted);
  } catch {
    // デコード失敗時はそのまま返す（暗号化されていない可能性）
    return encrypted;
  }
};

/**
 * AI設定を管理するフック
 */
export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
      const model = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
      let maxTokens = parseInt(localStorage.getItem(STORAGE_KEY_MAX_TOKENS) || '10000', 10);
      const temperature = parseFloat(localStorage.getItem(STORAGE_KEY_TEMPERATURE) || '0.1');
      const isDebugMode = localStorage.getItem(STORAGE_KEY_DEBUG_MODE) === 'true';

      // 既存の設定が1000以下の場合、自動的に10000に更新（思考トークン対策）
      if (!isNaN(maxTokens) && maxTokens <= 1000) {
        console.log(`maxTokensが${maxTokens}のため、10000に自動更新します（思考トークン対策）`);
        maxTokens = 10000;
        localStorage.setItem(STORAGE_KEY_MAX_TOKENS, '10000');
      }

      return {
        apiKey,
        prompt: '', // 互換性のため空文字列を保持（使用されない）
        model,
        maxTokens: isNaN(maxTokens) ? 10000 : maxTokens,
        temperature: isNaN(temperature) ? 0.1 : temperature,
        isDebugMode,
      };
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  // 設定を保存
  const saveSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };

      try {
        if (newSettings.apiKey !== undefined) {
          localStorage.setItem(STORAGE_KEY_API_KEY, updated.apiKey);
        }
        if (newSettings.model !== undefined) {
          localStorage.setItem(STORAGE_KEY_MODEL, updated.model);
        }
        if (newSettings.maxTokens !== undefined) {
          localStorage.setItem(STORAGE_KEY_MAX_TOKENS, updated.maxTokens.toString());
        }
        if (newSettings.temperature !== undefined) {
          localStorage.setItem(STORAGE_KEY_TEMPERATURE, updated.temperature.toString());
        }
        if (newSettings.isDebugMode !== undefined) {
          localStorage.setItem(STORAGE_KEY_DEBUG_MODE, updated.isDebugMode.toString());
        }

        // 他のフックインスタンスに通知
        window.dispatchEvent(new Event('ai_settings_changed'));
      } catch (error) {
        console.error('Failed to save AI settings:', error);
      }

      return updated;
    });
  }, []);

  // 他のコンポーネントでの変更を検知
  useEffect(() => {
    const handleSettingsChange = () => {
      // setTimeoutで次のティックに遅延させて、レンダリング中のstate更新を回避
      setTimeout(() => {
        try {
          const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
          const model = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
          let maxTokens = parseInt(localStorage.getItem(STORAGE_KEY_MAX_TOKENS) || '10000', 10);
          const temperature = parseFloat(localStorage.getItem(STORAGE_KEY_TEMPERATURE) || '0.1');
          const isDebugMode = localStorage.getItem(STORAGE_KEY_DEBUG_MODE) === 'true';

          setSettings({
            apiKey,
            prompt: '', // 互換性のため空文字列を保持（使用されない）
            model,
            maxTokens: isNaN(maxTokens) ? 10000 : maxTokens,
            temperature: isNaN(temperature) ? 0.1 : temperature,
            isDebugMode,
          });
        } catch (error) {
          console.error('Failed to sync AI settings:', error);
        }
      }, 0);
    };

    window.addEventListener('ai_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('ai_settings_changed', handleSettingsChange);
    };
  }, []);

  // デフォルトにリセット
  const resetToDefault = useCallback(() => {
    saveSettings({
      model: DEFAULT_MODEL,
      maxTokens: 10000, // デフォルトを10000に設定
      temperature: 0.1, // デフォルトを0.1に設定
    });
  }, [saveSettings]);

  // デバッグモードトグル
  const toggleDebugMode = useCallback(() => {
    saveSettings({ isDebugMode: !settings.isDebugMode });

    // 環境変数（デフォルトAPIキー）を反映させるためにページをリロード
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [settings.isDebugMode, saveSettings]);

  // 実際に使用するAPIキーを取得（優先度ロジック）
  const getEffectiveApiKey = useCallback((): string => {
    // 1. カスタムAPIキーが設定されていればそれを使用
    if (settings.apiKey && settings.apiKey.trim() !== '') {
      return settings.apiKey;
    }

    // 2. デバッグモードONならデフォルトAPIキーを使用
    if (settings.isDebugMode) {
      return getDefaultApiKey();
    }

    // 3. それ以外は空文字列（LLM無効）
    return '';
  }, [settings.apiKey, settings.isDebugMode]);

  return {
    settings,
    saveSettings,
    resetToDefault,
    toggleDebugMode,
    getEffectiveApiKey,
  };
};

