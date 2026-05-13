import * as XLSX from 'xlsx'

const DATE_KEYS = ['日期', 'date', 'Date', '時間', 'time']
const AMOUNT_KEYS = ['金額', 'amount', 'Amount', '小計', '收支金額', '交易金額']
const MAIN_CAT_KEYS = ['主分類', 'main category', 'main_category']
const SUB_CAT_KEYS = ['子分類', 'sub category', 'sub_category']
const CATEGORY_KEYS = ['category', 'Category', '分類', '項目', '科目']
const NOTE_KEYS = ['備註', '說明', 'note', 'Note', 'description', '摘要', '項目說明']
// 「類別」在你的格式裡存放 支出/收入，優先視為 type
const TYPE_KEYS = ['類別', '類型', '收支', 'type', 'Type', '收入支出']
const ACCOUNT_KEYS = ['帳戶', 'account', 'Account']

function findKey(headers, candidates) {
  return headers.find(h => candidates.some(c => String(h) === c)) ||
    headers.find(h => candidates.some(c => String(h).includes(c)))
}

function parseDate(value) {
  if (!value) return null
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (!date) return null
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
  }
  const str = String(value).trim()
  // ISO or common formats
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
    const t = String(row[typeKey]).trim()
    if (t.includes('收入') || t.toLowerCase() === 'income' || t === '+') return 'income'
    if (t.includes('支出') || t.toLowerCase() === 'expense' || t === '-') return 'expense'
  }
  if (amountKey && row[amountKey] !== undefined) {
    const amt = parseFloat(String(row[amountKey]).replace(/,/g, ''))
    if (!isNaN(amt)) return amt >= 0 ? 'income' : 'expense'
  }
  return 'expense'
}

function buildCategory(row, mainKey, subKey, fallbackKey) {
  const main = mainKey ? String(row[mainKey] || '').trim() : ''
  const sub = subKey ? String(row[subKey] || '').trim() : ''
  if (main && sub && main !== sub) return `${main} / ${sub}`
  if (main) return main
  if (sub) return sub
  if (fallbackKey) return String(row[fallbackKey] || '').trim() || '未分類'
  return '未分類'
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

        if (!raw.length) { resolve([]); return }

        const headers = Object.keys(raw[0])
        const dateKey    = findKey(headers, DATE_KEYS) || headers[0]
        const amountKey  = findKey(headers, AMOUNT_KEYS) || headers.find(h =>
          raw.slice(0, 5).some(r => !isNaN(parseFloat(String(r[h]).replace(/,/g, ''))))
        )
        const mainCatKey = findKey(headers, MAIN_CAT_KEYS)
        const subCatKey  = findKey(headers, SUB_CAT_KEYS)
        const catKey     = findKey(headers, CATEGORY_KEYS)
        const noteKey    = findKey(headers, NOTE_KEYS)
        const typeKey    = findKey(headers, TYPE_KEYS)
        const accountKey = findKey(headers, ACCOUNT_KEYS)

        const records = raw
          .map((row, idx) => {
            const rawAmt = amountKey ? String(row[amountKey]).replace(/,/g, '') : '0'
            const amount = Math.abs(parseFloat(rawAmt) || 0)
            const type = inferType(row, typeKey, amountKey)
            const date = parseDate(row[dateKey])
            const category = buildCategory(row, mainCatKey, subCatKey, catKey)
            const mainCategory = mainCatKey ? String(row[mainCatKey] || '').trim() || '未分類' : category
            const note = noteKey ? String(row[noteKey]).trim() : ''
            const account = accountKey ? String(row[accountKey] || '').trim() : ''

            return { id: idx, date, amount, type, category, mainCategory, note, account, raw: row }
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

// 預設用 mainCategory 讓圓餅圖更清晰，可傳 useMain=false 改用完整 category
export function aggregateByCategory(records, type = 'expense', useMain = true) {
  const map = {}
  records.filter(r => r.type === type).forEach(r => {
    const key = useMain ? r.mainCategory : r.category
    map[key] = (map[key] || 0) + r.amount
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
}
