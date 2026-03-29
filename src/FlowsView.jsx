import { fmt, MONTHS, SPOT_CATEGORIES, getDaysInMonth } from './utils'
import AccountsSection from './AccountsSection'

function Section({ title, color, bg, items, onAdd, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <div style={{ fontWeight: 800, fontSize: 14, color }}>{title}</div>
        <button
          onClick={onAdd}
          style={{
            padding: '5px 14px', borderRadius: 20,
            background: bg, color, fontWeight: 700, fontSize: 11,
            border: 'none', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >+ 追加</button>
      </div>
      {items.length === 0
        ? <div style={{ color: 'var(--text3)', fontSize: 12, padding: '10px 0' }}>まだありません</div>
        : children
      }
    </div>
  )
}

function Item({ name, sub, amount, isIncome, isSpot, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '11px 14px', borderRadius: 10,
        background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 6, cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        fontWeight: 700, fontSize: 14,
        color: isIncome ? 'var(--green)' : isSpot ? 'var(--purple)' : 'var(--red)',
      }}>
        {isIncome ? '+' : '−'}{fmt(amount)}
      </div>
    </div>
  )
}

export default function FlowsView({ data, ym, onOpenModal, onUpdateBuffer, onUpdateAccounts }) {
  const { y, m } = ym
  const monthStr = `${y}-${String(m+1).padStart(2,'0')}`
  const spotsThisMonth = data.spotCosts.filter(s => s.date?.startsWith(monthStr))

  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0)
  const totalFixed = data.fixedCosts.reduce((s, i) => s + i.amount, 0)
  const totalSpot = spotsThisMonth.reduce((s, i) => s + i.amount, 0)
  const buffer = totalIncome * ((data.taxBuffer || 0) / 100)
  const net = totalIncome - totalFixed - totalSpot - buffer

  return (
    <div className="fade-up">
      {/* Net summary */}
      <div style={{
        background: net >= 0
          ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
          : 'linear-gradient(135deg, #fff1f2, #fee2e2)',
        border: `1.5px solid ${net >= 0 ? '#86efac' : '#fca5a5'}`,
        borderRadius: 16, padding: '16px 20px', marginBottom: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>
          {MONTHS[m]} 収支サマリー
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[
            { label: '収入合計', val: totalIncome, color: 'var(--green)' },
            { label: '固定費', val: totalFixed, color: 'var(--red)' },
            { label: 'スポット', val: totalSpot, color: 'var(--purple)' },
            { label: '税バッファ', val: buffer, color: 'var(--amber)' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                {fmt(item.val)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text2)' }}>月間自由資金</div>
          <div style={{
            fontSize: 24, fontWeight: 900,
            color: net >= 0 ? 'var(--green)' : 'var(--red)',
            fontFamily: 'DM Serif Display, serif',
          }}>{net < 0 ? '−' : ''}{fmt(net)}</div>
        </div>
      </div>

      {/* Accounts */}
      <AccountsSection data={data} onUpdate={onUpdateAccounts} />

      {/* Tax buffer setting */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 24,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          🧮 税金バッファ設定
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
          収入の何%を税金・貯金用に確保しますか？
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="range" min="0" max="40" step="5"
            value={data.taxBuffer || 0}
            onChange={e => onUpdateBuffer(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <div style={{
            fontWeight: 800, fontSize: 16, minWidth: 48, textAlign: 'right',
            color: 'var(--amber)',
          }}>{data.taxBuffer || 0}%</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
          = {fmt(buffer)} を自動で確保
        </div>
      </div>

      {/* Incomes */}
      <Section
        title="収入"
        color="var(--green)" bg="var(--green-light)"
        items={data.incomes}
        onAdd={() => onOpenModal('income', null)}
      >
        {data.incomes.map(inc => (
          <Item
            key={inc.id}
            name={inc.name}
            sub={`毎月${inc.day}日 · ${inc.type === 'confirmed' ? '確定' : '見込み'}`}
            amount={inc.amount}
            isIncome
            onClick={() => onOpenModal('income', inc)}
          />
        ))}
      </Section>

      {/* Fixed */}
      <Section
        title="固定費（毎月）"
        color="var(--red)" bg="var(--red-light)"
        items={data.fixedCosts}
        onAdd={() => onOpenModal('fixed', null)}
      >
        {data.fixedCosts
          .slice()
          .sort((a, b) => a.day - b.day)
          .map(fc => (
          <Item
            key={fc.id}
            name={fc.name}
            sub={`毎月${fc.day > getDaysInMonth(y, m) ? '月末' : `${fc.day}日`}`}
            amount={fc.amount}
            onClick={() => onOpenModal('fixed', fc)}
          />
        ))}
      </Section>

      {/* Spot this month */}
      <Section
        title={`スポット支出（${MONTHS[m]}）`}
        color="var(--purple)" bg="var(--purple-light)"
        items={spotsThisMonth}
        onAdd={() => onOpenModal('spot', null)}
      >
        {spotsThisMonth.map(s => (
          <Item
            key={s.id}
            name={s.name}
            sub={`${s.date} · ${SPOT_CATEGORIES[s.category]?.label || 'その他'}`}
            amount={s.amount}
            isSpot
            onClick={() => onOpenModal('spot', s)}
          />
        ))}
      </Section>

      {/* All future spots */}
      {data.spotCosts.filter(s => !s.date?.startsWith(monthStr)).length > 0 && (
        <Section
          title="今後の予定支出"
          color="var(--amber)" bg="var(--amber-light)"
          items={data.spotCosts.filter(s => !s.date?.startsWith(monthStr))}
          onAdd={() => onOpenModal('spot', null)}
        >
          {data.spotCosts
            .filter(s => !s.date?.startsWith(monthStr))
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(s => (
            <Item
              key={s.id}
              name={s.name}
              sub={`${s.date} · ${SPOT_CATEGORIES[s.category]?.label || 'その他'}`}
              amount={s.amount}
              isSpot
              onClick={() => onOpenModal('spot', s)}
            />
          ))}
        </Section>
      )}
    </div>
  )
}
