# リファクタリング後の修正履歴

## 2025-11-29

### UI/UX改善

#### ラベル表記の統一
- **変更内容**: グラフ左上のラベル表記を統一
  - 「データシート」→「セグメント」
  - 「ブランド選択」→「ブランド」
  - 「分析項目」→「項目」
  - 「ブランド比較」→「ブランド」
  - 「セグメント比較」→「セグメント」
- **影響範囲**: `constants/analysisConfigs.ts` - 全12モード
- **変更日**: 2025-11-29

### バグ修正

#### モード4・モード5の挙動修正
- **問題**: モード4とモード5でブランドとセグメントの挙動が逆になっていた
- **修正内容**:
  - **モード4 (`timeline_brand_multi_segment`)**:
    - segments: `FILTER` → `SERIES` (セグメントがSA)
    - brands: `SERIES` → `FILTER` (ブランドがフィルタ)
    - dataTransform: `{ filter: 'brands', series: 'segments' }`
    - グラフ左上に「ブランド」を表示
  - **モード5 (`timeline_segment_multi_brand`)**:
    - segments: `SERIES` → `FILTER` (セグメントがフィルタ)
    - brands: `FILTER` → `SERIES` (ブランドがSA)
    - dataTransform: `{ filter: 'segments', series: 'brands' }`
    - グラフ左上に「セグメント」を表示
- **変更ファイル**: `constants/analysisConfigs.ts`
- **変更日**: 2025-11-29

---

**最終更新**: 2025-11-29

