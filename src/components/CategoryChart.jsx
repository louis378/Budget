import { useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { aggregateByCategory } from '../utils/parseExcel'

const COLORS = ['#6366f1','#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16']

function formatTWD(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(value)
}

export default function CategoryChart({ records }) {
  const [type, setType] = useState('expense')
  const data = aggregateByCategory(records, type)
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-700">類別分析</h2>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-sm">
          <button
            className={`px-3 py-1 ${type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setType('expense')}
          >支出</button>
          <button
            className={`px-3 py-1 ${type === 'income' ? 'bg-green-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setType('income')}
          >收入</button>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-slate-400 py-12">無資料</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatTWD(v)} />
          </PieChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 space-y-1">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-slate-600">{d.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">{total > 0 ? `${((d.value / total) * 100).toFixed(1)}%` : '-'}</span>
              <span className="font-medium text-slate-700">{formatTWD(d.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
