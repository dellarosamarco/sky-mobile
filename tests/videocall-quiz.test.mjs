import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('videocall uses the seven final Sky Mobile quiz questions at random', async () => {
  const video = await read('src/components/VideoCallExperience.jsx')

  const expectedQuestions = [
    'La nuova offerta Sky Mobile è solo per chi è già cliente o anche per i nuovi?',
    'Fino a quanti mesi gratis può avere chi è già abbonato Sky?',
    'Quali vantaggi ha chi è cliente Sky da più di sei anni?',
    'Qual è il prezzo di partenza della nuova offerta Sky Mobile?',
    'I nuovi clienti che scelgono Sky Mobile in abbinamento a TV o Wifi, hanno vantaggi sulla componente Mobile?',
    'Chi ha Sky Mobile Powered by Fastweb può passare alla nuova offerta Sky Mobile?',
    'Con Sky Mobile ci vuole per forza la SIM card o c’è anche la e-SIM?',
  ]

  for (const question of expectedQuestions) assert.match(video, new RegExp(question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))

  assert.doesNotMatch(video, /placeholder-|copy definitiva da inserire|Risposta A|Risposta B/)
  assert.match(video, /const question = useMemo\(\(\) => randomItem\(QUESTIONS\), \[\]\)/)

  assert.match(video, /label: 'Tutti', correct: true/)
  assert.match(video, /label: 'Sei mesi', correct: true/)
  assert.match(video, /label: 'Giga illimitati e 6 mesi gratis', correct: true/)
  assert.match(video, /label: '7,90', correct: true/)
  assert.match(video, /label: 'Sì, giga illimitati', correct: true/)
  assert.match(video, /label: 'No, ma sarà possibile in futuro', correct: true/)
  assert.match(video, /label: 'C’è sia la SIM fisica che la e-SIM\.', correct: true/)
})
