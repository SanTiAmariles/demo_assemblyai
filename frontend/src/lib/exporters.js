import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf'
import { baseName, entityLabel, formatDuration, formatTimestamp, groupEntities } from './format'

function sections(result) {
  return {
    title: `Transcripción: ${result.filename ?? 'audio'}`,
    meta: `Duración: ${formatDuration(result.audio_duration)} · Generado el ${new Date().toLocaleString('es')}`,
    utterances: result.utterances ?? [],
    entities: groupEntities(result.entities),
    text: result.text ?? '',
  }
}

export async function buildDocx(result) {
  const s = sections(result)
  const children = [
    new Paragraph({ text: s.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: s.meta, italics: true, color: '666666' })] }),
    new Paragraph({ text: 'Texto completo', heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: s.text }),
  ]

  if (s.utterances.length) {
    children.push(new Paragraph({ text: 'Por hablante', heading: HeadingLevel.HEADING_1 }))
    for (const u of s.utterances) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: `[${formatTimestamp(u.start)}] Hablante ${u.speaker}: `, bold: true }),
            new TextRun(u.text),
          ],
        }),
      )
    }
  }

  if (s.entities.length) {
    children.push(new Paragraph({ text: 'Entidades', heading: HeadingLevel.HEADING_1 }))
    for (const g of s.entities) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: `${entityLabel(g.type)}: `, bold: true }), new TextRun(g.items.join(', '))],
        }),
      )
    }
  }

  const doc = new Document({ creator: 'Transcriptor AssemblyAI', title: s.title, sections: [{ children }] })
  return Packer.toBlob(doc)
}

export function buildPdf(result) {
  const s = sections(result)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 56
  const width = doc.internal.pageSize.getWidth() - margin * 2
  const bottom = doc.internal.pageSize.getHeight() - margin
  let y = margin

  const write = (text, { size = 11, style = 'normal', color = [30, 30, 40], gap = 6 } = {}) => {
    doc.setFont('helvetica', style).setFontSize(size).setTextColor(...color)
    const lineHeight = size * 1.4
    for (const line of doc.splitTextToSize(text, width)) {
      if (y + lineHeight > bottom) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y + size)
      y += lineHeight
    }
    y += gap
  }
  const heading = (text) => {
    y += 8
    write(text, { size: 15, style: 'bold', color: [79, 70, 229], gap: 4 })
  }

  write(s.title, { size: 20, style: 'bold' })
  write(s.meta, { size: 9, style: 'italic', color: [110, 110, 120], gap: 12 })

  heading('Texto completo')
  write(s.text)

  if (s.utterances.length) {
    heading('Por hablante')
    for (const u of s.utterances) {
      write(`[${formatTimestamp(u.start)}] Hablante ${u.speaker}: ${u.text}`)
    }
  }

  if (s.entities.length) {
    heading('Entidades')
    for (const g of s.entities) write(`• ${entityLabel(g.type)}: ${g.items.join(', ')}`, { gap: 2 })
  }

  return doc
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function exportWord(result) {
  download(await buildDocx(result), `${baseName(result.filename)}.docx`)
}

export function exportPdf(result) {
  buildPdf(result).save(`${baseName(result.filename)}.pdf`)
}
