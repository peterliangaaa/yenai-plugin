module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    Bot: true,
    redis: true,
    logger: true,
    plugin: true
  },
  rules: {
    'eqeqeq': ['off'],
    'prefer-const': ['off'],
    'arrow-body-style': 'off',
    'camelcase': 'off',
    'quote-props': ['error', 'consistent-as-needed']
  }
}
