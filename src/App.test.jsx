import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import App, { formatInternalNote } from './App'

beforeAll(() => {
  // Make sure tests see your Beeceptor endpoint
  window.__APP_ENDPOINT__ = 'https://demo-app.free.beeceptor.com';
});


// Unit: formatter
test('formatInternalNote builds correct summary', () => {
  const s = formatInternalNote({ orderId: 43, items: [4, 9, 17] })
  expect(s).toMatch(/order 43/i)
  expect(s).toMatch(/items 4,9,17/i)
})

// Integration: happy path
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ orderId: 43, customer: 'Alex Smith', items: [4, 9, 17] })
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

test('renders data after fetch', async () => {
  render(<App />)
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  await waitFor(() => screen.getByText(/order:/i))
  expect(screen.getByText(/43/)).toBeInTheDocument()
  expect(screen.getByText(/alex smith/i)).toBeInTheDocument()
})

// Integration: error state
test('shows error when fetch fails', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }))
  render(<App />)
  await waitFor(() => screen.getByRole('alert'))
  expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t load data/i)
})
