'use client';

import { isNumber } from 'lodash';

export default function FundHoldingsTable({ holdings }) {
  if (!Array.isArray(holdings) || holdings.length === 0) return null;

  return (
    <div
      className="fund-history-table-wrapper"
      style={{
        marginTop: 8,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--card)',
      }}
    >
      <table
        className="fund-history-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          color: 'var(--text)',
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'var(--table-row-alt-bg)',
            }}
          >
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                color: 'var(--muted)',
                textAlign: 'left',
              }}
            >
              股票名称
            </th>
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                color: 'var(--muted)',
                textAlign: 'center',
              }}
            >
              涨跌幅
            </th>
            <th
              style={{
                padding: '8px 12px',
                fontWeight: 600,
                color: 'var(--muted)',
                textAlign: 'right',
              }}
            >
              占比
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid var(--border)',
              }}
            >
              <td
                style={{
                  padding: '8px 12px',
                  color: 'var(--text)',
                  textAlign: 'left',
                }}
              >
                {h.name}
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  textAlign: 'center',
                }}
              >
                {isNumber(h.change) ? (
                  <span className={h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}>
                    {h.change > 0 ? '+' : ''}
                    {h.change.toFixed(2)}%
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  color: 'var(--text)',
                  textAlign: 'right',
                }}
              >
                {h.weight}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
