import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { aggregateByMonth } from '../utils/parseExcel'

function formatTWD(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(value)
}

export default function MonthlyChart({ records }) {
  const data = aggregateByMonth(records)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 className="text-base font-semibold text-slate-700 mb-4">每月收支趨勢</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => formatTWD(v)} />
          <Legend />
          <Bar dataKey="income" name="收入" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
