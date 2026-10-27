import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { buildDocx, buildPdf } from '../lib/exporters'
import { sampleResult } from './fixtures'

describe('exportar', () => {
  it('genera un .docx con todas las secciones', async () => {
    const blob = await buildDocx(sampleResult)
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const xml = await zip.file('word/document.xml').async('string')
    for (const text of ['Transcripción: reunion.mp3', 'Texto completo', 'Por hablante', 'Entidades', 'Hablante B', 'Bogotá']) {
      expect(xml).toContain(text)
    }
    expect(xml).toContain('[01:02]')
  })

  it('genera un PDF válido con el contenido', () => {
    const doc = buildPdf(sampleResult)
    const raw = doc.output()
    expect(raw.startsWith('%PDF-')).toBe(true)
    expect(raw).toContain('Por hablante')
    expect(raw).toContain('Hablante A')
  })

  it('pagina textos largos en el PDF', () => {
    const long = { ...sampleResult, text: 'palabra '.repeat(6000) }
    expect(buildPdf(long).getNumberOfPages()).toBeGreaterThan(1)
  })

  it('omite secciones vacías', async () => {
    const empty = { ...sampleResult, utterances: [], entities: [] }
    const zip = await JSZip.loadAsync(await (await buildDocx(empty)).arrayBuffer())
    const xml = await zip.file('word/document.xml').async('string')
    expect(xml).not.toContain('Por hablante')
    expect(xml).not.toContain('>Entidades<')
  })
})
