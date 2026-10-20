import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  js.configs.recommended,

  // Configuración para archivos TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      // Reglas recomendadas de TypeScript
      ...tseslint.configs.recommended.rules,

      // Reglas personalizadas migradas desde .eslintrc.js
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],

      // Configuración de Prettier - usa el archivo .prettierrc
      'prettier/prettier': 'error',
    },
  },

  // Desactivar reglas que conflictan con Prettier (debe estar después de las reglas de TypeScript)
  prettierConfig,

  // Configuración específica para archivos de test y mocks
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts', '**/*.mock.ts'],
    languageOptions: {
      globals: {
        fail: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },

  // Configuración para archivos JavaScript (si los hay)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Archivos a ignorar
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.d.ts', 'migrations/**', '**/build/**', 'lcov-report/**'],
  },
];
