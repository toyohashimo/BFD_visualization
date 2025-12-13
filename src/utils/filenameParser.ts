/**
 * ファイル名パーサーユーティリティ
 * 
 * ファイル名から日付情報を抽出し、表示用の文字列に変換する
 */

/**
 * ファイル名から期間名を抽出
 * 
 * 以下のパターンをサポート:
 * - YYYY_MM, YYYY-MM → "YYYY年M月"
 * - YYYY_Q1-Q4 → "YYYY年Q1-Q4"
 * - YYYYMM → "YYYY年M月"
 * - MonYYYY → "YYYY年M月"
 * - YYYY_MM_DD → "YYYY年M月D日"
 * 
 * @param filename ファイル名
 * @param fallbackIndex パターンマッチしない場合のフォールバックインデックス
 * @returns 抽出された期間名
 */
export const extractDateFromFilename = (filename: string, fallbackIndex: number = 1): string => {
    // 拡張子を削除
    const nameWithoutExt = filename.replace(/\.(xlsx|xls|csv)$/i, '');

    const patterns: Array<{
        regex: RegExp;
        format: (match: RegExpMatchArray) => string;
    }> = [
            // YYYY_MM, YYYY-MM
            {
                regex: /(\d{4})[_-](\d{1,2})(?![_-]?\d)/,
                format: (m) => `${m[1]}年${parseInt(m[2])}月`
            },
            // YYYY_Q1-Q4, YYYYQ1-Q4
            {
                regex: /(\d{4})[_-]?Q([1-4])/i,
                format: (m) => `${m[1]}年Q${m[2]}`
            },
            // MonYYYY (Jan, Feb, etc.)
            {
                regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[_-]?(\d{4})/i,
                format: (m) => {
                    const months: Record<string, string> = {
                        jan: '1', feb: '2', mar: '3', apr: '4', may: '5', jun: '6',
                        jul: '7', aug: '8', sep: '9', oct: '10', nov: '11', dec: '12'
                    };
                    return `${m[2]}年${months[m[1].toLowerCase()]}月`;
                }
            },
            // YYYY_MM_DD, YYYY-MM-DD
            {
                regex: /(\d{4})[_-](\d{2})[_-](\d{2})/,
                format: (m) => `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日`
            },
            // YYYYMM (最後にチェック - より具体的なパターンを先に)
            {
                regex: /(\d{4})(\d{2})(?!\d)/,
                format: (m) => `${m[1]}年${parseInt(m[2])}月`
            }
        ];

    for (const pattern of patterns) {
        const match = nameWithoutExt.match(pattern.regex);
        if (match) {
            return pattern.format(match);
        }
    }

    // パターンマッチしない場合: データ1, データ2, データ3
    return `データ${fallbackIndex}`;
};
