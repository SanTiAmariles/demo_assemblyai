export async function transcribeAudio(file, { signal } = {}) {
  const body = new FormData()
  body.append('file', file)

  let res
  try {
    res = await fetch('/api/transcribe', { method: 'POST', body, signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo "uvicorn server:app"?')
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.detail || `Error del servidor (${res.status})`)
  }
  return data
}
