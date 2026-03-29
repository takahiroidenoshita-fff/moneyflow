export const STORAGE_KEY = 'moneyflow_v1'

export const DEFAULT_DATA = {
  accounts: [
    { id: 1, name: 'メインバンク', balance: 0, color: '#2563eb' },
    { id: 2, name: 'サブ口座',     balance: 0, color: '#16a34a' },
  ],
  incomes: [
    { id: 1, name: 'カメラ収入', amount: 75000, day: 10, type: 'estimated' },
    { id: 2, name: 'メイン収入', amount: 500000, day: 15, type: 'confirmed' },
    { id: 3, name: '月末収入', amount: 250000, day: 31, type: 'estimated' },
  ],
  fixedCosts: [
    { id: 1,  name: "Gym's",            amount: 24882,  day: 1  },
    { id: 2,  name: 'UNEXT',            amount: 2189,   day: 1  },
    { id: 3,  name: 'スマホ・WiFi',     amount: 9888,   day: 3  },
    { id: 4,  name: 'Canva',            amount: 1180,   day: 6  },
    { id: 5,  name: 'YouTube Premium',  amount: 1280,   day: 11 },
    { id: 6,  name: 'マシン代',         amount: 21200,  day: 15 },
    { id: 7,  name: 'Adobe',            amount: 9080,   day: 20 },
    { id: 8,  name: '税理士費用',       amount: 15000,  day: 22 },
    { id: 9,  name: 'CaptureOne',       amount: 4225,   day: 23 },
    { id: 10, name: '車保険',           amount: 8280,   day: 26 },
    { id: 11, name: 'メルペイ',         amount: 10000,  day: 26 },
    { id: 12, name: 'オリコ',           amount: 20000,  day: 27 },
    { id: 13, name: '家賃',             amount: 132440, day: 27 },
    { id: 14, name: 'NISA',             amount: 30000,  day: 27 },
    { id: 15, name: 'HPB',              amount: 55000,  day: 31 },
    { id: 16, name: '駐車場',           amount: 25000,  day: 31 },
    { id: 17, name: '弁護士事務所',     amount: 31000,  day: 31 },
  ],
  spotCosts: [
    { id: 1, name: '消費税', amount: 200000, date: '2026-04-30', category: 'tax' },
  ],
  wishlist: [
    { id: 1, name: 'カメラ新機材', amount: 150000, priority: 'high', done: false },
  ],
  taxBuffer: 20,
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // migrate: add accounts if missing
      if (!parsed.accounts) parsed.accounts = DEFAULT_DATA.accounts
      return parsed
    }
  } catch {}
  return DEFAULT_DATA
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function genId() {
  return Date.now() + Math.floor(Math.random() * 100000)
}
