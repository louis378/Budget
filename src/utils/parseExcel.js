import * as XLSX from 'xlsx'

const DATE_KEYS = ['日期', 'date', 'Date', '時間', 'time']
const AMOUNT_KEYS = ['金額', 'amount', 'Amount', '數量', '收支金額', '交易金額']
const CATEGORY_KEYS = ['類別', 'category', 'Category', '分類', '項目', '科目']
const NOTE_KEYS = ['說明', '備註', 'note', 'Note', 'description', '摘要', '項目說明']
const TYPE_KEYS = ['類型', '收支', 'type', 'Type', '收入支出']

function findKey(headers, candidates) {
  return headers.find(h => candidates.some(c => String(h).includes(c)))
}

function parseDate(value) {
  if (!value) return null
  // Excel serial date number
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  const str = String(value).trim()
  // Try common formats: YYYY/MM/DD, YYYY-MM-DD, MM/DD/YYYY
  const patterns = [
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
  ]
  for (const p of patterns) {
    const m = str.match(p)
    if (m) {
      if (m[1].length === 4) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
    }
  }
  return str
}

function inferType(row, typeKey, amountKey) {
  if (typeKey && row[typeKey]) {
    const t = String(row[typeKey])
    if (t.includes('收入') || t.toLowerCase() === 'income' || t === '+') return 'income'
    if (t.includes('支出') || t.toLowerCase() === 'expense' || t === '-') return 'expense'
  }
  // Infer from amount sign
  if (amountKey && row[amountKey] !== undefined) {
    const amt = parseFloat(String(row[amountKey]).replace(/,/g, ''))
    if (!isNaN(amt)) return amt >= 0 ? 'income' : 'expense'
  }
  return 'expense'
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array', cellDates: false })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (!raw.length) {
          resolve([])
          return
        }

        const headers = Object.keys(raw[0])
        const dateKey = findKey(headers, DATE_KEYS) || headers[0]
        const amountKey = findKey(headers, AMOUNT_KEYS) || headers.find(h => {
          return raw.slice(0, 5).some(r => !isNaN(parseFloat(String(r[h]).replace(/,/g, ''))))
        })
        const categoryKey = findKey(headers, CATEGORY_KEYS)
        const noteKey = findKey(headers, NOTE_KEYS)
        const typeKey = findKey(headers, TYPE_KEYS)

        const records = raw
          .map((row, idx) => {
            const rawAmt = amountKey ? String(row[amountKey]).replace(/,/g, '') : '0'
            const amount = Math.abs(parseFloat(rawAmt) || 0)
            const type = inferType(row, typeKey, amountKey)
            const date = parseDate(row[dateKey])
            const category = categoryKey ? String(row[categoryKey]).trim() || '未分類' : '未分類'
            const note = noteKey ? String(row[noteKey]).trim() : ''

            return { id: idx, date, amount, type, category, note, raw: row }
          })
          .filter(r => r.date && r.amount > 0)

        resolve(records)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function aggregateByMonth(records) {
  const map = {}
  records.forEach(r => {
    const month = r.date ? r.date.slice(0, 7) : '未知'
    if (!map[month]) map[month] = { month, income: 0, expense: 0 }
    if (r.type === 'income') map[month].income += r.amount
    else map[month].expense += r.amount
  })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
}

export function aggregateByCategory(records, type = 'expense') {
  const map = {}
  records.filter(r => r.type === type).forEach(r => {
    map[r.category] = (map[r.category] || 0) + r.amount
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
}
