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

  // レシート追加後に一覧タブへ遷移
  const handleReceiptAdded = (receipt) => {
    addReceipt(receipt);
    setActiveTab('list');
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
    </div>
  );
}
