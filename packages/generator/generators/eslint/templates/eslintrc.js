'use strict'

module.exports = {
  parser: 'babel-eslint',

  extends: [
    '@strv/javascript/environments/nodejs/v10',
    '@strv/javascript/environments/nodejs/optional',<%_ if (config.testsuite) { %>
    '@strv/javascript/environments/mocha/recommended',<%_ } %>
    '@strv/javascript/coding-styles/recommended',
  ],

  rules: {
    // If your editor cannot show these to you, occasionally turn this off and run the linter
    'no-warning-comments': 0,

    'node/no-unsupported-features/es-syntax': ['error', {
      ignores: ['modules'],
    }],
  },

  overrides: [{<%_ if (!config.testsuite) { %>
    // Custom settings for your test files
    files: [
      '**/*.test.mjs',
    ],

    env: {
      // Enable your test environment of choice here to have ESLint recognise its globals
      // mocha: true,
    },<%_ } else { %>
    files: [
      '**/*.test.mjs',
    ],

    env: {
      mocha: true,
    },

    globals: {
      expect: true,
      sinon: true,
    },

    rules: {
      'max-classes-per-file': 'off',
    },<%_ } %>
  }, {
    // Custom settings for plain JavaScript files
    files: [
      '*.js',
      '.*.js',
    ],

    parserOptions: {
      sourceType: 'script',
    },
  }],
}
