'use client'

import type { ReactNode, CSSProperties } from 'react'

interface Props { icerik: string }

const COLOR = { darkBlue: '#1F3864', midBlue: '#2E75B6', text: '#374151', muted: '#6B7280' }

function parseInline(raw: string): string {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="font-family:monospace;font-size:.85em;background:#f3f4f6;padding:1px 5px;border-radius:3px;color:#1F3864">$1</code>')
}

function P({ html, style }: { html: string; style?: CSSProperties }) {
  return (
    <p style={{ fontSize: 12, color: COLOR.text, lineHeight: 1.65, margin: '3px 0 8px', ...style }}
      dangerouslySetInnerHTML={{ __html: parseInline(html) }} />
  )
}

export default function MarkdownGoster({ icerik }: Props) {
  const lines = icerik.split('\n')
  const nodes: ReactNode[] = []
  let i = 0
  let k = 0
  const key = () => k++

  while (i < lines.length) {
    const line = lines[i]

    // ─── Code block ───────────────────────────────────────
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) codeLines.push(lines[i++])
      nodes.push(
        <pre key={key()} style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 14px', fontSize: 11, overflowX: 'auto', margin: '8px 0', lineHeight: 1.5 }}>
          <code style={{ fontFamily: 'monospace' }}>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // ─── Horizontal rule ──────────────────────────────────
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key()} style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '14px 0' }} />)
      i++
      continue
    }

    // ─── Headings ─────────────────────────────────────────
    const h1m = line.match(/^#\s+(.+)/)
    const h2m = line.match(/^##\s+(.+)/)
    const h3m = line.match(/^###\s+(.+)/)
    const h4m = line.match(/^####\s+(.+)/)

    if (h1m) {
      nodes.push(
        <h1 key={key()} style={{ fontSize: 17, fontWeight: 700, color: COLOR.darkBlue, margin: '22px 0 10px', paddingBottom: 6, borderBottom: `2px solid ${COLOR.darkBlue}` }}
          dangerouslySetInnerHTML={{ __html: parseInline(h1m[1]) }} />
      )
      i++; continue
    }
    if (h2m) {
      nodes.push(
        <h2 key={key()} style={{ fontSize: 14, fontWeight: 700, color: COLOR.darkBlue, margin: '18px 0 7px' }}
          dangerouslySetInnerHTML={{ __html: parseInline(h2m[1]) }} />
      )
      i++; continue
    }
    if (h3m) {
      nodes.push(
        <h3 key={key()} style={{ fontSize: 13, fontWeight: 600, color: COLOR.midBlue, margin: '14px 0 5px' }}
          dangerouslySetInnerHTML={{ __html: parseInline(h3m[1]) }} />
      )
      i++; continue
    }
    if (h4m) {
      nodes.push(
        <h4 key={key()} style={{ fontSize: 12, fontWeight: 600, color: COLOR.text, margin: '11px 0 4px' }}
          dangerouslySetInnerHTML={{ __html: parseInline(h4m[1]) }} />
      )
      i++; continue
    }

    // ─── Blockquote ───────────────────────────────────────
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <blockquote key={key()} style={{ borderLeft: '3px solid #F59E0B', background: '#FFFBEB', padding: '8px 12px', margin: '8px 0', borderRadius: '0 4px 4px 0' }}>
          {quoteLines.map((ql, qi) => (
            <p key={qi} style={{ fontSize: 12, color: '#92400E', margin: qi === 0 ? 0 : '4px 0 0' }}
              dangerouslySetInnerHTML={{ __html: parseInline(ql) }} />
          ))}
        </blockquote>
      )
      continue
    }

    // ─── Table ────────────────────────────────────────────
    if (line.startsWith('|') && line.includes('|', 1)) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const dataRows = tableLines.filter(l => !/^\|[\s:|-]+\|$/.test(l))
      if (dataRows.length > 0) {
        const parseCells = (l: string) => l.split('|').filter((_, j, a) => j > 0 && j < a.length - 1).map(c => c.trim())
        const header = parseCells(dataRows[0])
        const body = dataRows.slice(1)
        nodes.push(
          <div key={key()} style={{ overflowX: 'auto', margin: '8px 0' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', minWidth: 'max-content' }}>
              <thead>
                <tr>
                  {header.map((cell, ci) => (
                    <th key={ci}
                      style={{ background: COLOR.darkBlue, color: 'white', padding: '6px 12px', textAlign: 'left', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,.2)', whiteSpace: 'nowrap' }}
                      dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => {
                  const cells = parseCells(row)
                  return (
                    <tr key={ri} style={{ background: ri % 2 === 1 ? '#f9fafb' : 'white' }}>
                      {cells.map((cell, ci) => (
                        <td key={ci}
                          style={{ padding: '5px 12px', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top', fontSize: 12 }}
                          dangerouslySetInnerHTML={{ __html: parseInline(cell) }} />
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // ─── Unordered list ───────────────────────────────────
    if (/^\s*[-*+]\s/.test(line)) {
      const items: { text: string; indent: number }[] = []
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)([-*+])\s(.+)/)
        if (m) items.push({ text: m[3], indent: m[1].length })
        i++
      }
      nodes.push(
        <ul key={key()} style={{ margin: '4px 0 8px', paddingLeft: 20, listStyle: 'disc' }}>
          {items.map((item, li) => (
            <li key={li} style={{ fontSize: 12, color: COLOR.text, marginBottom: 3, marginLeft: item.indent > 0 ? item.indent * 6 : 0 }}
              dangerouslySetInnerHTML={{ __html: parseInline(item.text) }} />
          ))}
        </ul>
      )
      continue
    }

    // ─── Ordered list ─────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const m = lines[i].match(/^\d+\.\s(.+)/)
        if (m) items.push(m[1])
        i++
      }
      nodes.push(
        <ol key={key()} style={{ margin: '4px 0 8px', paddingLeft: 20, listStyle: 'decimal' }}>
          {items.map((item, li) => (
            <li key={li} style={{ fontSize: 12, color: COLOR.text, marginBottom: 3 }}
              dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
          ))}
        </ol>
      )
      continue
    }

    // ─── Empty line ───────────────────────────────────────
    if (line.trim() === '') { i++; continue }

    // ─── Paragraph ────────────────────────────────────────
    nodes.push(<P key={key()} html={line} />)
    i++
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '100%', color: COLOR.text }}>
      {nodes}
    </div>
  )
}
