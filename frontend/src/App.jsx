// レシート家計簿アプリ メインコンポーネント
import { useState } from 'react';
import { useReceipts } from './hooks/useReceipts';
import { ReceiptUpload } from './components/ReceiptUpload';
import { ReceiptList } from './components/ReceiptList';
import { Charts } from './components/Charts';

// タブの定義
const TABS = [
  { id: 'upload', label: '📷 読み込む' },
  { id: 'list', label: '📋 一覧' },
  { id: 'charts', label: '📊 グラフ' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const { receipts, addReceipt, deleteReceipt, clearAll } = useReceipts();
  const [pendingReceipt, setPendingReceipt] = useState(null);
  const [warnings, setWarnings] = useState([]);

  // 解析済みレシートをバリデーションし、問題があれば警告を表示
  const handleReceiptAdded = (receipt) => {
    const warns = [];

    // 負の金額チェック
    const negativeItems = (receipt.items || []).filter((item) => item.price < 0);
    if (negativeItems.length > 0) {
      warns.push(
        `負の金額の商品があります: ${negativeItems.map((i) => `${i.name}（¥${i.price}）`).join('、')}`
      );
    }

    // 重複チェック（同一日付 & 同一合計金額）
    const isDuplicate = receipts.some(
      (r) => r.date === receipt.date && r.total === receipt.total
    );
    if (isDuplicate) {
      warns.push(
        `同じ日付（${receipt.date}）・合計金額（¥${(receipt.total || 0).toLocaleString()}）のレシートが既に登録されています`
      );
    }

    if (warns.length > 0) {
      setWarnings(warns);
      setPendingReceipt(receipt);
    } else {
      addReceipt(receipt);
      setActiveTab('list');
    }
  };

  // 警告を確認した上で追加
  const handleConfirmAdd = () => {
    addReceipt(pendingReceipt);
    setPendingReceipt(null);
    setWarnings([]);
    setActiveTab('list');
  };

  // 警告をキャンセルして追加しない
  const handleCancelAdd = () => {
    setPendingReceipt(null);
    setWarnings([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧾 レシート家計簿</h1>
        <span className="receipt-count">{receipts.length}件登録済み</span>
      </header>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'upload' && (
          <ReceiptUpload onReceiptAdded={handleReceiptAdded} />
        )}
        {activeTab === 'list' && (
          <>
            <ReceiptList receipts={receipts} onDelete={deleteReceipt} />
            {receipts.length > 0 && (
              <button
                className="clear-button"
                onClick={() => {
                  if (window.confirm('全てのレシートを削除しますか？')) {
                    clearAll();
                  }
                }}
              >
                全て削除
              </button>
            )}
          </>
        )}
        {activeTab === 'charts' && (
          <Charts receipts={receipts} />
        )}
      </main>

      {/* 警告ダイアログ */}
      {warnings.length > 0 && (
        <div className="warning-overlay">
          <div className="warning-dialog">
            <h3 className="warning-title">⚠️ 確認</h3>
            <ul className="warning-list">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <p className="warning-question">このまま登録しますか？</p>
            <div className="warning-actions">
              <button className="warning-cancel" onClick={handleCancelAdd}>
                キャンセル
              </button>
              <button className="warning-confirm" onClick={handleConfirmAdd}>
                登録する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
