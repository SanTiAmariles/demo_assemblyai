import { describe, expect, it } from 'vitest'
import { baseName, entityLabel, formatDuration, formatTimestamp, groupEntities, speakerList } from '../lib/format'
import { sampleResult } from './fixtures'

describe('format', () => {
  it('formatea marcas de tiempo en mm:ss', () => {
    expect(formatTimestamp(0)).toBe('00:00')
    expect(formatTimestamp(62000)).toBe('01:02')
    expect(formatTimestamp(undefined)).toBe('00:00')
  })

  it('formatea la duración', () => {
    expect(formatDuration(95)).toBe('1 min 35 s')
    expect(formatDuration(12)).toBe('12 s')
    expect(formatDuration(null)).toBe('—')
  })

  it('traduce tipos de entidad y hace fallback legible', () => {
    expect(entityLabel('person_name')).toBe('Persona')
    expect(entityLabel('blood_type')).toBe('Blood type')
  })

  it('agrupa entidades sin duplicados', () => {
    expect(groupEntities(sampleResult.entities)).toEqual([
      { type: 'person_name', items: ['Ana', 'Luis'] },
      { type: 'location', items: ['Bogotá'] },
    ])
  })

  it('lista hablantes únicos en orden', () => {
    expect(speakerList(sampleResult.utterances)).toEqual(['A', 'B'])
  })

  it('quita la extensión del nombre de archivo', () => {
    expect(baseName('reunion.final.mp3')).toBe('reunion.final')
    expect(baseName(undefined)).toBe('transcripcion')
  })
})
