import { useState, useCallback, useEffect } from 'react';
import { AISettings, DEFAULT_MODEL, DEFAULT_PROMPT } from '../services/aiSummaryService';

const STORAGE_KEY_API_KEY = 'ai_summary_api_key';
const STORAGE_KEY_PROMPT = 'ai_summary_prompt';
const STORAGE_KEY_MODEL = 'ai_summary_model';
const STORAGE_KEY_MAX_TOKENS = 'ai_summary_max_tokens';
const STORAGE_KEY_TEMPERATURE = 'ai_summary_temperature';

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  prompt: DEFAULT_PROMPT,
  model: DEFAULT_MODEL,
  maxTokens: 10000, // デフォルトを10000に設定
  temperature: 0.1, // デフォルトを0.1に設定（より一貫性のある出力）
};

/**
 * AI設定を管理するフック
 */
export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
      const prompt = localStorage.getItem(STORAGE_KEY_PROMPT) || DEFAULT_PROMPT;
      const model = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
      let maxTokens = parseInt(localStorage.getItem(STORAGE_KEY_MAX_TOKENS) || '10000', 10);
      const temperature = parseFloat(localStorage.getItem(STORAGE_KEY_TEMPERATURE) || '0.1');

      // 既存の設定が1000以下の場合、自動的に10000に更新（思考トークン対策）
      if (!isNaN(maxTokens) && maxTokens <= 1000) {
        console.log(`maxTokensが${maxTokens}のため、10000に自動更新します（思考トークン対策）`);
        maxTokens = 10000;
        localStorage.setItem(STORAGE_KEY_MAX_TOKENS, '10000');
      }

      return {
        apiKey,
        prompt,
        model,
        maxTokens: isNaN(maxTokens) ? 10000 : maxTokens,
        temperature: isNaN(temperature) ? 0.1 : temperature,
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
        if (newSettings.prompt !== undefined) {
          localStorage.setItem(STORAGE_KEY_PROMPT, updated.prompt);
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
      try {
        const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
        const prompt = localStorage.getItem(STORAGE_KEY_PROMPT) || DEFAULT_PROMPT;
        const model = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
        let maxTokens = parseInt(localStorage.getItem(STORAGE_KEY_MAX_TOKENS) || '10000', 10);
        const temperature = parseFloat(localStorage.getItem(STORAGE_KEY_TEMPERATURE) || '0.1');

        setSettings({
          apiKey,
          prompt,
          model,
          maxTokens: isNaN(maxTokens) ? 10000 : maxTokens,
          temperature: isNaN(temperature) ? 0.1 : temperature,
        });
      } catch (error) {
        console.error('Failed to sync AI settings:', error);
      }
    };

    window.addEventListener('ai_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('ai_settings_changed', handleSettingsChange);
    };
  }, []);

  // デフォルトにリセット
  const resetToDefault = useCallback(() => {
    saveSettings({
      prompt: DEFAULT_PROMPT,
      model: DEFAULT_MODEL,
      maxTokens: 10000, // デフォルトを10000に設定
      temperature: 0.1, // デフォルトを0.1に設定
    });
  }, [saveSettings]);

  return {
    settings,
    saveSettings,
    resetToDefault,
  };
};

