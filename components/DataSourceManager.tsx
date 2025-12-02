/**
 * データソース管理コンポーネント
 * 
 * 複数のExcelファイル（データソース）の管理UI
 * - ファイル追加（最大3つ）
 * - データソース名編集
 * - 表示/非表示切り替え
 * - データソース削除
 */

import React, { useState, useRef } from 'react';
import { Database, Edit2, Trash2, Plus, Eye, EyeOff, AlertCircle, RotateCcw } from 'lucide-react';
import { DataSource } from '../src/types/dataSource';

interface DataSourceManagerProps {
  /** データソースリスト */
  dataSources: DataSource[];
  
  /** ファイル追加ハンドラ */
  onAdd: (file: File) => Promise<void>;
  
  /** データソース削除ハンドラ */
  onRemove: (id: string) => void;
  
  /** データソース名更新ハンドラ */
  onUpdateName: (id: string, name: string) => void;
  
  /** 表示/非表示切り替えハンドラ */
  onToggleActive: (id: string) => void;
  
  /** 全データソースリセットハンドラ */
  onResetAll?: () => void;
  
  /** 読み込み中フラグ */
  isLoading?: boolean;
  
  /** 現在の分析モード（過去比較モード用） */
  analysisMode?: string;
}

/**
 * データソース管理コンポーネント
 */
export const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  dataSources,
  onAdd,
  onRemove,
  onUpdateName,
  onToggleActive,
  onResetAll,
  isLoading = false,
  analysisMode
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // アクティブなデータソースを取得
  const activeSources = dataSources.filter(ds => ds.isActive);
  const referenceSource = activeSources.length > 0 ? activeSources[0] : null;

  // ブランドイメージ分析モードかどうかをチェック
  const isBrandImageMode = analysisMode === 'historical_brand_image_segment_brand';

  /**
   * 編集開始
   */
  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  /**
   * 編集保存
   */
  const handleSave = (id: string) => {
    if (editingName.trim()) {
      onUpdateName(id, editingName.trim());
    }
    setEditingId(null);
  };

  /**
   * 編集キャンセル
   */
  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  /**
   * ファイル選択ハンドラ
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAdd(file);
      // input要素をリセット（同じファイルを再度選択可能にする）
      e.target.value = '';
    }
  };

  /**
   * 削除確認
   */
  const handleDelete = (id: string, name: string) => {
    // 最後の1つを削除しようとしている場合
    if (dataSources.length === 1) {
      if (confirm(`「${name}」を削除しますか？\n\nこれは最後のデータソースです。削除すると、グラフが表示されなくなります。\n\nこの操作は取り消せません。`)) {
        onRemove(id);
      }
    } else {
      if (confirm(`「${name}」を削除しますか？\nこの操作は取り消せません。`)) {
        onRemove(id);
      }
    }
  };

  /**
   * 全リセット確認
   */
  const handleResetAll = () => {
    if (dataSources.length === 0) return;
    
    if (confirm('全てのデータソースを削除しますか？\nこの操作は取り消せません。')) {
      onResetAll?.();
    }
  };

  return (
    <div className="space-y-3">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3" /> データソース管理
        </label>
        {onResetAll && dataSources.length > 0 && (
          <button
            onClick={handleResetAll}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="全データソースをリセット"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 基準データソース警告（ブランドイメージ分析モード時のみ） */}
      {isBrandImageMode && referenceSource && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-yellow-800">
                基準データソース: <span className="font-bold">{referenceSource.name}</span>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                TOP30項目の選定基準となるデータソースです
              </div>
            </div>
          </div>
        </div>
      )}

      {/* データソースリスト */}
      <div className="space-y-2">
        {dataSources.length === 0 ? (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 text-center">
            データソースがありません<br />
            ファイルを追加してください
          </div>
        ) : (
          dataSources.map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* トグルスイッチ */}
              <button
                onClick={() => onToggleActive(source.id)}
                className="flex-shrink-0 p-1 hover:bg-white rounded transition-colors"
                title={source.isActive ? '非表示にする' : '表示する'}
              >
                {source.isActive ? (
                  <Eye className="w-4 h-4 text-indigo-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* 名前表示/編集 */}
              <div className="flex-1 min-w-0">
                {editingId === source.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSave(source.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(source.id);
                      if (e.key === 'Escape') handleCancel();
                    }}
                    className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={20}
                    autoFocus
                  />
                ) : (
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium truncate ${
                        source.isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}
                      title={source.name}
                    >
                      {source.name}
                    </span>
                    <span className="text-xs text-gray-400 truncate" title={source.fileName}>
                      {source.fileName}
                    </span>
                  </div>
                )}
              </div>

              {/* 編集・削除ボタン */}
              {editingId !== source.id && (
                <>
                  <button
                    onClick={() => handleEdit(source.id, source.name)}
                    className="flex-shrink-0 p-1 text-gray-500 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                    title="名前を編集"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(source.id, source.name)}
                    className="flex-shrink-0 p-1 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ファイル追加ボタン */}
      {dataSources.length < 3 && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isLoading ? '読み込み中...' : `ファイル追加 (${dataSources.length}/3)`}
          </button>
        </div>
      )}

      {/* 最大数到達メッセージ */}
      {dataSources.length >= 3 && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <span className="font-medium">最大数に達しました</span>
          <br />
          データソースは最大3つまでです
        </div>
      )}
    </div>
  );
};

