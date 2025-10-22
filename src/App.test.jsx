import React from 'react'
import { render, screen } from '@testing-library/react'
import App, { formatInternalNote } from './App'

// ---- Test hooks (define once, at top-level) ----
beforeEach(() => {
  // Ensure app sees an endpoint in Jest/CI
  window.__APP_ENDPOINT__ = 'https://demo-app.free.beeceptor.com/ticket/43'

  // Default: happy-path mock
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ orderId: 43, customer: 'Alex Smith', items: [4, 9, 17] })
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ---- Unit: pure function ----
test('formatInternalNote builds correct summary', () => {
  const s = formatInternalNote({ orderId: 43, items: [4, 9, 17] })
  expect(s).toMatch(/order 43/i)
  expect(s).toMatch(/items 4,9,17/i)
})

// ---- Integration: happy path ----
test('renders data after fetch', async () => {
  render(<App />)

  // Be robust: badge exists first…
  const status = screen.getByRole('status')
  expect(status).toBeInTheDocument()

  // …then data appears…
  await screen.findByText(/order:/i)

  // …and badge should now say OK
  expect(status).toHaveTextContent(/ok/i)

  // Finally confirm the rendered data
  expect(screen.getByText(/43/)).toBeInTheDocument()
  expect(screen.getByText(/alex smith/i)).toBeInTheDocument()
  expect(screen.getByText(/4, 9, 17/)).toBeInTheDocument()
})



// ---- Integration: error path ----
test('shows error when fetch fails', async () => {
  // Override the default mock JUST for this test
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({})
  })

  render(<App />)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(/couldn[’']t load data/i)
})
