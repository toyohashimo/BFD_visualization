/**
 * モード別の比較分析指示を生成するヘルパー関数
 */

/**
 * モード別の比較分析指示を生成
 * @param analysisMode 分析モードID
 * @param selectedBrands 選択されたブランド（マスク処理済み）
 * @param selectedSegments 選択されたセグメント（フォーマット済み）
 * @returns 比較分析指示文字列
 */
export function getComparisonInstruction(
    analysisMode: string,
    selectedBrands: string[],
    selectedSegments: string[]
): string {
    switch (analysisMode) {
        case 'funnel_segment_brands':
        case 'timeline_segment_brands':
            // モード1, 4: 複数ブランド比較指示
            if (selectedBrands.length > 1) {
                const firstBrand = selectedBrands[0];
                const otherBrands = selectedBrands.slice(1);
                const isTimeline = analysisMode === 'timeline_segment_brands';

                return `【重要：複数ブランド${isTimeline ? '時系列' : ''}比較分析】
複数ブランドが含まれています。以下の点に注意して分析してください：
- **${firstBrand}を基準ブランドとして設定**し、他のブランド（${otherBrands.join('、')}）との比較分析を行ってください
- ${firstBrand}の各指標の値を基準として、他のブランドがどの程度高い/低いかを明確に示してください
- ブランド間の差が大きいポイントや特徴的な違いを重点的に指摘してください
${isTimeline ? '- 直近購入者（T1）の割合が高いブランド = アクティブユーザーが多いブランド\n- 過去購入者（T5）の割合が高いブランド = 休眠ユーザーが多いブランド\n- ブランド間のリテンション状況（T1～T3の合計割合など）を比較してください' : '- ファネルの各段階でどのブランドが強い/弱いかを分析してください'}

`;
            }
            break;

        case 'funnel_brand_segments':
        case 'timeline_brand_segments':
            // モード2, 5: 複数セグメント比較指示
            if (selectedSegments.length > 1) {
                const isTimeline = analysisMode === 'timeline_brand_segments';

                return `【重要：複数セグメント${isTimeline ? '時系列' : ''}比較分析】
複数セグメントが含まれています。以下の点に注意して分析してください：
- **セグメント間の違いを明確に示してください**
- セグメント間の差が大きいポイントや特徴的な違いを重点的に指摘してください
${isTimeline ? '- 直近購入者（T1）の割合が高いセグメント = アクティブユーザーが多いセグメント\n- 過去購入者（T5）の割合が高いセグメント = 休眠ユーザーが多いセグメント\n- セグメント別のリテンション状況（T1～T3の合計割合など）を比較してください\n- リテンション改善が必要なセグメント、または強化すべきセグメントを特定してください' : '- 各ファネル指標において、どのセグメントが高い/低いかを分析してください\n- ファネルの形状（各段階での減少傾向）がセグメント間でどう異なるかに注目してください\n- 特に強いセグメント・弱いセグメントを特定し、施策の優先順位付けに役立つ洞察を提供してください'}

`;
            }
            break;

        case 'funnel_item_segments_brands':
        case 'timeline_item_segments_brands':
            // モード3, 6: マトリクス比較指示
            if (selectedBrands.length > 1 && selectedSegments.length > 1) {
                const isTimeline = analysisMode === 'timeline_item_segments_brands';

                return `【重要：ブランド×セグメントの${isTimeline ? '時系列' : ''}マトリクス比較分析】
複数ブランドと複数セグメントが含まれています。以下の点に注意して分析してください：
- **ブランド×セグメントの2軸で分析**してください
- 各ブランドがどのセグメントで強い/弱いかを明確に示してください
- セグメント別に見た場合の各ブランドのランキング・ポジショニングを分析してください
- ブランド間の差、セグメント間の差の両方に注目し、特徴的なパターンを指摘してください
${isTimeline ? '- 選択された時系列指標（例: T1=アクティブユーザー、T5=休眠ユーザー）の意味を考慮して分析してください\n- 例: 「ブランドAは男性セグメントでアクティブユーザーが多いが女性セグメントでは少ない」など' : '- 例: 「ブランドAは男性セグメントで強いが女性セグメントでは弱い」「若年層では競合に劣るが中年層では優位」など'}
- マトリクス全体を俯瞰した洞察を提供してください

`;
            }
            break;
    }

    return '';
}
