import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { sampleResult } from './fixtures'

const audio = () => new File(['fake'], 'reunion.mp3', { type: 'audio/mpeg' })

function mockFetch(response) {
  globalThis.fetch = vi.fn().mockResolvedValue(response)
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => vi.restoreAllMocks())

describe('App', () => {
  it('sube un audio y muestra hablantes, texto y entidades', async () => {
    mockFetch({ ok: true, json: async () => sampleResult })
    const user = userEvent.setup()
    render(<App />)

    await user.upload(screen.getByTestId('file-input'), audio())
    expect(screen.getByText('reunion.mp3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Transcribir audio' }))
    expect(await screen.findByText('Hola, soy Ana de Bogotá.')).toBeInTheDocument()

    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('/api/transcribe')
    expect(init.body.get('file').name).toBe('reunion.mp3')

    expect(screen.getByText(/2 hablantes/)).toBeInTheDocument()
    expect(screen.getByText('01:02')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Texto completo' }))
    expect(screen.getByText(sampleResult.text)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Entidades' }))
    expect(screen.getByText('Persona')).toBeInTheDocument()
    expect(screen.getByText('Bogotá')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Exportar Word' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled()
  })

  it('muestra el error del servidor', async () => {
    mockFetch({ ok: false, status: 502, json: async () => ({ detail: 'Falta la variable de entorno ASSEMBLYAI_API_KEY.' }) })
    const user = userEvent.setup()
    render(<App />)

    await user.upload(screen.getByTestId('file-input'), audio())
    await user.click(screen.getByRole('button', { name: 'Transcribir audio' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('ASSEMBLYAI_API_KEY')
  })

  it('avisa si el backend no está corriendo', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    render(<App />)

    await user.upload(screen.getByTestId('file-input'), audio())
    await user.click(screen.getByRole('button', { name: 'Transcribir audio' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
  })

  it('permite quitar el archivo y volver a la zona de carga', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.upload(screen.getByTestId('file-input'), audio())
    await user.click(screen.getByRole('button', { name: 'Quitar archivo' }))
    await waitFor(() => expect(screen.getByText('Arrastra tu audio aquí')).toBeInTheDocument())
  })
})
