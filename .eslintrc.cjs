module.exports = {
  extends: ['next/core-web-vitals'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'react/no-unescaped-entities': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off'
  },
  ignorePatterns: ['**/*'],
  settings: {
    next: {
      rootDir: '.'
    },
    react: {
      version: 'detect'
    }
  }
}; 