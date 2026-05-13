import { useState } from 'react'

function formatTWD(value) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(value)
}

export default function TransactionTable({ records }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const hasAccount = records.some(r => r.account)

  const filtered = records.filter(r => {
    const matchType = filterType === 'all' || r.type === filterType
    const matchSearch = !search ||
      r.category.includes(search) ||
      r.note.includes(search) ||
      r.date.includes(search) ||
      (r.account && r.account.includes(search))
    return matchType && matchSearch
  })

  const total = filtered.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">明細列表</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={handleSearch}
            placeholder="搜尋類別、說明、帳戶、日期..."
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(1) }}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
          >
            <option value="all">全部</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-left">
              <th className="px-4 py-3 font-medium">日期</th>
              <th className="px-4 py-3 font-medium">分類</th>
              {hasAccount && <th className="px-4 py-3 font-medium">帳戶</th>}
              <th className="px-4 py-3 font-medium">說明</th>
              <th className="px-4 py-3 font-medium text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{r.mainCategory}</span>
                    {r.category !== r.mainCategory && (
                      <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full text-xs border border-slate-200">
                        {r.category.split(' / ')[1]}
                      </span>
                    )}
                  </div>
                </td>
                {hasAccount && (
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{r.account || '-'}</td>
                )}
                <td className="px-4 py-2.5 text-slate-600 max-w-xs">
                  <div className="truncate" title={r.note}>{r.note || '-'}</div>
                </td>
                <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${r.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {r.type === 'income' ? '+' : '-'}{formatTWD(r.amount)}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={hasAccount ? 5 : 4} className="text-center text-slate-400 py-8">無符合的記錄</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
          <span>共 {total} 筆</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-slate-100">‹</button>
            <span className="px-2 py-1">{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded disabled:opacity-30 hover:bg-slate-100">›</button>
          </div>
        </div>
      )}
    </div>
  )
}
