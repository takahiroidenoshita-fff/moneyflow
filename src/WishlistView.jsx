import { fmt } from './utils'

const PRIORITY = {
  high:   { label: '優先高', color: '#dc2626', bg: '#fee2e2' },
  medium: { label: '普通',   color: '#d97706', bg: '#fef3c7' },
  low:    { label: 'いつか', color: '#16a34a', bg: '#dcfce7' },
}

export default function WishlistView({ data, ym, onOpenModal, onToggleDone }) {
  const { y, m } = ym
  const monthStr = `${y}-${String(m+1).padStart(2,'0')}`

  // Total income minus confirmed fixed & spot obligations
  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0)
  const totalFixed = data.fixedCosts.reduce((s, i) => s + i.amount, 0)
  const totalSpot = data.spotCosts
    .filter(s => s.date?.startsWith(monthStr))
    .reduce((s, i) => s + i.amount, 0)
  const buffer = totalIncome * ((data.taxBuffer || 0) / 100)
  const free = totalIncome - totalFixed - totalSpot - buffer

  const pending = data.wishlist.filter(w => !w.done)
  const done = data.wishlist.filter(w => w.done)
  const totalWish = pending.reduce((s, w) => s + w.amount, 0)

  const canBuyAll = free >= totalWish

  return (
    <div className="fade-up">
      {/* Summary */}
      <div style={{
        background: canBuyAll
          ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
          : 'linear-gradient(135deg, #fff7ed, #fef3c7)',
        border: `1.5px solid ${canBuyAll ? '#86efac' : '#fde68a'}`,
        borderRadius: 16, padding: '16px 20px', marginBottom: 18,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
              欲しいもの 合計
            </div>
            <div style={{
              fontSize: 26, fontWeight: 900,
              color: canBuyAll ? 'var(--green)' : 'var(--amber)',
              fontFamily: 'DM Serif Display, serif',
            }}>
              {fmt(totalWish)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>今月の自由資金</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{fmt(free)}</div>
          </div>
        </div>
        <div style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 8,
          background: canBuyAll ? '#dcfce7' : '#fef3c7',
          fontSize: 12, fontWeight: 600,
          color: canBuyAll ? '#15803d' : '#92400e',
        }}>
          {canBuyAll
            ? `✅ 全部買えます！ (残り ${fmt(free - totalWish)})`
            : `⚠️ あと ${fmt(totalWish - free)} 足りません`}
        </div>
      </div>

      {/* Add button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => onOpenModal('wishlist', null)}
          style={{
            padding: '8px 18px', borderRadius: 20,
            background: 'var(--text)', color: '#fff',
            fontWeight: 700, fontSize: 12,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >+ 追加</button>
      </div>

      {/* Pending */}
      {pending.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '32px 0',
          color: 'var(--text3)', fontSize: 13,
        }}>
          欲しいものをリストに追加しましょう 🛒
        </div>
      )}

      {pending
        .slice()
        .sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 }
          return order[a.priority] - order[b.priority]
        })
        .map(item => {
          const pr = PRIORITY[item.priority] || PRIORITY.medium
          const canBuy = free >= item.amount
          return (
            <div
              key={item.id}
              style={{
                display: 'flex', gap: 12, alignItems: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 8,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleDone(item.id)}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px solid ${item.done ? 'var(--green)' : 'var(--border)'}`,
                  background: item.done ? 'var(--green)' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', transition: 'all 0.15s',
                }}
              >
                {item.done && '✓'}
              </button>

              {/* Info */}
              <div style={{ flex: 1 }} onClick={() => onOpenModal('wishlist', item)}>
                <div style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>{item.name}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    background: pr.bg, color: pr.color,
                  }}>{pr.label}</span>
                  <span style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 20,
                    background: canBuy ? 'var(--green-light)' : 'var(--red-light)',
                    color: canBuy ? 'var(--green)' : 'var(--red)',
                    fontWeight: 600,
                  }}>{canBuy ? '買える' : '予算オーバー'}</span>
                </div>
              </div>

              {/* Amount */}
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                {fmt(item.amount)}
              </div>
            </div>
          )
        })}

      {/* Done items */}
      {done.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text3)',
            marginBottom: 8, letterSpacing: '0.05em',
          }}>購入済み</div>
          {done.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', gap: 12, alignItems: 'center',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 6,
                opacity: 0.6,
              }}
            >
              <button
                onClick={() => onToggleDone(item.id)}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: '2px solid var(--green)', background: 'var(--green)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff',
                }}
              >✓</button>
              <div style={{ flex: 1, fontSize: 13, textDecoration: 'line-through', color: 'var(--text2)' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>{fmt(item.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
