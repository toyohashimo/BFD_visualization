import { useState, useCallback } from 'react';

/**
 * LocalStorageとの同期を行うカスタムフック
 * 
 * 旧バージョンとの互換性:
 * - 文字列値はそのまま読み込み可能
 * - JSON形式の値はパース
 * 
 * @param skipLoad trueの場合、localStorageから読み込まず常にinitialValueを使用
 */
export const usePersistence = <T>(
  key: string,
  initialValue: T,
  skipLoad: boolean = false
): [T, (value: T | ((prev: T) => T)) => void] => {
  // 初期化時にlocalStorageから読み込み
  const [state, setState] = useState<T>(() => {
    // skipLoadがtrueの場合は、localStorageから読み込まず初期値を使用
    if (skipLoad) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      // 旧バージョンとの互換性: まずJSONパースを試み、失敗したら文字列として扱う
      try {
        return JSON.parse(item);
      } catch {
        // JSONパースに失敗した場合は、文字列または配列として返す
        // 配列の場合（例: "['brand1','brand2']"）は特殊処理
        if (item.startsWith('[') && item.endsWith(']')) {
          try {
            return JSON.parse(item.replace(/'/g, '"')) as T;
          } catch {
            return item as T;
          }
        }
        // 文字列の場合はそのまま返す
        return item as T;
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage, using initial value:`, error);
      return initialValue;
    }
  });

  // 値を設定してlocalStorageに保存
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setState((prevState) => {
          // 関数の場合は前の値を渡して実行
          const valueToStore = value instanceof Function ? value(prevState) : value;

          // デバッグログ: LocalStorage書き込みを追跡
          console.log(`[usePersistence.setValue] key="${key}"`, {
            oldValue: prevState,
            newValue: valueToStore,
            stack: new Error().stack
          });

          // localStorageに保存
          localStorage.setItem(key, JSON.stringify(valueToStore));

          return valueToStore;
        });
      } catch (error) {
        console.error(`Failed to persist ${key} to localStorage:`, error);
      }
    },
    [key]
  );

  return [state, setValue];
};

