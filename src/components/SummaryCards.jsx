function Card({ title, amount, color, icon }) {
  const formatted = new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount)

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4`}>
      <div className={`text-3xl w-14 h-14 flex items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{formatted}</p>
      </div>
    </div>
  )
}

export default function SummaryCards({ records }) {
  const income = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const balance = income - expense

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="總收入" amount={income} icon="💰" color="bg-green-50" />
      <Card title="總支出" amount={expense} icon="💸" color="bg-red-50" />
      <Card title="結餘" amount={balance} icon={balance >= 0 ? '📈' : '📉'} color={balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'} />
    </div>
  )
}
