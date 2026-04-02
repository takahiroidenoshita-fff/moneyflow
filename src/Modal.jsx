import { useState, useEffect } from 'react'
import { SPOT_CATEGORIES } from './utils'

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    background: 'var(--surface)', borderRadius: '20px 20px 0 0',
    width: '100%', maxWidth: 540, padding: '24px 20px 36px',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    background: 'var(--border)', margin: '0 auto 20px',
  },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--text)' },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, display: 'block' },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', fontSize: 14, color: 'var(--text)',
    outline: 'none', transition: 'border-color 0.15s',
  },
  row: { marginBottom: 14 },
  btnRow: { display: 'flex', gap: 8, marginTop: 24 },
  btnPrimary: {
    flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
    background: 'var(--text)', color: '#fff', fontWeight: 700,
    fontSize: 14, transition: 'opacity 0.15s',
  },
  btnDanger: {
    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--red-light)', color: 'var(--red)', fontWeight: 600, fontSize: 14,
  },
  btnCancel: {
    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--surface2)', color: 'var(--text2)', fontWeight: 600, fontSize: 14,
  },
}

const TYPE_CONFIG = {
  income: {
    title: (edit) => edit ? '収入を編集' : '収入を追加',
    fields: ['name', 'amount', 'day', 'type'],
  },
  fixed: {
    title: (edit) => edit ? '固定費を編集' : '固定費を追加',
    fields: ['name', 'amount', 'day'],
  },
  spot: {
    title: (edit) => edit ? 'スポット支出を編集' : 'スポット支出を追加',
    fields: ['name', 'amount', 'date', 'category'],
  },
  spotIncome: {
    title: (edit) => edit ? '臨時収入を編集' : '臨時収入を追加',
    fields: ['name', 'amount', 'date'],
  },
  wishlist: {
    title: (edit) => edit ? '欲しいものを編集' : '欲しいものを追加',
    fields: ['name', 'amount', 'priority'],
  },
}

export default function Modal({ modal, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({})
  const isEdit = !!modal.item

  useEffect(() => {
    if (modal.item) {
      setForm({ ...modal.item })
    } else {
      const now = new Date()
      const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
      const defaults = {
        income:      { name: '', amount: '', day: 15, type: 'confirmed' },
        fixed:       { name: '', amount: '', day: 1 },
        spot:        { name: '', amount: '', date: `${monthStr}-01`, category: 'tax' },
        spotIncome:  { name: '', amount: '', date: `${monthStr}-01` },
        wishlist:    { name: '', amount: '', priority: 'medium', done: false },
      }
      setForm({ ...defaults[modal.type], ...modal.defaults })
    }
  }, [modal])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const cfg = TYPE_CONFIG[modal.type]
  const fields = cfg.fields

  const handleSave = () => {
    if (!form.name || !form.amount) return
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.sheet} onClick={e => e.stopPropagation()}>
        <div style={s.handle} />
        <div style={s.title}>{cfg.title(isEdit)}</div>

        {/* Name */}
        <div style={s.row}>
          <label style={s.label}>名前</label>
          <input
            style={s.input}
            value={form.name || ''}
            onChange={e => set('name', e.target.value)}
            placeholder="例: 家賃"
            autoFocus
          />
        </div>

        {/* Amount */}
        <div style={s.row}>
          <label style={s.label}>金額（円）</label>
          <input
            style={s.input}
            type="number"
            value={form.amount || ''}
            onChange={e => set('amount', e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Day (income/fixed) */}
        {fields.includes('day') && (
          <div style={s.row}>
            <label style={s.label}>毎月何日</label>
            <input
              style={s.input}
              type="number"
              min="1" max="31"
              value={form.day || 1}
              onChange={e => set('day', parseInt(e.target.value))}
            />
          </div>
        )}

        {/* Date (spot) */}
        {fields.includes('date') && (
          <div style={s.row}>
            <label style={s.label}>日付</label>
            <input
              style={{ ...s.input, colorScheme: 'light' }}
              type="date"
              value={form.date || ''}
              onChange={e => set('date', e.target.value)}
            />
          </div>
        )}

        {/* Type (income: confirmed/estimated) */}
        {fields.includes('type') && (
          <div style={s.row}>
            <label style={s.label}>種別</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['confirmed','確定'], ['estimated','見込み']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => set('type', val)}
                  style={{
                    flex: 1, padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${form.type === val ? 'var(--green)' : 'var(--border)'}`,
                    background: form.type === val ? 'var(--green-light)' : 'var(--surface2)',
                    color: form.type === val ? 'var(--green)' : 'var(--text2)',
                    fontWeight: form.type === val ? 700 : 400,
                    fontSize: 13,
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Category (spot) */}
        {fields.includes('category') && (
          <div style={s.row}>
            <label style={s.label}>カテゴリ</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(SPOT_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => set('category', key)}
                  style={{
                    padding: '7px 14px', borderRadius: 20,
                    border: `1.5px solid ${form.category === key ? cat.color : 'var(--border)'}`,
                    background: form.category === key ? cat.color + '18' : 'var(--surface2)',
                    color: form.category === key ? cat.color : 'var(--text2)',
                    fontWeight: form.category === key ? 700 : 400,
                    fontSize: 12,
                  }}
                >{cat.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Priority (wishlist) */}
        {fields.includes('priority') && (
          <div style={s.row}>
            <label style={s.label}>優先度</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['high','優先高','#dc2626'], ['medium','普通','#d97706'], ['low','いつか','#16a34a']].map(([val, label, color]) => (
                <button
                  key={val}
                  onClick={() => set('priority', val)}
                  style={{
                    flex: 1, padding: '9px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${form.priority === val ? color : 'var(--border)'}`,
                    background: form.priority === val ? color + '18' : 'var(--surface2)',
                    color: form.priority === val ? color : 'var(--text2)',
                    fontWeight: form.priority === val ? 700 : 400,
                    fontSize: 13,
                  }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={s.btnRow}>
          {isEdit && (
            <button style={s.btnDanger} onClick={() => onDelete(modal.type, modal.item.id)}>
              削除
            </button>
          )}
          <button style={s.btnCancel} onClick={onClose}>キャンセル</button>
          <button style={s.btnPrimary} onClick={handleSave}>
            {isEdit ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  )
}
