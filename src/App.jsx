import { useState } from 'react'
import FileUpload from './components/FileUpload'
import SummaryCards from './components/SummaryCards'
import MonthlyChart from './components/MonthlyChart'
import CategoryChart from './components/CategoryChart'
import TransactionTable from './components/TransactionTable'

export default function App() {
  const [records, setRecords] = useState(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')

  function handleParsed(data, name) {
    setRecords(data)
    setFileName(name)
    setError('')
  }

  function handleReset() {
    setRecords(null)
    setFileName('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="font-bold text-slate-800 text-lg">Budget Dashboard</span>
          </div>
          {records && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:block">{fileName}</span>
              <button
                onClick={handleReset}
                className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50 transition-colors"
              >
                換檔案
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!records ? (
          <div className="max-w-xl mx-auto mt-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">預算分析 Dashboard</h1>
              <p className="text-slate-500">上傳你的 Excel 流水帳，立即產生視覺化報表</p>
            </div>
            <FileUpload onParsed={handleParsed} onError={setError} />
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-2">Excel 欄位建議格式</p>
              <table className="w-full text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-1">日期</th>
                    <th className="text-left py-1">類別</th>
                    <th className="text-left py-1">說明</th>
                    <th className="text-right py-1">金額</th>
                    <th className="text-right py-1">類型</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['2024-01-05', '餐飲', '午餐', '150', '支出'],
                    ['2024-01-10', '薪資', '月薪', '50000', '收入'],
                    ['2024-01-15', '交通', '捷運', '30', '支出'],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {row.map((cell, j) => (
                        <td key={j} className={`py-1 ${j >= 3 ? 'text-right' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-2">* 類型欄位可省略，系統會依金額正負值自動判斷</p>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-2xl mb-2">🤔</p>
            <p className="text-slate-600 mb-4">找不到有效的交易記錄，請確認 Excel 格式是否正確</p>
            <button onClick={handleReset} className="text-blue-500 underline text-sm">重新上傳</button>
          </div>
        ) : (
          <div className="space-y-4">
            <SummaryCards records={records} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <MonthlyChart records={records} />
              </div>
              <div>
                <CategoryChart records={records} />
              </div>
            </div>
            <TransactionTable records={records} />
          </div>
        )}
      </main>
    </div>
  )
}
