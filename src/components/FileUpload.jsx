import { useRef, useState } from 'react'
import { parseExcelFile } from '../utils/parseExcel'

export default function FileUpload({ onParsed, onError }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  async function handleFile(file) {
    if (!file) return
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      onError('請上傳 .xlsx、.xls 或 .csv 格式的檔案')
      return
    }
    setLoading(true)
    setFileName(file.name)
    try {
      const records = await parseExcelFile(file)
      onParsed(records, file.name)
    } catch (e) {
      onError('檔案解析失敗，請確認格式是否正確')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">解析 {fileName} 中...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">📊</div>
          <p className="text-lg font-medium text-slate-700">拖曳或點擊上傳 Excel 檔案</p>
          <p className="text-sm text-slate-400">支援 .xlsx、.xls、.csv 格式</p>
          <p className="text-xs text-slate-400 mt-1">欄位需包含：日期、金額、類別（支援中英文欄位名稱）</p>
        </div>
      )}
    </div>
  )
}
