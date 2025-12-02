/**
 * LocalStorage クリーンアップスクリプト
 * 
 * 旧バージョンから新バージョンへの移行時に実行
 * ブラウザのコンソールで以下を実行してください:
 * 
 * ```javascript
 * // 全てのファネル関連データをクリア
 * localStorage.removeItem('funnel_analysis_mode');
 * localStorage.removeItem('funnel_target_brand');
 * localStorage.removeItem('funnel_selected_brands');
 * localStorage.removeItem('funnel_selected_segments');
 * localStorage.removeItem('funnel_selected_item');
 * localStorage.removeItem('chart_height');
 * 
 * // または全てクリア
 * localStorage.clear();
 * 
 * // ページをリロード
 * location.reload();
 * ```
 */

// 自動クリーンアップ関数（オプション）
export const cleanupOldLocalStorage = () => {
  const keysToClean = [
    'funnel_analysis_mode',
    'funnel_target_brand',
    'funnel_selected_brands',
    'funnel_selected_segments',
    'funnel_selected_item',
    'chart_height',
  ];

  let cleaned = false;
  
  keysToClean.forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        // JSONパースを試みる
        JSON.parse(item);
      } catch {
        // パースに失敗した場合は旧形式なので削除
        console.log(`Cleaning up old format data: ${key}`);
        localStorage.removeItem(key);
        cleaned = true;
      }
    }
  });

  return cleaned;
};

