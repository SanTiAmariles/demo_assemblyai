import { useState } from 'react'
import { entityLabel, formatDuration, formatTimestamp, groupEntities, speakerList } from '../lib/format'

const TABS = [
  { id: 'speakers', label: 'Por hablante' },
  { id: 'text', label: 'Texto completo' },
  { id: 'entities', label: 'Entidades' },
]

export default function ResultView({ result }) {
  const [tab, setTab] = useState(result.utterances.length ? 'speakers' : 'text')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(null)
  const speakers = speakerList(result.utterances)
  const groups = groupEntities(result.entities)
  const speakerIndex = (s) => speakers.indexOf(s) % 6

  const copy = async () => {
    await navigator.clipboard.writeText(result.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const runExport = async (kind) => {
    setExporting(kind)
    try {
      // docx y jspdf son pesados: se cargan solo al exportar
      const { exportPdf, exportWord } = await import('../lib/exporters')
      await (kind === 'word' ? exportWord(result) : exportPdf(result))
    } finally {
      setExporting(null)
    }
  }

  return (
    <section className="card result" aria-label="Resultado de la transcripción">
      <header className="result-head">
        <div>
          <h2>Transcripción</h2>
          <div className="stats">
            <span>⏱ {formatDuration(result.audio_duration)}</span>
            <span>🗣 {speakers.length} {speakers.length === 1 ? 'hablante' : 'hablantes'}</span>
            <span>🏷 {result.entities.length} entidades</span>
          </div>
        </div>
        <div className="actions">
          <button className="btn ghost" onClick={copy}>
            {copied ? '✓ Copiado' : 'Copiar texto'}
          </button>
          <button className="btn word" onClick={() => runExport('word')} disabled={!!exporting}>
            {exporting === 'word' ? 'Generando…' : 'Exportar Word'}
          </button>
          <button className="btn pdf" onClick={() => runExport('pdf')} disabled={!!exporting}>
            {exporting === 'pdf' ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="tab-body" role="tabpanel">
        {tab === 'text' && <p className="full-text">{result.text || 'No se detectó texto en el audio.'}</p>}

        {tab === 'speakers' &&
          (result.utterances.length ? (
            <ol className="utterances">
              {result.utterances.map((u, i) => (
                <li key={i} className={`utt sp-${speakerIndex(u.speaker)}`}>
                  <div className="avatar">{u.speaker}</div>
                  <div className="bubble">
                    <div className="utt-meta">
                      <strong>Hablante {u.speaker}</strong>
                      <time>{formatTimestamp(u.start)}</time>
                    </div>
                    <p>{u.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">No se detectaron hablantes.</p>
          ))}

        {tab === 'entities' &&
          (groups.length ? (
            <div className="entity-groups">
              {groups.map((g) => (
                <div key={g.type} className="entity-group">
                  <h3>{entityLabel(g.type)}</h3>
                  <div className="chips">
                    {g.items.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No se reconocieron entidades.</p>
          ))}
      </div>
    </section>
  )
}
