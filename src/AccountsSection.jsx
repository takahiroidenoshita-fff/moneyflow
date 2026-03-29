import { useState } from 'react'
import { fmt, fmtShort } from './utils'
import { genId } from './store'

const ACCOUNT_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#dc2626',
  '#7c3aed', '#0891b2', '#db2777', '#65a30d',
]

function AccountCard({ account, onEdit }) {
  return (
    <div
      onClick={() => onEdit(account)}
      style={{
        background: 'var(--surface)',
        border: `1.5px solid ${account.color}40`,
        borderLeft: `4px solid ${account.color}`,
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.15s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{account.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>タップして残高を編集</div>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 900,
        color: account.balance >= 0 ? account.color : 'var(--red)',
        fontFamily: 'DM Serif Display, serif',
        letterSpacing: '-0.5px',
      }}>
        {account.balance < 0 ? '−' : ''}{fmt(account.balance)}
      </div>
    </div>
  )
}

function EditModal({ account, onSave, onDelete, onClose }) {
  const isNew = !account.id
  const [form, setForm] = useState({ ...account, balance: String(account.balance ?? '') })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 540, padding: '24px 20px 40px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>
          {isNew ? '口座を追加' : '口座を編集'}
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>
            口座名
          </label>
          <input
            autoFocus
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="例: メインバンク"
            style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--surface2)', border: '1.5px solid var(--border)',
              borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none',
            }}
          />
        </div>

        {/* Balance */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>
            現在の残高（円）
          </label>
          <input
            type="number"
            value={form.balance}
            onChange={e => set('balance', e.target.value)}
            placeholder="0"
            style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--surface2)', border: '1.5px solid var(--border)',
              borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none',
            }}
          />
        </div>

        {/* Color */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
            カラー
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ACCOUNT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => set('color', c)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: c,
                  border: form.color === c ? `3px solid var(--text)` : '3px solid transparent',
                  outline: form.color === c ? `2px solid ${c}` : 'none',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isNew && (
            <button
              onClick={() => onDelete(account.id)}
              style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'var(--red-light)', color: 'var(--red)',
                fontWeight: 600, fontSize: 14,
              }}
            >削除</button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '12px 16px', borderRadius: 8,
              background: 'var(--surface2)', color: 'var(--text2)',
              fontWeight: 600, fontSize: 14,
            }}
          >キャンセル</button>
          <button
            onClick={() => form.name && onSave({ ...form, balance: Number(form.balance) || 0 })}
            style={{
              flex: 1, padding: '12px', borderRadius: 8,
              background: form.color, color: '#fff',
              fontWeight: 700, fontSize: 14,
              transition: 'opacity 0.15s',
            }}
          >{isNew ? '追加' : '更新'}</button>
        </div>
      </div>
    </div>
  )
}

export default function AccountsSection({ data, onUpdate }) {
  const [editing, setEditing] = useState(null) // account object or { new }

  const totalBalance = (data.accounts || []).reduce((s, a) => s + (a.balance || 0), 0)

  const handleSave = (form) => {
    const accounts = data.accounts || []
    if (!form.id) {
      onUpdate([...accounts, { ...form, id: genId() }])
    } else {
      onUpdate(accounts.map(a => a.id === form.id ? form : a))
    }
    setEditing(null)
  }

  const handleDelete = (id) => {
    onUpdate((data.accounts || []).filter(a => a.id !== id))
    setEditing(null)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Total balance */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: '1.5px solid #93c5fd',
        borderRadius: 16, padding: '16px 20px', marginBottom: 14,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', marginBottom: 4 }}>
            🏦 銀行残高 合計
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {(data.accounts || []).length}口座
          </div>
        </div>
        <div style={{
          fontSize: 28, fontWeight: 900,
          color: totalBalance >= 0 ? 'var(--blue)' : 'var(--red)',
          fontFamily: 'DM Serif Display, serif',
          letterSpacing: '-1px',
        }}>
          {totalBalance < 0 ? '−' : ''}{fmt(totalBalance)}
        </div>
      </div>

      {/* Account cards */}
      {(data.accounts || []).map(account => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={setEditing}
        />
      ))}

      {/* Add button */}
      <button
        onClick={() => setEditing({ name: '', balance: 0, color: ACCOUNT_COLORS[0] })}
        style={{
          width: '100%', padding: '10px',
          border: '1.5px dashed var(--border)',
          borderRadius: 12, background: 'transparent',
          color: 'var(--text3)', fontSize: 13,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = 'var(--blue)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
      >
        + 口座を追加
      </button>

      {/* Edit modal */}
      {editing && (
        <EditModal
          account={editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
