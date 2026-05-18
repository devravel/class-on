import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  { ignores: ['backend/**'] },
  ...nextConfig,
  ...nextTypescript,
  {
    rules: {
      // Legitimate SSR-safe patterns and pathname-responsive effects
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
