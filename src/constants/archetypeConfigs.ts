/**
 * アーキタイプ分析の設定
 * ブランドパーソナリティを12の原型で評価する
 */

/**
 * アーキタイプの定義
 */
export interface ArchetypeDefinition {
  id: string;
  name: string;
  englishName: string;
  items: string[];  // 対応するブランドイメージ項目名
  description: string;
}

/**
 * 12タイプのアーキタイプ定義
 */
export const ARCHETYPE_DEFINITIONS: Record<string, ArchetypeDefinition> = {
  creator: {
    id: 'creator',
    name: '創造者',
    englishName: 'Creator',
    items: [
      '新しい価値を提案する',
      '先見性のある',
      '独創性がある',
      '知的な',
      '信念・ポリシーのある'
    ],
    description: '新しい価値を創造し、革新的なアイデアを提供する'
  },
  ruler: {
    id: 'ruler',
    name: '統治者',
    englishName: 'Ruler',
    items: [
      'その分野をけん引している',
      '社会的責任感のある',
      '伝統的な',
      '一流である'
    ],
    description: 'その分野をリードし、権威と信頼を持つ'
  },
  sage: {
    id: 'sage',
    name: '賢者',
    englishName: 'Sage',
    items: [
      '進歩的な',
      '先見性のある',
      '商品、サービスの質がよい',
      '知的な',
      '専門性がある'
    ],
    description: '知識と専門性を持ち、真実を追求する'
  },
  explorer: {
    id: 'explorer',
    name: '探検家',
    englishName: 'Explorer',
    items: [
      '個性的な',
      '人々をワクワクさせる',
      'チャレンジ精神のある',
      '信念・ポリシーのある',
      '大胆な'
    ],
    description: '新しい体験を求め、自由と冒険を重視する'
  },
  innocent: {
    id: 'innocent',
    name: '幼子',
    englishName: 'Innocent',
    items: [
      '誠実な',
      '親切な',
      'わかりやすい',
      'シンプルな',
      'ピュアな'
    ],
    description: '純粋で誠実、シンプルさと信頼を大切にする'
  },
  outlaw: {
    id: 'outlaw',
    name: '無法者',
    englishName: 'Outlaw',
    items: [
      '革新的な',
      'たくましい・力強い',
      'チャレンジ精神のある',
      '大胆な'
    ],
    description: '既存の枠を破り、革新的な変化をもたらす'
  },
  magician: {
    id: 'magician',
    name: '魔術師',
    englishName: 'Magician',
    items: [
      '現代的な',
      '革新的な',
      '人々をワクワクさせる',
      '夢のある',
      '知的な'
    ],
    description: '夢を現実にし、特別な体験を創造する'
  },
  hero: {
    id: 'hero',
    name: '英雄',
    englishName: 'Hero',
    items: [
      '期待されている',
      '革新的な',
      '人々をワクワクさせる',
      '力をもらえる',
      '高性能な'
    ],
    description: '困難を乗り越え、勇気と力を与える'
  },
  lover: {
    id: 'lover',
    name: '恋人',
    englishName: 'Lover',
    items: [
      '感性に訴える',
      '華やかな',
      '魅力的な'
    ],
    description: '美と魅力を追求し、感性に訴える'
  },
  jester: {
    id: 'jester',
    name: '道化師',
    englishName: 'Jester',
    items: [
      '楽しい',
      '革新的な',
      '人々をワクワクさせる',
      '活気がある',
      '大胆な'
    ],
    description: '楽しさと喜びをもたらし、人生を楽しむ'
  },
  regular: {
    id: 'regular',
    name: '仲間',
    englishName: 'Regular Guy/Gal',
    items: [
      '気楽に接することができる',
      '社交的な',
      '親切な',
      '庶民的な'
    ],
    description: '親しみやすく、身近な存在として共感を得る'
  },
  caregiver: {
    id: 'caregiver',
    name: '援助者',
    englishName: 'Caregiver',
    items: [
      '生活をよりよくしてくれる',
      '安心・信頼できる',
      '誠実な',
      '親切な',
      '消費者のことを考えている'
    ],
    description: '他者をケアし、安心と信頼を提供する'
  }
};

/**
 * アーキタイプの表示順序
 */
export const ARCHETYPE_ORDER: string[] = [
  'creator',
  'ruler',
  'sage',
  'explorer',
  'innocent',
  'outlaw',
  'magician',
  'hero',
  'lover',
  'jester',
  'regular',
  'caregiver'
];

