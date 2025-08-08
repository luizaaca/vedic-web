// eslint.config.mts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export const ignores = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  'eslint.config.mts',
  '**/*.d.ts',
];

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json', // usa tsconfig.json
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,
      'react/jsx-uses-react': 'off', // não é mais necessário com React 17+
      'react/react-in-jsx-scope': 'off', // idem
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
    overrides: [
      {
        // Para arquivos de declaração
        files: ['**/*.d.ts'],
        rules: {
          '@typescript-eslint/no-unused-vars': 'off',
        },
      },
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mts', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
      },
    },
    rules: {
      // sem rules pesadas aqui
    },
  },
];
