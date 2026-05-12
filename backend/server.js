// レシート読み込み家計簿アプリ バックエンドサーバー
import express from 'express';
import cors from 'cors';
import multer, { memoryStorage } from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Claude APIクライアント初期化
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// メモリストレージ（ファイルをディスクに保存しない）
const upload = multer({ storage: memoryStorage() });

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// レシート解析エンドポイント
app.post('/api/analyze-receipt', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルが必要です' });
    }

    // 画像をBase64エンコード
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    // サポートする画像形式の確認
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(mediaType)) {
      return res.status(400).json({ error: 'JPEG、PNG、GIF、WebP形式の画像のみ対応しています' });
    }

    // Claude APIでレシートを解析（システムプロンプトにprompt cachingを適用）
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          // コスト削減のためシステムプロンプトをキャッシュ
          cache_control: { type: 'ephemeral' },
          text: `あなたはレシート解析の専門家です。レシート画像を解析して、以下のJSON形式で情報を返してください。

返却するJSONの形式:
{
  "storeName": "店舗名（不明な場合は「不明」）",
  "date": "YYYY-MM-DD形式の日付（不明な場合は今日の日付）",
  "items": [
    {
      "name": "商品名",
      "price": 金額（数値）,
      "category": "カテゴリ名"
    }
  ],
  "total": 合計金額（数値）
}

カテゴリの分類ルール:
- 食費: スーパーや食料品店での食材、飲み物（アルコール含む）
- 外食: レストラン、カフェ、ファストフード、テイクアウト
- 日用品: 洗剤、シャンプー、トイレットペーパーなどの生活必需品
- 交通費: 電車、バス、タクシー、ガソリン代
- 医療費: 薬局、病院、医薬品
- 娯楽費: 映画、ゲーム、本、趣味関連
- その他: 上記に当てはまらないもの

注意事項:
- 金額は税込みの数値のみ（円記号や¥は含めない）
- 日付が読み取れない場合は今日の日付を使用
- 商品名が読み取れない場合は「不明な商品」とする
- JSONのみを返し、説明文は不要`,
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'このレシートを解析して、指定されたJSON形式で返してください。JSONのみを返してください。',
            },
          ],
        },
      ],
    });

    // レスポンスからJSONを抽出
    const responseText = message.content[0].text;
    // マークダウンのコードブロックがある場合は除去
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let receiptData;
    try {
      receiptData = JSON.parse(jsonText);
    } catch {
      return res.status(500).json({ error: 'レシートデータの解析に失敗しました', raw: responseText });
    }

    // IDを付与して返却
    receiptData.id = Date.now().toString();
    res.json(receiptData);
  } catch (error) {
    console.error('レシート解析エラー:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました', message: error.message });
  }
});

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`バックエンドサーバーが起動しました: http://localhost:${PORT}`);
});
