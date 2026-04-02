export const fmt = (n) =>
  `¥${Math.abs(Math.round(n)).toLocaleString('ja-JP')}`

export const fmtShort = (n) => {
  const abs = Math.abs(Math.round(n))
  if (abs >= 100000000) return `${(abs / 100000000).toFixed(1)}億`
  if (abs >= 10000) return `${(abs / 10000).toFixed(abs % 10000 === 0 ? 0 : 1)}万`
  return abs.toLocaleString('ja-JP')
}

export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
export const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

export const SPOT_CATEGORIES = {
  tax:      { label: '税金',   color: '#dc2626' },
  car:      { label: '車関連', color: '#d97706' },
  medical:  { label: '医療',   color: '#7c3aed' },
  travel:   { label: '旅行',   color: '#2563eb' },
  other:    { label: 'その他', color: '#6b7280' },
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDow(year, month) {
  return new Date(year, month, 1).getDay()
}

// Cumulative balance at end of given day
export function getBalanceAtDay(day, year, month, data) {
  const daysInMonth = getDaysInMonth(year, month)
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  let balance = 0

  data.incomes.forEach(inc => {
    const d = Math.min(inc.day, daysInMonth)
    if (d <= day) balance += inc.amount
  })
  data.fixedCosts.forEach(fc => {
    const d = Math.min(fc.day, daysInMonth)
    if (d <= day) balance -= fc.amount
  })
  data.spotCosts
    .filter(s => s.date?.startsWith(monthStr))
    .forEach(s => {
      const d = parseInt(s.date.split('-')[2])
      if (d <= day) balance -= s.amount
    })
  return balance
}

// "Safe to spend" = real balance + future confirmed income - future fixed obligations - buffer
export function getFreeAmount(day, year, month, data) {
  const daysInMonth = getDaysInMonth(year, month)
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  // Start from real bank balance total (if set), otherwise from 0
  const totalBankBalance = (data.accounts || []).reduce((s, a) => s + (a.balance || 0), 0)
  const hasRealBalance = totalBankBalance > 0

  // Income already received up to today (only when using real balance mode)
  // In real balance mode: don't double-count past income (it's already in the bank)
  // In virtual mode: accumulate from zero like before
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const todayDate = isCurrentMonth ? today.getDate() : 0

  let base = hasRealBalance ? totalBankBalance : 0

  // Add future spot incomes after today
  let futureSpotIncome = 0
  ;(data.spotIncomes || [])
    .filter(s => s.date?.startsWith(monthStr))
    .forEach(s => {
      const d = parseInt(s.date.split('-')[2])
      if (hasRealBalance) {
        if (d > todayDate) futureSpotIncome += s.amount
      } else {
        if (d <= day) base += s.amount
      }
    })

  // Add future income (after today) that is confirmed
  let futureIncome = 0
  data.incomes.forEach(inc => {
    const d = Math.min(inc.day, daysInMonth)
    if (hasRealBalance) {
      // Only count income not yet received (after today)
      if (d > todayDate && inc.type === 'confirmed') futureIncome += inc.amount
      else if (d > todayDate && inc.type === 'estimated') futureIncome += inc.amount * 0.8 // discount estimated
    } else {
      if (d <= day) base += inc.amount
    }
  })

  // Subtract all remaining costs after today (or after `day` in virtual mode)
  let futureCosts = 0
  const cutoff = hasRealBalance ? todayDate : day

  data.fixedCosts.forEach(fc => {
    const d = Math.min(fc.day, daysInMonth)
    if (d > cutoff) futureCosts += fc.amount
  })
  data.spotCosts
    .filter(s => s.date?.startsWith(monthStr))
    .forEach(s => {
      const d = parseInt(s.date.split('-')[2])
      if (d > cutoff) futureCosts += s.amount
    })

  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0)
  const bufferRate = (data.taxBuffer || 0) / 100
  const buffer = hasRealBalance
    ? totalIncome * bufferRate * (1 - todayDate / daysInMonth) // prorate buffer for remaining month
    : totalIncome * bufferRate

  return base + futureIncome + futureSpotIncome - futureCosts - buffer
}

export function buildDayEvents(year, month, data) {
  const daysInMonth = getDaysInMonth(year, month)
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const events = {}

  const add = (day, item) => {
    if (!events[day]) events[day] = []
    events[day].push(item)
  }

  data.incomes.forEach(inc => add(Math.min(inc.day, daysInMonth), { ...inc, kind: 'income' }))
  data.fixedCosts.forEach(fc => add(Math.min(fc.day, daysInMonth), { ...fc, kind: 'fixed' }))
  data.spotCosts
    .filter(s => s.date?.startsWith(monthStr))
    .forEach(s => add(parseInt(s.date.split('-')[2]), { ...s, kind: 'spot' }))
  ;(data.spotIncomes || [])
    .filter(s => s.date?.startsWith(monthStr))
    .forEach(s => add(parseInt(s.date.split('-')[2]), { ...s, kind: 'spotIncome' }))

  return events
}
