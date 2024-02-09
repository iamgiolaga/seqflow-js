import { expect, test } from 'vitest'
import { start, ComponentParam } from '../src/index'

test('test 1', async () => {
  async function app({ render, querySelector, waitEvent, domEvent }: ComponentParam) {
    render('<button type="button">increment</button><p id="result"></p>')

    const result = querySelector<HTMLParagraphElement>('#result')

    let i = 0
    const events = waitEvent(domEvent('click'))
    for await (const event of events) {
      result.textContent = `${++i}`
    }
  }

  const c = start(document.body, app, {
    log(l) {
    },
    businessEventBus: {},
    navigationEventBus: new EventTarget(),
  })
  expect(document.body.innerHTML).toBe('<button type="button">increment</button><p id="result"></p>')

  document.body.querySelector('button')!.click()
  await new Promise(resolve => setTimeout(resolve, 10))

  expect(document.body.innerHTML).toBe('<button type="button">increment</button><p id="result">1</p>')

  document.body.querySelector('button')!.click()
  document.body.querySelector('button')!.click()
  document.body.querySelector('button')!.click()
  await new Promise(resolve => setTimeout(resolve, 10))

  expect(document.body.innerHTML).toBe('<button type="button">increment</button><p id="result">4</p>')

  // This should unmount the whole application
  c.abort('test')
  await new Promise(resolve => setTimeout(resolve, 100))

  const result = document.body.querySelector<HTMLParagraphElement>('#result')!

  // The handler is not attached anymore
  document.body.querySelector<HTMLButtonElement>('button')!.click()
  await new Promise(resolve => setTimeout(resolve, 10))

  expect(result.innerHTML).toBe('4')


  async function app2({ render, querySelector, waitEvent, domEvent }: ComponentParam) {
    render(`
<button type="button" id="increment">increment</button>
<button type="button" id="decrement">decrement</button>
<p id="result"></p>
`)

    const result = querySelector<HTMLParagraphElement>('#result')
    const increment = querySelector<HTMLButtonElement>('#increment')
    const decrement = querySelector<HTMLButtonElement>('#decrement')

    let i = 0
    const events = waitEvent(domEvent('click'))
    for await (const event of events) {
      if (event.target === increment) {
        result.textContent = `${++i}`
      } else if (event.target === decrement) {
        result.textContent = `${--i}`
      } else {
        throw new Error('unknown event')
      }
    }
  }
  start(document.body, app2, {
    log(l) {
    },
    businessEventBus: {},
    navigationEventBus: new EventTarget(),
  })

  expect(document.body.innerHTML).toBe(`
<button type="button" id="increment">increment</button>
<button type="button" id="decrement">decrement</button>
<p id="result"></p>
`)

  document.body.querySelector<HTMLButtonElement>('#increment')!.click()
  await new Promise(resolve => setTimeout(resolve, 10))

  const result2 = document.body.querySelector<HTMLParagraphElement>('#result')!
  expect(result2.innerHTML).toBe('1')
})