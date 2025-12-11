/**
 * データソース型定義
 * 
 * 過去比較モードで使用する複数データソース（Excelファイル）の管理
 */

import { BrandImageData } from './data';
import { FunnelMetrics, TimelineMetrics, BrandPowerMetrics, FuturePowerMetrics, ArchetypeMetrics } from './metrics';

/**
 * メトリクス型の統合
 */
export type AnyMetrics =
  | FunnelMetrics
  | TimelineMetrics
  | BrandPowerMetrics
  | FuturePowerMetrics
  | ArchetypeMetrics;

/**
 * データ構造（1ファイル分）
 * セグメント → ブランド → メトリクス
 */
export type DataStructure = Record<string, Record<string, AnyMetrics>>;

/**
 * データソース（1ファイル分のデータ）
 */
export interface DataSource {
  /** 一意識別子 (uuid) */
  id: string;

  /** 表示名（編集可能、最大20文字） */
  name: string;

  /** 元ファイル名 */
  fileName: string;

  /** アップロード日時 */
  uploadedAt: Date;

  /** 実データ（セグメント → ブランド → メトリクス） */
  data: DataStructure;

  /** ブランドイメージデータ（オプション） */
  brandImageData?: Record<string, BrandImageData>;

  /** グラフ・データテーブルへの表示ON/OFF */
  isActive: boolean;
}

/**
 * 複数データソース管理状態
 */
export interface MultiDataSourceState {
  /** データソースリスト（最大5つ） */
  dataSources: DataSource[];

  /** 詳細分析モードで使用中のデータソースID */
  currentSourceId: string | null;
}

/**
 * データソース追加結果
 */
export interface AddDataSourceResult {
  success: boolean;
  dataSource?: DataSource;
  error?: string;
}

