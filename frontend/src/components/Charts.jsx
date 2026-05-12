// グラフコンポーネント（カテゴリ別円グラフ・月別棒グラフ）
import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.jsコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// カテゴリごとの色定義
const CATEGORY_COLORS = {
  食費: 'rgba(76, 175, 80, 0.8)',
  外食: 'rgba(255, 152, 0, 0.8)',
  日用品: 'rgba(33, 150, 243, 0.8)',
  交通費: 'rgba(156, 39, 176, 0.8)',
  医療費: 'rgba(244, 67, 54, 0.8)',
  娯楽費: 'rgba(0, 188, 212, 0.8)',
  その他: 'rgba(158, 158, 158, 0.8)',
};

export function Charts({ receipts }) {
  // カテゴリ別集計データを計算
  const categoryData = useMemo(() => {
    const totals = {};
    receipts.forEach((receipt) => {
      (receipt.items || []).forEach((item) => {
        totals[item.category] = (totals[item.category] || 0) + item.price;
      });
    });
    return totals;
  }, [receipts]);

  // 月別集計データを計算
  const monthlyData = useMemo(() => {
    const totals = {};
    receipts.forEach((receipt) => {
      if (!receipt.date) return;
      // YYYY-MM形式でグループ化
      const month = receipt.date.substring(0, 7);
      totals[month] = (totals[month] || 0) + (receipt.total || 0);
    });
    // 月順にソート
    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12); // 直近12ヶ月
  }, [receipts]);

  if (receipts.length === 0) {
    return (
      <div className="charts-card">
        <h2>グラフ</h2>
        <p className="empty-message">データが登録されるとグラフが表示されます</p>
      </div>
    );
  }

  // 円グラフ用データ
  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: Object.keys(categoryData).map(
          (cat) => CATEGORY_COLORS[cat] || 'rgba(158, 158, 158, 0.8)'
        ),
        borderWidth: 1,
      },
    ],
  };

  // 棒グラフ用データ
  const barData = {
    labels: monthlyData.map(([month]) => month),
    datasets: [
      {
        label: '月別支出（円）',
        data: monthlyData.map(([, total]) => total),
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `¥${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `¥${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="charts-card">
      <h2>支出グラフ</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>カテゴリ別支出</h3>
          <Pie data={pieData} />
          <div className="category-summary">
            {Object.entries(categoryData).map(([cat, total]) => (
              <div key={cat} className="category-row">
                <span
                  className="color-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] || '#9E9E9E' }}
                />
                <span>{cat}</span>
                <span>¥{total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3>月別支出</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
