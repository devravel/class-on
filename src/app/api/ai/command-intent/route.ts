import { NextRequest, NextResponse } from 'next/server'

import {
  createLocalIntentResponse,
  createUnknownIntentResponse,
  type CommandIntentResponse,
} from '@/lib/command-intent'
import type { UserRole } from '@/contexts/auth-context'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const COMMAND_INTENT_TIMEOUT_MS = 1500

interface CommandIntentRequestBody {
  input: string
  role: UserRole
  availableClasses?: string[]
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return NextResponse.json(
      { message: 'Autenticação necessária.' },
      { status: 401 },
    )
  }

  let body: CommandIntentRequestBody
  try {
    body = (await request.json()) as CommandIntentRequestBody
  } catch {
    return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 })
  }

  if (!body.input?.trim()) {
    return NextResponse.json(createUnknownIntentResponse(), { status: 200 })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), COMMAND_INTENT_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/ai/command-intent`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: body.input.trim(),
        role: body.role,
        availableClasses: body.availableClasses,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Backend respondeu com status ${response.status}`)
    }

    const data = (await response.json()) as CommandIntentResponse
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      createLocalIntentResponse(body.role, body.input.trim(), []),
      { status: 200 },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
