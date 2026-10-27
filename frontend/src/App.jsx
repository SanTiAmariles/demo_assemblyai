import { useEffect, useRef, useState } from 'react'
import ResultView from './components/ResultView'
import UploadZone from './components/UploadZone'
import { transcribeAudio } from './lib/api'

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const abort = useRef(null)

  useEffect(() => () => file?.previewUrl && URL.revokeObjectURL(file.previewUrl), [file])

  const selectFile = (f) => {
    f.previewUrl = URL.createObjectURL(f)
    setFile(f)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  const clear = () => {
    abort.current?.abort()
    setFile(null)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  const submit = async () => {
    abort.current = new AbortController()
    setStatus('loading')
    setError('')
    try {
      setResult(await transcribeAudio(file, { signal: abort.current.signal }))
      setStatus('done')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="badge">Impulsado por AssemblyAI</div>
        <h1>Transcriptor de Audio</h1>
        <p>Sube un audio en español y obtén el texto, quién habló y las entidades mencionadas. Exporta a Word o PDF.</p>
      </header>

      <main className="content">
        <UploadZone file={file} onFile={selectFile} onSubmit={submit} onClear={clear} loading={status === 'loading'} />

        {status === 'error' && (
          <div className="alert" role="alert">
            <strong>No se pudo transcribir.</strong> {error}
          </div>
        )}

        {status === 'loading' && (
          <div className="card skeleton" aria-hidden>
            <div /> <div /> <div />
          </div>
        )}

        {result && status === 'done' && <ResultView result={result} />}
      </main>

      <footer className="foot">Tu API key se queda en el servidor; el navegador nunca la ve.</footer>
    </div>
  )
}
