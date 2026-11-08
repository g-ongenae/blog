import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const MULTILINE = [
  'block-like',
  'class',
  'function',
  'interface',
  'multiline-const',
  'multiline-export',
  'multiline-expression',
  'multiline-let',
  'multiline-type',
];

export default defineConfig(
  globalIgnores(['public/', 'static/terminal.js']),
  js.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['static/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  prettier,
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: 'error',
      // Prettier keeps blank lines but never adds them: require them after imports and
      // declarations, before returns, and around anything spanning several lines.
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: MULTILINE },
        { blankLine: 'always', prev: MULTILINE, next: '*' },
      ],
    },
  },
);
