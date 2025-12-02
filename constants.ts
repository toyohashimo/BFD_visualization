
import { SheetData } from './types';

export interface ColorTheme {
  id: string;
  name: string;
  palette: { bg: string; border: string; hex: string }[];
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  default: {
    id: 'default',
    name: 'スタンダード (青・紫)',
    palette: [
      { bg: 'rgba(102, 126, 234, 0.8)', border: '#667eea', hex: '#667eea' },
      { bg: 'rgba(237, 100, 166, 0.8)', border: '#ed64a6', hex: '#ed64a6' },
      { bg: 'rgba(52, 211, 153, 0.8)', border: '#34d399', hex: '#34d399' },
      { bg: 'rgba(251, 146, 60, 0.8)', border: '#fb923c', hex: '#fb923c' },
      { bg: 'rgba(168, 85, 247, 0.8)', border: '#a855f7', hex: '#a855f7' },
      { bg: 'rgba(236, 72, 153, 0.8)', border: '#ec4899', hex: '#ec4899' },
      { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6', hex: '#3b82f6' },
      { bg: 'rgba(234, 179, 8, 0.8)', border: '#eab308', hex: '#eab308' },
      { bg: 'rgba(20, 184, 166, 0.8)', border: '#14b8a6', hex: '#14b8a6' },
      { bg: 'rgba(239, 68, 68, 0.8)', border: '#ef4444', hex: '#ef4444' }
    ]
  },
  vivid: {
    id: 'vivid',
    name: 'ビビッド (高コントラスト)',
    palette: [
      { bg: 'rgba(255, 99, 132, 0.8)', border: '#FF6384', hex: '#FF6384' },
      { bg: 'rgba(54, 162, 235, 0.8)', border: '#36A2EB', hex: '#36A2EB' },
      { bg: 'rgba(255, 206, 86, 0.8)', border: '#FFCE56', hex: '#FFCE56' },
      { bg: 'rgba(75, 192, 192, 0.8)', border: '#4BC0C0', hex: '#4BC0C0' },
      { bg: 'rgba(153, 102, 255, 0.8)', border: '#9966FF', hex: '#9966FF' },
      { bg: 'rgba(255, 159, 64, 0.8)', border: '#FF9F40', hex: '#FF9F40' },
      { bg: 'rgba(201, 203, 207, 0.8)', border: '#C9CBCF', hex: '#C9CBCF' },
      { bg: 'rgba(231, 233, 237, 0.8)', border: '#E7E9ED', hex: '#E7E9ED' },
      { bg: 'rgba(100, 200, 100, 0.8)', border: '#64C864', hex: '#64C864' },
      { bg: 'rgba(200, 100, 100, 0.8)', border: '#C86464', hex: '#C86464' }
    ]
  },
  pastel: {
    id: 'pastel',
    name: 'パステル (優しい色合い)',
    palette: [
      { bg: 'rgba(179, 229, 252, 0.8)', border: '#81D4FA', hex: '#81D4FA' }, // Light Blue
      { bg: 'rgba(255, 204, 188, 0.8)', border: '#FFAB91', hex: '#FFAB91' }, // Deep Orange
      { bg: 'rgba(220, 237, 200, 0.8)', border: '#AED581', hex: '#AED581' }, // Light Green
      { bg: 'rgba(209, 196, 233, 0.8)', border: '#9575CD', hex: '#9575CD' }, // Deep Purple
      { bg: 'rgba(255, 249, 196, 0.8)', border: '#FFF59D', hex: '#FFF59D' }, // Yellow
      { bg: 'rgba(248, 187, 208, 0.8)', border: '#F06292', hex: '#F06292' }, // Pink
      { bg: 'rgba(178, 223, 219, 0.8)', border: '#4DB6AC', hex: '#4DB6AC' }, // Teal
      { bg: 'rgba(255, 224, 178, 0.8)', border: '#FFB74D', hex: '#FFB74D' }, // Orange
      { bg: 'rgba(225, 190, 231, 0.8)', border: '#BA68C8', hex: '#BA68C8' }, // Purple
      { bg: 'rgba(207, 216, 220, 0.8)', border: '#90A4AE', hex: '#90A4AE' }  // Blue Grey
    ]
  },
  business: {
    id: 'business',
    name: 'ビジネス (落ち着いた色)',
    palette: [
      { bg: 'rgba(52, 73, 94, 0.8)', border: '#2c3e50', hex: '#2c3e50' },
      { bg: 'rgba(149, 165, 166, 0.8)', border: '#7f8c8d', hex: '#7f8c8d' },
      { bg: 'rgba(41, 128, 185, 0.8)', border: '#2980b9', hex: '#2980b9' },
      { bg: 'rgba(39, 174, 96, 0.8)', border: '#27ae60', hex: '#27ae60' },
      { bg: 'rgba(243, 156, 18, 0.8)', border: '#f39c12', hex: '#f39c12' },
      { bg: 'rgba(211, 84, 0, 0.8)', border: '#d35400', hex: '#d35400' },
      { bg: 'rgba(192, 57, 43, 0.8)', border: '#c0392b', hex: '#c0392b' },
      { bg: 'rgba(142, 68, 173, 0.8)', border: '#8e44ad', hex: '#8e44ad' },
      { bg: 'rgba(22, 160, 133, 0.8)', border: '#16a085', hex: '#16a085' },
      { bg: 'rgba(44, 62, 80, 0.8)', border: '#2c3e50', hex: '#2c3e50' }
    ]
  },
  monochrome: {
    id: 'monochrome',
    name: 'モノクロ (グレースケール)',
    palette: [
      { bg: 'rgba(17, 24, 39, 0.8)', border: '#111827', hex: '#111827' }, // Dark Gray
      { bg: 'rgba(55, 65, 81, 0.8)', border: '#374151', hex: '#374151' }, // Gray-700
      { bg: 'rgba(75, 85, 99, 0.8)', border: '#4B5563', hex: '#4B5563' }, // Gray-600
      { bg: 'rgba(107, 114, 128, 0.8)', border: '#6B7280', hex: '#6B7280' }, // Gray-500
      { bg: 'rgba(156, 163, 175, 0.8)', border: '#9CA3AF', hex: '#9CA3AF' }, // Gray-400
      { bg: 'rgba(209, 213, 219, 0.8)', border: '#D1D5DB', hex: '#D1D5DB' }, // Gray-300
      { bg: 'rgba(229, 231, 235, 0.8)', border: '#E5E7EB', hex: '#E5E7EB' }, // Gray-200
      { bg: 'rgba(243, 244, 246, 0.8)', border: '#F3F4F6', hex: '#F3F4F6' }, // Gray-100
      { bg: 'rgba(249, 250, 251, 0.8)', border: '#F9FAFB', hex: '#F9FAFB' }, // Gray-50
      { bg: 'rgba(17, 24, 39, 0.6)', border: '#111827', hex: '#111827' }  // Dark Gray (lighter)
    ]
  },
  neon: {
    id: 'neon',
    name: 'ネオン (蛍光色)',
    palette: [
      { bg: 'rgba(255, 0, 255, 0.8)', border: '#FF00FF', hex: '#FF00FF' }, // Magenta
      { bg: 'rgba(0, 255, 255, 0.8)', border: '#00FFFF', hex: '#00FFFF' }, // Cyan
      { bg: 'rgba(255, 255, 0, 0.8)', border: '#FFFF00', hex: '#FFFF00' }, // Yellow
      { bg: 'rgba(255, 0, 128, 0.8)', border: '#FF0080', hex: '#FF0080' }, // Hot Pink
      { bg: 'rgba(0, 255, 128, 0.8)', border: '#00FF80', hex: '#00FF80' }, // Spring Green
      { bg: 'rgba(128, 0, 255, 0.8)', border: '#8000FF', hex: '#8000FF' }, // Purple
      { bg: 'rgba(255, 128, 0, 0.8)', border: '#FF8000', hex: '#FF8000' }, // Orange
      { bg: 'rgba(0, 128, 255, 0.8)', border: '#0080FF', hex: '#0080FF' }, // Bright Blue
      { bg: 'rgba(255, 0, 0, 0.8)', border: '#FF0000', hex: '#FF0000' }, // Red
      { bg: 'rgba(0, 255, 0, 0.8)', border: '#00FF00', hex: '#00FF00' }  // Lime Green
    ]
  },
  earth: {
    id: 'earth',
    name: 'アース (ナチュラル)',
    palette: [
      { bg: 'rgba(139, 90, 43, 0.8)', border: '#8B5A2B', hex: '#8B5A2B' }, // Brown
      { bg: 'rgba(160, 82, 45, 0.8)', border: '#A0522D', hex: '#A0522D' }, // Sienna
      { bg: 'rgba(205, 133, 63, 0.8)', border: '#CD853F', hex: '#CD853F' }, // Peru
      { bg: 'rgba(222, 184, 135, 0.8)', border: '#DEB887', hex: '#DEB887' }, // Burlywood
      { bg: 'rgba(139, 69, 19, 0.8)', border: '#8B4513', hex: '#8B4513' }, // Saddle Brown
      { bg: 'rgba(210, 180, 140, 0.8)', border: '#D2B48C', hex: '#D2B48C' }, // Tan
      { bg: 'rgba(188, 143, 143, 0.8)', border: '#BC8F8F', hex: '#BC8F8F' }, // Rosy Brown
      { bg: 'rgba(101, 67, 33, 0.8)', border: '#654321', hex: '#654321' }, // Dark Brown
      { bg: 'rgba(160, 120, 80, 0.8)', border: '#A07850', hex: '#A07850' }, // Medium Brown
      { bg: 'rgba(139, 115, 85, 0.8)', border: '#8B7355', hex: '#8B7355' }  // Dark Khaki
    ]
  },
  ocean: {
    id: 'ocean',
    name: 'オーシャン (ブルー系)',
    palette: [
      { bg: 'rgba(0, 119, 190, 0.8)', border: '#0077BE', hex: '#0077BE' }, // Ocean Blue
      { bg: 'rgba(0, 162, 255, 0.8)', border: '#00A2FF', hex: '#00A2FF' }, // Sky Blue
      { bg: 'rgba(0, 191, 255, 0.8)', border: '#00BFFF', hex: '#00BFFF' }, // Deep Sky Blue
      { bg: 'rgba(30, 144, 255, 0.8)', border: '#1E90FF', hex: '#1E90FF' }, // Dodger Blue
      { bg: 'rgba(70, 130, 180, 0.8)', border: '#4682B4', hex: '#4682B4' }, // Steel Blue
      { bg: 'rgba(0, 206, 209, 0.8)', border: '#00CED1', hex: '#00CED1' }, // Dark Turquoise
      { bg: 'rgba(64, 224, 208, 0.8)', border: '#40E0D0', hex: '#40E0D0' }, // Turquoise
      { bg: 'rgba(72, 209, 204, 0.8)', border: '#48D1CC', hex: '#48D1CC' }, // Medium Turquoise
      { bg: 'rgba(95, 158, 160, 0.8)', border: '#5F9EA0', hex: '#5F9EA0' }, // Cadet Blue
      { bg: 'rgba(176, 224, 230, 0.8)', border: '#B0E0E6', hex: '#B0E0E6' }  // Powder Blue
    ]
  },
  sunset: {
    id: 'sunset',
    name: 'サンセット (オレンジ・ピンク系)',
    palette: [
      { bg: 'rgba(255, 140, 0, 0.8)', border: '#FF8C00', hex: '#FF8C00' }, // Dark Orange
      { bg: 'rgba(255, 165, 0, 0.8)', border: '#FFA500', hex: '#FFA500' }, // Orange
      { bg: 'rgba(255, 192, 203, 0.8)', border: '#FFC0CB', hex: '#FFC0CB' }, // Pink
      { bg: 'rgba(255, 20, 147, 0.8)', border: '#FF1493', hex: '#FF1493' }, // Deep Pink
      { bg: 'rgba(255, 69, 0, 0.8)', border: '#FF4500', hex: '#FF4500' }, // Orange Red
      { bg: 'rgba(255, 105, 180, 0.8)', border: '#FF69B4', hex: '#FF69B4' }, // Hot Pink
      { bg: 'rgba(255, 160, 122, 0.8)', border: '#FFA07A', hex: '#FFA07A' }, // Light Salmon
      { bg: 'rgba(255, 127, 80, 0.8)', border: '#FF7F50', hex: '#FF7F50' }, // Coral
      { bg: 'rgba(255, 99, 71, 0.8)', border: '#FF6347', hex: '#FF6347' }, // Tomato
      { bg: 'rgba(255, 182, 193, 0.8)', border: '#FFB6C1', hex: '#FFB6C1' }  // Light Pink
    ]
  },
  forest: {
    id: 'forest',
    name: 'フォレスト (グリーン系)',
    palette: [
      { bg: 'rgba(34, 139, 34, 0.8)', border: '#228B22', hex: '#228B22' }, // Forest Green
      { bg: 'rgba(0, 128, 0, 0.8)', border: '#008000', hex: '#008000' }, // Green
      { bg: 'rgba(0, 100, 0, 0.8)', border: '#006400', hex: '#006400' }, // Dark Green
      { bg: 'rgba(50, 205, 50, 0.8)', border: '#32CD32', hex: '#32CD32' }, // Lime Green
      { bg: 'rgba(124, 252, 0, 0.8)', border: '#7CFC00', hex: '#7CFC00' }, // Lawn Green
      { bg: 'rgba(107, 142, 35, 0.8)', border: '#6B8E23', hex: '#6B8E23' }, // Olive Drab
      { bg: 'rgba(154, 205, 50, 0.8)', border: '#9ACD32', hex: '#9ACD32' }, // Yellow Green
      { bg: 'rgba(144, 238, 144, 0.8)', border: '#90EE90', hex: '#90EE90' }, // Light Green
      { bg: 'rgba(46, 139, 87, 0.8)', border: '#2E8B57', hex: '#2E8B57' }, // Sea Green
      { bg: 'rgba(60, 179, 113, 0.8)', border: '#3CB371', hex: '#3CB371' }  // Medium Sea Green
    ]
  }
};

// Default export kept for compatibility if needed, but prefer COLOR_THEMES
export const COLOR_PALETTE = COLOR_THEMES.default.palette;

// Brand Image Column Range (AP～FS列 in Excel)
// AP列 = 42列目（A=1, ..., Z=26, AA=27, ..., AP=42）→ インデックス41（0-based）
// FS列 = 175列目（F*26+S = 6*26+19 = 175）→ インデックス174（0-based）
export const BRAND_IMAGE_COLUMN_RANGE = {
  start: 41,   // AP列（0-based: 41）
  end: 175,    // FS列の次（0-based: 175）、範囲の end は exclusive
  count: 134   // 実際の項目数（175 - 41 = 134列）
};

// Brand Image Exclude Keywords
export const BRAND_IMAGE_EXCLUDE_KEYWORDS = [
  'あてはまるものはない'
];
