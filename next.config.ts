import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/secretaria/atribuicoes',
        destination: '/secretaria/professores',
        permanent: true,
      },
      {
        source: '/secretaria/atribuicoes/:path*',
        destination: '/secretaria/professores',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
