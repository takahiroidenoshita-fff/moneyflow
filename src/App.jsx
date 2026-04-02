import { useState, useEffect } from 'react'
import { loadData, saveData, genId } from './store'
import { MONTHS, fmtShort, getDaysInMonth, getFreeAmount } from './utils'
import CalendarView from './CalendarView'
import FlowsView from './FlowsView'
import WishlistView from './WishlistView'
import Modal from './Modal'

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('calendar')
  const [ym, setYm] = useState(() => {
    const now = new Date()
    return { y: now.getFullYear(), m: now.getMonth() }
  })
  const [modal, setModal] = useState(null) // { type, item?, defaults? }

  useEffect(() => { saveData(data) }, [data])

  const { y, m } = ym

  const prevMonth = () => setYm(({ y, m }) =>
    m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })
  const nextMonth = () => setYm(({ y, m }) =>
    m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })

  // ── Modal handlers ──
  const openModal = (type, item = null, defaults = {}) => {
    setModal({ type, item, defaults })
  }
  const closeModal = () => setModal(null)

  const handleSave = (item) => {
    const { type } = modal
    const key = type === 'income' ? 'incomes'
      : type === 'fixed' ? 'fixedCosts'
      : type === 'spot' ? 'spotCosts'
      : type === 'spotIncome' ? 'spotIncomes'
      : 'wishlist'

    setData(prev => ({
      ...prev,
      [key]: modal.item
        ? prev[key].map(i => i.id === modal.item.id ? { ...item, id: modal.item.id } : i)
        : [...prev[key], { ...item, id: genId() }],
    }))
    closeModal()
  }

  const handleDelete = (type, id) => {
    const key = type === 'income' ? 'incomes'
      : type === 'fixed' ? 'fixedCosts'
      : type === 'spot' ? 'spotCosts'
      : type === 'spotIncome' ? 'spotIncomes'
      : 'wishlist'
    setData(prev => ({ ...prev, [key]: prev[key].filter(i => i.id !== id) }))
    closeModal()
  }

  const handleToggleDone = (id) => {
    setData(prev => ({
      ...prev,
      wishlist: prev.wishlist.map(w => w.id === id ? { ...w, done: !w.done } : w),
    }))
  }

  const handleUpdateBuffer = (val) => {
    setData(prev => ({ ...prev, taxBuffer: val }))
  }

  const handleUpdateAccounts = (accounts) => {
    setData(prev => ({ ...prev, accounts }))
  }

  // Summary values for header
  const daysInMonth = getDaysInMonth(y, m)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m
  const refDay = isCurrentMonth ? today.getDate() : daysInMonth
  const freeSummary = getFreeAmount(refDay, y, m, data)

  const wishlistPending = data.wishlist.filter(w => !w.done).length

  const tabs = [
    { id: 'calendar', label: 'カレンダー' },
    { id: 'flows', label: '収支管理' },
    { id: 'wishlist', label: `欲しいもの${wishlistPending ? ` · ${wishlistPending}` : ''}` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(247, 245, 240, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Top row: logo + month nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 22, color: 'var(--text)',
              letterSpacing: '-0.5px',
            }}>MoneyFlow</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={prevMonth}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >‹</button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                {y}年 {MONTHS[m]}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: freeSummary >= 0 ? 'var(--green)' : 'var(--red)',
              }}>
                使える: {freeSummary < 0 ? '−' : ''}{fmtShort(freeSummary)}
              </div>
            </div>

            <button
              onClick={nextMonth}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 16, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >›</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', padding: '0 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 14px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--text)' : 'transparent'}`,
                color: tab === t.id ? 'var(--text)' : 'var(--text3)',
                fontWeight: tab === t.id ? 700 : 400,
                fontSize: 13, transition: 'all 0.15s', cursor: 'pointer',
                marginBottom: -1,
              }}
            >{t.label}</button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ padding: '16px 14px 80px', maxWidth: 560, margin: '0 auto' }}>
        {tab === 'calendar' && (
          <CalendarView
            data={data}
            ym={ym}
            onOpenModal={openModal}
          />
        )}
        {tab === 'flows' && (
          <FlowsView
            data={data}
            ym={ym}
            onOpenModal={openModal}
            onUpdateBuffer={handleUpdateBuffer}
            onUpdateAccounts={handleUpdateAccounts}
          />
        )}
        {tab === 'wishlist' && (
          <WishlistView
            data={data}
            ym={ym}
            onOpenModal={openModal}
            onToggleDone={handleToggleDone}
          />
        )}
      </main>

      {/* ── Modal ── */}
      {modal && (
        <Modal
          modal={modal}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
