// eslint.config.mts
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export const ignores = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  'eslint.config.mts'  
];

// Exporta um array de configs (flat config)
export default [
  {
    // Ignora pastas e arquivos
    ignores: [...ignores, '**/*.d.ts'],
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,

      // Ajustes que geralmente se faz no TS + Next
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  {
    ignores,
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
