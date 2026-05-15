/**
 * Cliente HTTP centralizado com suporte automático a autenticação JWT
 * 
 * Features:
 * - Adiciona automaticamente header Authorization Bearer token
 * - Lê token do localStorage
 * - Tratamento de erros HTTP padronizado
 * - Suporte a TypeScript com tipos genéricos
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Cliente HTTP com interceptor de autenticação
 */
export const apiClient = {
  /**
   * Faz uma requisição HTTP com suporte automático a autenticação
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options

    const url = `${API_BASE_URL}${endpoint}`

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // Adiciona token automaticamente se a requisição requer autenticação
    if (requiresAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      })

      // Trata erros HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Se for 401 e estiver autenticado, limpa o token inválido
        if (response.status === 401 && requiresAuth) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('auth_user')
            window.location.href = '/login'
          }
        }

        throw new ApiError(
          errorData.message || `HTTP Error ${response.status}`,
          response.status,
          errorData
        )
      }

      // Retorna JSON se houver conteúdo
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }

      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Trata erros de rede
      throw new ApiError(
        'Erro de conexão com o servidor',
        0,
        error
      )
    }
  },

  /**
   * GET request
   */
  get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  },

  /**
   * POST request
   */
  post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * PATCH request
   */
  patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * DELETE request
   */
  delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  },
}

export { ApiError }
