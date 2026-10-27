import { useRef, useState } from 'react'

const ACCEPT = 'audio/*,video/mp4,video/webm,.mp3,.wav,.m4a,.ogg,.flac,.aac,.opus'

function formatSize(bytes) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
}

export default function UploadZone({ file, onFile, onSubmit, onClear, loading }) {
  const input = useRef(null)
  const [dragging, setDragging] = useState(false)

  const pick = (files) => {
    if (files?.[0]) onFile(files[0])
  }

  if (file) {
    return (
      <div className="card file-card">
        <div className="file-row">
          <div className="file-icon" aria-hidden>🎵</div>
          <div className="file-info">
            <strong>{file.name}</strong>
            <span>{formatSize(file.size)}</span>
          </div>
          {!loading && (
            <button className="btn ghost" onClick={onClear} aria-label="Quitar archivo">
              ✕
            </button>
          )}
        </div>
        <audio className="player" controls src={file.previewUrl} />
        <button className="btn primary big" onClick={onSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden /> Transcribiendo…
            </>
          ) : (
            'Transcribir audio'
          )}
        </button>
        {loading && <p className="hint">Esto puede tardar desde unos segundos hasta un par de minutos según la duración.</p>}
      </div>
    )
  }

  return (
    <div
      className={`card dropzone ${dragging ? 'dragging' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => input.current.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        pick(e.dataTransfer.files)
      }}
    >
      <div className="drop-icon" aria-hidden>⬆</div>
      <p className="drop-title">Arrastra tu audio aquí</p>
      <p className="drop-sub">
        o <span className="link">haz clic para elegir un archivo</span>
      </p>
      <p className="drop-formats">MP3 · WAV · M4A · OGG · FLAC · hasta 200 MB</p>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        hidden
        data-testid="file-input"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  )
}
