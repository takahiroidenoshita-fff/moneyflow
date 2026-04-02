import { useState } from 'react'
import {
  fmt, fmtShort, WEEKDAYS,
  getDaysInMonth, getFirstDow,
  getBalanceAtDay, getFreeAmount, buildDayEvents,
  SPOT_CATEGORIES,
} from './utils'

export default function CalendarView({ data, ym, onOpenModal }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const { y, m } = ym
  const daysInMonth = getDaysInMonth(y, m)
  const firstDow = getFirstDow(y, m)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m
  const todayDate = today.getDate()

  const dayEvents = buildDayEvents(y, m, data)

  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const dangerDays = allDays.filter(d => getFreeAmount(d, y, m, data) < 0)

  const currentDayFree = isCurrentMonth
    ? getFreeAmount(todayDate, y, m, data)
    : null

  const selEvents = selectedDay ? (dayEvents[selectedDay] || []) : []
  const selFree = selectedDay ? getFreeAmount(selectedDay, y, m, data) : 0
  const selBalance = selectedDay ? getBalanceAtDay(selectedDay, y, m, data) : 0

  return (
    <div className="fade-up">
      {/* Today's free indicator */}
      {currentDayFree !== null && (
        <div style={{
          background: currentDayFree >= 0
            ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
            : 'linear-gradient(135deg, #fff1f2, #fee2e2)',
          border: `1.5px solid ${currentDayFree >= 0 ? '#86efac' : '#fca5a5'}`,
          borderRadius: 16, padding: '16px 20px', marginBottom: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              color: currentDayFree >= 0 ? 'var(--green)' : 'var(--red)',
              marginBottom: 4,
            }}>TODAY {today.getMonth()+1}/{todayDate}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              今日時点で使える金額
            </div>
            {data.taxBuffer > 0 && (
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                税バッファ {data.taxBuffer}% 控除済み
              </div>
            )}
          </div>
          <div style={{
            fontSize: 30, fontWeight: 900,
            color: currentDayFree >= 0 ? 'var(--green)' : 'var(--red)',
            letterSpacing: '-1px', fontFamily: 'DM Serif Display, serif',
          }}>
            {currentDayFree < 0 ? '−' : ''}{fmtShort(currentDayFree)}
          </div>
        </div>
      )}

      {/* Danger warning */}
      {dangerDays.length > 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, padding: '10px 14px', marginBottom: 12,
          fontSize: 12, color: '#92400e',
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <span>⚠️</span>
          <span>
            <strong>{dangerDays.join('日・')}日</strong> に残高がマイナスになる可能性があります
          </span>
        </div>
      )}

      {/* Day headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 3, marginBottom: 3,
      }}>
        {WEEKDAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'var(--text3)',
            padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}

        {allDays.map(day => {
          const events = dayEvents[day] || []
          const dow = (firstDow + day - 1) % 7
          const isToday = isCurrentMonth && day === todayDate
          const isSelected = selectedDay === day
          const free = getFreeAmount(day, y, m, data)
          const isDanger = free < 0
          const hasIncome = events.some(e => e.kind === 'income')
          const isPast = isCurrentMonth && day < todayDate

          const dayInOut = events.reduce((acc, e) => {
            if (e.kind === 'income' || e.kind === 'spotIncome') acc.income += e.amount
            else acc.out += e.amount
            return acc
          }, { income: 0, out: 0 })

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              style={{
                minHeight: 74,
                background: isSelected ? '#eff6ff'
                  : isToday ? '#f0fdf4'
                  : isDanger ? '#fff1f2'
                  : hasIncome ? '#f0fdf4'
                  : 'var(--surface)',
                border: `${isSelected || isToday ? '1.5' : '1'}px solid ${
                  isSelected ? '#93c5fd'
                  : isToday ? '#86efac'
                  : isDanger ? '#fca5a5'
                  : 'var(--border)'}`,
                borderRadius: 10,
                padding: '6px 5px 5px',
                cursor: 'pointer',
                opacity: isPast ? 0.65 : 1,
                transition: 'all 0.1s',
                boxShadow: isToday || isSelected ? 'var(--shadow-sm)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = isToday || isSelected ? 'var(--shadow-sm)' : 'none' }}
            >
              {/* Day number */}
              <div style={{
                fontSize: 12, fontWeight: isToday ? 800 : 500,
                color: dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6'
                  : isToday ? 'var(--green)' : 'var(--text2)',
                marginBottom: 4,
              }}>{day}</div>

              {/* Event dots */}
              {events.slice(0, 3).map((ev, i) => (
                <div key={i} style={{
                  fontSize: 9, borderRadius: 3, padding: '1px 4px',
                  marginBottom: 2,
                  background: ev.kind === 'income' || ev.kind === 'spotIncome' ? '#dcfce7'
                    : ev.kind === 'spot' ? '#ede9fe'
                    : '#fee2e2',
                  color: ev.kind === 'income' || ev.kind === 'spotIncome' ? '#15803d'
                    : ev.kind === 'spot' ? '#6d28d9'
                    : '#b91c1c',
                  fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {ev.kind === 'income' || ev.kind === 'spotIncome' ? '↑' : '↓'}{ev.name.slice(0, 5)}
                </div>
              ))}
              {events.length > 3 && (
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>+{events.length - 3}</div>
              )}

              {/* Mini balance */}
              {(dayInOut.income > 0 || dayInOut.out > 0) && (
                <div style={{ marginTop: 3, borderTop: '1px solid var(--border)', paddingTop: 2 }}>
                  {dayInOut.income > 0 && (
                    <div style={{ fontSize: 8, color: '#16a34a', fontWeight: 700 }}>
                      +{fmtShort(dayInOut.income)}
                    </div>
                  )}
                  {dayInOut.out > 0 && (
                    <div style={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>
                      −{fmtShort(dayInOut.out)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div style={{
          marginTop: 16,
          background: 'var(--surface)', border: '1.5px solid #93c5fd',
          borderRadius: 16, padding: '16px',
          boxShadow: 'var(--shadow)',
          animation: 'fadeUp 0.2s ease',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14,
          }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {m + 1}月{selectedDay}日
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>この日時点で使える金額</div>
              <div style={{
                fontSize: 20, fontWeight: 900,
                color: selFree >= 0 ? 'var(--green)' : 'var(--red)',
                fontFamily: 'DM Serif Display, serif',
              }}>
                {selFree < 0 ? '−' : ''}{fmt(selFree)}
              </div>
            </div>
          </div>

          {selEvents.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>
              この日の収支はありません
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selEvents.map((ev, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 10,
                  background: ev.kind === 'income' || ev.kind === 'spotIncome' ? '#f0fdf4'
                    : ev.kind === 'spot' ? '#f5f3ff'
                    : '#fff1f2',
                  cursor: 'pointer',
                }}
                  onClick={(e) => {
                    e.stopPropagation()
                    const type = ev.kind === 'income' ? 'income'
                      : ev.kind === 'spotIncome' ? 'spotIncome'
                      : ev.kind === 'spot' ? 'spot' : 'fixed'
                    onOpenModal(type, ev)
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>
                      {ev.kind === 'income'
                        ? ev.type === 'confirmed' ? '確定収入' : '見込み収入'
                        : ev.kind === 'spotIncome' ? '臨時収入'
                        : ev.kind === 'spot'
                        ? SPOT_CATEGORIES[ev.category]?.label || 'スポット'
                        : '固定費'}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: 14,
                    color: ev.kind === 'income' || ev.kind === 'spotIncome'
                      ? 'var(--green)'
                      : ev.kind === 'spot' ? '#7c3aed' : 'var(--red)',
                  }}>
                    {ev.kind === 'income' || ev.kind === 'spotIncome' ? '+' : '−'}{fmt(ev.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              const monthStr = `${y}-${String(m+1).padStart(2,'0')}`
              const dateStr = `${monthStr}-${String(selectedDay).padStart(2,'0')}`
              onOpenModal('spot', null, { date: dateStr })
            }}
            style={{
              marginTop: 12, width: '100%',
              padding: '9px', borderRadius: 8,
              border: '1.5px dashed var(--border)',
              color: 'var(--text3)', fontSize: 12,
              background: 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#93c5fd'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            + この日にスポット支出を追加
          </button>
        </div>
      )}

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {[
          { label: '+ 収入', type: 'income', color: 'var(--green)', bg: 'var(--green-light)' },
          { label: '+ 臨時収入', type: 'spotIncome', color: '#059669', bg: '#d1fae5' },
          { label: '+ 固定費', type: 'fixed', color: 'var(--red)', bg: 'var(--red-light)' },
          { label: '+ スポット', type: 'spot', color: 'var(--purple)', bg: 'var(--purple-light)' },
        ].map(b => (
          <button
            key={b.type}
            onClick={() => onOpenModal(b.type, null)}
            style={{
              padding: '8px 16px', borderRadius: 20,
              background: b.bg, color: b.color,
              fontWeight: 700, fontSize: 12,
              border: 'none', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{b.label}</button>
        ))}
      </div>
    </div>
  )
}
