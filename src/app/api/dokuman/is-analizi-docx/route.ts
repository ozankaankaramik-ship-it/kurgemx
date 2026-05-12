import { NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  Header,
  Footer,
  LevelFormat,
} from 'docx'

export const maxDuration = 60

// Standartlar/genel.md → Word Dokümanı Görsel Standartları
const COLOR = {
  dark: '1F3864',        // H1 arka, tablo başlık arka, H2 yazı
  white: 'FFFFFF',
  accent: '2E75B6',      // vurgu
  lightBlue: 'D6E4F0',   // tablo alt başlık arka
  brBg: 'F1EFE8',        // BR paragrafı gri arka
  brBorder: 'D6D3CC',
  text: '111827',
  muted: '6B7280',
  border: 'D1D5DB',
} as const

// Yazı boyutları (DXA: 1pt = 2 yarım-nokta)
const FONT = 'Arial'
const SIZE = {
  body: 20,    // 10pt
  h1: 28,      // 14pt
  h2: 24,      // 12pt
  h3: 22,      // 11pt
  table: 18,   // 9pt
  caption: 16, // 8pt
} as const

// Sayfa A4 + 1080 DXA kenar boşluğu
const PAGE = {
  width: 11906,
  height: 16838,
  margin: 1080,
} as const

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function textRun(text: string, opts: { bold?: boolean; italic?: boolean; color?: string; size?: number } = {}): TextRun {
  return new TextRun({
    text,
    font: FONT,
    size: opts.size ?? SIZE.body,
    bold: opts.bold,
    italics: opts.italic,
    color: opts.color ?? COLOR.text,
  })
}

// Inline markdown'ı (bold, italic, code) TextRun dizisine çevir — basit parser
function parseInlineMarkdown(
  text: string,
  baseOpts: { color?: string; size?: number; bold?: boolean; italic?: boolean } = {},
): TextRun[] {
  const out: TextRun[] = []
  // **bold**, *italic*, `code` desteklenir; iç içe yok
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(textRun(text.slice(last, m.index), baseOpts))
    }
    if (m[2] !== undefined) {
      out.push(textRun(m[2], { ...baseOpts, bold: true }))
    } else if (m[3] !== undefined) {
      out.push(textRun(m[3], { ...baseOpts, italic: true }))
    } else if (m[4] !== undefined) {
      // Inline code: italik yerine sadece text — Word'de fontFace mono gerektirir, basit tutuyoruz
      out.push(textRun(m[4], { ...baseOpts, italic: true }))
    }
    last = re.lastIndex
  }
  if (last < text.length) {
    out.push(textRun(text.slice(last), baseOpts))
  }
  return out.length ? out : [textRun(text, baseOpts)]
}

// H1: koyu lacivert arka, beyaz yazı
function makeH1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLOR.dark },
    children: [textRun(text, { bold: true, color: COLOR.white, size: SIZE.h1 })],
  })
}

function makeH2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [textRun(text, { bold: true, color: COLOR.dark, size: SIZE.h2 })],
  })
}

function makeH3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [textRun(text, { bold: true, color: COLOR.accent, size: SIZE.h3 })],
  })
}

// AC paragrafı: "AC-XXX [P/N/B/S] : metin" — etiket vurgu rengi, tip etiketi bold
function makeAC(line: string): Paragraph {
  const m = line.match(/^(AC-\d+)\s*\[([PNBS])\]\s*:\s*(.*)$/)
  if (!m) return makeBody(line)
  const [, kod, tip, metin] = m
  return new Paragraph({
    spacing: { before: 80, after: 60 },
    indent: { left: 360 },
    children: [
      textRun(`${kod} `, { bold: true, color: COLOR.accent }),
      textRun(`[${tip}] `, { bold: true, color: COLOR.dark }),
      textRun(': '),
      ...parseInlineMarkdown(metin),
    ],
  })
}

// BR paragrafı: "BR-XXX : metin" — gri arka, soldan girintili
function makeBR(line: string): Paragraph {
  const m = line.match(/^(BR-\d+)\s*:\s*(.*)$/)
  if (!m) return makeBody(line)
  const [, kod, metin] = m
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    indent: { left: 720 },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLOR.brBg },
    border: {
      left: { style: BorderStyle.SINGLE, size: 8, color: COLOR.brBorder, space: 4 },
    },
    children: [
      textRun(`${kod} `, { bold: true, color: COLOR.muted }),
      textRun(': '),
      ...parseInlineMarkdown(metin, { color: COLOR.text }),
    ],
  })
}

function makeBody(line: string): Paragraph {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: parseInlineMarkdown(line),
  })
}

function makeBlockquote(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: COLOR.accent, space: 8 },
    },
    children: parseInlineMarkdown(text, { italic: true, color: COLOR.muted }),
  })
}

function makeBullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    bullet: { level },
    children: parseInlineMarkdown(text),
  })
}

function makeNumbered(text: string, level = 0): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    numbering: { reference: 'default-numbering', level },
    children: parseInlineMarkdown(text),
  })
}

function makeUserStoryLine(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [
      textRun(`${label.padEnd(8, ' ')}`, { bold: true, color: COLOR.dark }),
      textRun(' '),
      ...parseInlineMarkdown(value),
    ],
  })
}

// Markdown tablosunu Word tablosuna çevir
function makeTable(headers: string[], rows: string[][]): Table {
  const headerCells = headers.map((h) =>
    new TableCell({
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLOR.dark },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          children: [textRun(h, { bold: true, color: COLOR.white, size: SIZE.table })],
        }),
      ],
    }),
  )

  const bodyRows = rows.map((cells, ri) =>
    new TableRow({
      children: cells.map(
        (c) =>
          new TableCell({
            shading: {
              type: ShadingType.CLEAR,
              color: 'auto',
              fill: ri % 2 === 1 ? 'FAFAFA' : COLOR.white,
            },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: parseInlineMarkdown(c, { size: SIZE.table }),
              }),
            ],
          }),
      ),
    }),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ tableHeader: true, children: headerCells }), ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR.border },
    },
  })
}

function splitTableRow(line: string): string[] {
  // | a | b | c | → ['a', 'b', 'c']
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function isTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line.trim())
}

// ──────────────────────────────────────────────────────────────
// Markdown → docx blokları
// ──────────────────────────────────────────────────────────────

type Block = Paragraph | Table

function parseMarkdown(icerik: string, projeAdi: string): Block[] {
  const lines = icerik.split(/\r?\n/)
  const blocks: Block[] = []

  let i = 0
  let h1Eklendi = false

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()

    if (!line) {
      i++
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim()
      blocks.push(makeH1(text))
      h1Eklendi = true
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push(makeH2(line.slice(3).trim()))
      i++
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push(makeH3(line.slice(4).trim()))
      i++
      continue
    }
    if (line.startsWith('#### ')) {
      // H4 — H3 stiline benzer ama daha küçük
      blocks.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [textRun(line.slice(5).trim(), { bold: true, color: COLOR.dark, size: SIZE.h3 })],
        }),
      )
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const buf: string[] = [line.slice(2).trim()]
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
        i++
        buf.push(lines[i].trim().slice(2).trim())
      }
      blocks.push(makeBlockquote(buf.join(' ')))
      i++
      continue
    }

    // Tablo: bu satır pipe içeriyor ve bir sonraki satır separator
    if (line.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = splitTableRow(line)
      i += 2 // başlık + ayraç
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitTableRow(lines[i].trim()))
        i++
      }
      blocks.push(makeTable(headers, rows))
      continue
    }

    // AC satırı
    if (/^AC-\d+\s*\[[PNBS]\]/.test(line)) {
      blocks.push(makeAC(line))
      i++
      continue
    }

    // BR satırı
    if (/^BR-\d+\s*:/.test(line)) {
      blocks.push(makeBR(line))
      i++
      continue
    }

    // Kullanıcı hikayesi satırları: "AKTÖR:", "İHTİYAÇ:", "FAYDA:" veya "ACTOR:", "NEED:", "BENEFIT:"
    const userStoryM = line.match(/^(AKTÖR|İHTİYAÇ|FAYDA|ACTOR|NEED|BENEFIT)\s*:\s*(.*)$/i)
    if (userStoryM) {
      blocks.push(makeUserStoryLine(`${userStoryM[1].toUpperCase()}:`, userStoryM[2]))
      i++
      continue
    }

    // Bullet listesi
    if (/^[-*+]\s+/.test(line)) {
      blocks.push(makeBullet(line.replace(/^[-*+]\s+/, '')))
      i++
      continue
    }

    // Numaralı listesi
    if (/^\d+\.\s+/.test(line)) {
      blocks.push(makeNumbered(line.replace(/^\d+\.\s+/, '')))
      i++
      continue
    }

    // Horizontal rule — atla
    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      i++
      continue
    }

    // Normal paragraf — başlık eklenmediyse ilk text'i H1 yap (fallback)
    if (!h1Eklendi) {
      blocks.push(makeH1(`${projeAdi} — İş Analizi Dokümanı`))
      h1Eklendi = true
    }
    blocks.push(makeBody(line))
    i++
  }

  return blocks
}

// ──────────────────────────────────────────────────────────────
// Document builder
// ──────────────────────────────────────────────────────────────

function buildHeader(projeAdi: string, dokumanAdi: string): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 },
        children: [
          textRun('KurgemX  |  ', { color: COLOR.muted, size: SIZE.caption }),
          textRun(`${projeAdi}  |  `, { bold: true, color: COLOR.dark, size: SIZE.caption }),
          textRun(dokumanAdi, { color: COLOR.muted, size: SIZE.caption }),
        ],
      }),
    ],
  })
}

function buildFooter(versiyon: string, tarih: string): Footer {
  return new Footer({
    children: [
      new Paragraph({
        tabStops: [{ position: 9000, type: 'right' }],
        spacing: { before: 0 },
        children: [
          textRun(`Gizli — Dahili Kullanım  |  Sürüm ${versiyon}  |  ${tarih}`, {
            italic: true,
            color: COLOR.muted,
            size: SIZE.caption,
          }),
          new TextRun({
            text: '\t',
            font: FONT,
            size: SIZE.caption,
          }),
          textRun('Sayfa ', { color: COLOR.muted, size: SIZE.caption }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT,
            size: SIZE.caption,
            color: COLOR.muted,
          }),
        ],
      }),
    ],
  })
}

// ──────────────────────────────────────────────────────────────
// POST handler
// ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let body: { icerik?: string; projeAdi?: string; versiyon?: string; tarih?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const icerik = (body.icerik ?? '').trim()
  const projeAdi = (body.projeAdi ?? '').trim()
  const versiyon = (body.versiyon ?? '1.0').trim()
  const tarih = (body.tarih ?? new Date().toISOString().split('T')[0]).trim()

  if (!icerik || !projeAdi) {
    return NextResponse.json({ error: 'empty_input', detail: 'icerik, projeAdi required' }, { status: 400 })
  }

  const dokumanAdi = 'İş Analizi Dokümanı'
  const blocks = parseMarkdown(icerik, projeAdi)

  const doc = new Document({
    creator: 'KurgemX',
    title: `${projeAdi} — ${dokumanAdi}`,
    description: `KurgemX tarafından üretilen ${dokumanAdi}`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE.body, color: COLOR.text },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
            {
              level: 1,
              format: LevelFormat.LOWER_LETTER,
              text: '%2.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: {
              top: PAGE.margin,
              bottom: PAGE.margin,
              left: PAGE.margin,
              right: PAGE.margin,
            },
          },
        },
        headers: { default: buildHeader(projeAdi, dokumanAdi) },
        footers: { default: buildFooter(versiyon, tarih) },
        children: blocks,
      },
    ],
  })

  try {
    const buf = await Packer.toBuffer(doc)
    const safe = projeAdi
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9ğşıöüçîâû-]/gi, '')
      .slice(0, 50) || 'proje'
    const filename = `is-analizi-${safe}.docx`

    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[is-analizi-docx] hata:', err)
    return NextResponse.json(
      { error: 'docx_build_failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
