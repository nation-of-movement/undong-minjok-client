import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'

export default defineConfig([
  {
    name: 'files-to-lint',
    files: ['src/**/*.{js,jsx,ts,tsx,vue}'],
  },

  // 빌드 산출물은 ESLint 제외
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    // JS 실행 환경
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },

  // JS 기본 추천 규칙
  js.configs.recommended,

  // Vue recommended rules (최신 버전)
  {
    ...vue.configs['flat/recommended'],
    rules: {
      // Vue template 룰
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/no-v-html': 'off',

      // 코드 품질 룰
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',

      // import 관련
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
    },
  },

  // Prettier 충돌 제거
  prettier,
])
