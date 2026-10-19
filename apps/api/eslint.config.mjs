import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.js', '*.mjs'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // ADR-0002 Module Boundaries: Prevent deep cross-module internals imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/*/infrastructure/**'],
              message:
                'ADR-0002 Violation: Direct access to another module infrastructure is forbidden.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/database/scripts/**/*.ts',
      'src/database/*.ts',
      'src/**/scripts/**/*.ts',
      'src/**/profile-*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];
