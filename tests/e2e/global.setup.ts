/**
 * Global setup: create a throw-away test account via /api/auth/generate,
 * then persist the signed auth cookie so all tests start authenticated.
 *
 * The generate endpoint inserts a new user row and returns a Set-Cookie header
 * with a fully-signed `auth` cookie — no direct DB or HMAC key access needed.
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const STORAGE_PATH = path.join(__dirname, '.auth', 'user.json')

setup('authenticate test user', async ({ request }) => {
  // Create a fresh user via the public generate endpoint.
  const res = await request.post('/api/auth/generate')
  expect(res.status()).toBe(200)

  const body = await res.json() as { code?: string; error?: string }
  expect(body.code).toBeDefined()

  // Extract the Set-Cookie value from the response.
  const setCookie = res.headers()['set-cookie'] ?? ''
  const match = setCookie.match(/auth=([^;]+)/)
  expect(match, 'auth cookie must be present in generate response').toBeTruthy()

  // Persist the cookie into Playwright's storage-state format so that all
  // subsequent test contexts start with a valid session.
  const authValue = match![1]
  const storageState = {
    cookies: [
      {
        name: 'auth',
        value: authValue,
        domain: 'localhost',
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  }

  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true })
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(storageState, null, 2))
})
