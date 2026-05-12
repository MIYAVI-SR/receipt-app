// レシート画像アップロードコンポーネント
import { useState, useRef } from 'react';

export function ReceiptUpload({ onReceiptAdded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ファイル選択時にプレビューを表示
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // レシート画像をバックエンドに送信してClaudeで解析
  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setError('画像を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '解析に失敗しました');
      }

      const receiptData = await response.json();
      onReceiptAdded(receiptData);

      // フォームをリセット
      fileInputRef.current.value = '';
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2>レシートを読み込む</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            id="receipt-input"
          />
          <label htmlFor="receipt-input" className="file-label">
            {preview ? '別の画像を選択' : '画像を選択（JPEG / PNG / WebP）'}
          </label>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="レシートプレビュー" className="preview-image" />
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={isLoading || !preview} className="submit-button">
          {isLoading ? '解析中...' : 'レシートを解析する'}
        </button>
      </form>
    </div>
  );
}
