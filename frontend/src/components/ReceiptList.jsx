// 登録済みレシート一覧コンポーネント
const CATEGORY_COLORS = {
  食費: '#4CAF50',
  外食: '#FF9800',
  日用品: '#2196F3',
  交通費: '#9C27B0',
  医療費: '#F44336',
  娯楽費: '#00BCD4',
  その他: '#9E9E9E',
};

export function ReceiptList({ receipts, onDelete }) {
  if (receipts.length === 0) {
    return (
      <div className="list-card">
        <h2>レシート一覧</h2>
        <p className="empty-message">まだレシートが登録されていません</p>
      </div>
    );
  }

  // 合計金額を計算
  const grandTotal = receipts.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div className="list-card">
      <div className="list-header">
        <h2>レシート一覧</h2>
        <span className="total-badge">合計: ¥{grandTotal.toLocaleString()}</span>
      </div>

      <div className="receipt-items">
        {receipts.map((receipt) => (
          <div key={receipt.id} className="receipt-item">
            <div className="receipt-item-header">
              <div>
                <span className="store-name">{receipt.storeName}</span>
                <span className="receipt-date">{receipt.date}</span>
              </div>
              <div className="receipt-item-right">
                <span className="receipt-total">¥{(receipt.total || 0).toLocaleString()}</span>
                <button
                  onClick={() => onDelete(receipt.id)}
                  className="delete-button"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>
            </div>

            {receipt.items && receipt.items.length > 0 && (
              <div className="items-list">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <span
                      className="category-badge"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#9E9E9E' }}
                    >
                      {item.category}
                    </span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">¥{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
