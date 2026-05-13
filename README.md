# Budget Dashboard

Excel 預算明細分析工具，上傳流水帳即可即時產生視覺化報表。

**線上使用：** https://louis378.github.io/Budget/

---

## 功能

- **拖曳上傳** Excel / CSV 檔案，自動解析欄位
- **總覽卡片**：總收入、總支出、結餘
- **每月收支長條圖**：一眼看出各月趨勢
- **類別圓餅圖**：切換收入 / 支出分析
- **明細列表**：搜尋、篩選類型、分頁瀏覽

---

## Excel 格式說明

支援 `.xlsx`、`.xls`、`.csv`，欄位名稱支援中英文。

| 欄位 | 說明 | 範例 |
|------|------|------|
| 日期 | 交易日期 | `2024-01-05` |
| 類別 | 費用分類 | `餐飲` |
| 說明 | 交易備註（可省略）| `午餐` |
| 金額 | 交易金額（正負值皆可）| `150` |
| 類型 | `收入` 或 `支出`（可省略，依金額正負自動判斷）| `支出` |

> 範例檔案下載：[Budget_範例.xlsx](https://louis378.github.io/Budget/Budget_範例.xlsx)

---

## 本機開發

```bash
# 安裝套件
npm install

# 啟動開發伺服器
npm run dev

# 建置正式版
npm run build
```

---

## 技術架構

| 項目 | 使用技術 |
|------|---------|
| 前端框架 | React 19 + Vite |
| 樣式 | Tailwind CSS v4 |
| 圖表 | Recharts |
| Excel 解析 | xlsx |
| 部署 | GitHub Pages + GitHub Actions |

---

## 自動部署

推送到 `main` 分支後，GitHub Actions 會自動建置並部署到 GitHub Pages，無需手動操作。
