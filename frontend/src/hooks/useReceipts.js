// レシートデータをlocalStorageで管理するカスタムフック
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'receipt-app-data';

export function useReceipts() {
  // localStorageから初期データを読み込む
  const [receipts, setReceipts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // receiptsが変わるたびにlocalStorageへ保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  // レシートを追加
  const addReceipt = (receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  };

  // レシートを削除
  const deleteReceipt = (id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  // 全レシートを削除
  const clearAll = () => {
    setReceipts([]);
  };

  return { receipts, addReceipt, deleteReceipt, clearAll };
}
