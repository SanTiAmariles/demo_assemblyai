export const ENTITY_LABELS = {
  person_name: 'Persona',
  location: 'Lugar',
  organization: 'Organización',
  date: 'Fecha',
  time: 'Hora',
  date_time: 'Fecha y hora',
  money_amount: 'Dinero',
  phone_number: 'Teléfono',
  email_address: 'Correo',
  occupation: 'Ocupación',
  nationality: 'Nacionalidad',
  event: 'Evento',
  language: 'Idioma',
  number: 'Número',
}

export function entityLabel(type) {
  return ENTITY_LABELS[type] ?? type.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase())
}

export function formatTimestamp(ms) {
  const total = Math.floor((ms ?? 0) / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(seconds) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m ? `${m} min ${s} s` : `${s} s`
}

/** Agrupa entidades por tipo, sin duplicados (insensible a mayúsculas). */
export function groupEntities(entities = []) {
  const groups = new Map()
  for (const { type, text } of entities) {
    if (!groups.has(type)) groups.set(type, new Map())
    const key = text.toLowerCase()
    if (!groups.get(type).has(key)) groups.get(type).set(key, text)
  }
  return [...groups].map(([type, items]) => ({ type, items: [...items.values()] }))
}

export function speakerList(utterances = []) {
  return [...new Set(utterances.map((u) => u.speaker))]
}

export function baseName(filename = 'transcripcion') {
  return filename.replace(/\.[^.]+$/, '') || 'transcripcion'
}
