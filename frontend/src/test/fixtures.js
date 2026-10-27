export const sampleResult = {
  id: 'tx_123',
  filename: 'reunion.mp3',
  audio_duration: 95,
  text: 'Hola, soy Ana de Bogotá. Mucho gusto, soy Luis.',
  utterances: [
    { speaker: 'A', text: 'Hola, soy Ana de Bogotá.', start: 0, end: 2500 },
    { speaker: 'B', text: 'Mucho gusto, soy Luis.', start: 62000, end: 64800 },
  ],
  entities: [
    { type: 'person_name', text: 'Ana' },
    { type: 'location', text: 'Bogotá' },
    { type: 'person_name', text: 'Luis' },
    { type: 'person_name', text: 'ana' },
  ],
}
