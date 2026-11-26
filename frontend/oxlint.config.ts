import { globSync } from 'node:fs'
import { sep } from 'node:path'
import { defineConfig } from 'oxlint'

const sharedAlias = '^@(?=/|common(?:/|\\u0000|$))'

function importOrder(
  shared: string[] = [],
  local: string[] = [],
): ['error', { groups: string[][] }] {
  return [
    'error',
    {
      groups: [
        ['^'],
        [sharedAlias, ...shared],
        ['^\\.', ...local],
        ['^\\u0000'],
      ],
    },
  ]
}

// Each directory directly under src is a package.
// Compare imports to the importing directory so aliases and ../ agree.
const packageImportRules = globSync('src/*/**/', {
  cwd: import.meta.dirname,
}).map((directory) => {
  const [, ...parts] = directory.split(sep)
  const packagePath = parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const levelsToExit = parts.length
  const outsidePackage = `^(?:\\.\\./){${levelsToExit - 1}}\\.\\.(?:/|\\u0000|$)`
  const packageAliases = ['^@/' + packagePath + '(?:/|\\u0000|$)']
  if (packagePath === 'common') packageAliases.push('^@common(?:/|\\u0000|$)')

  return {
    files: [directory.split(sep).join('/') + '/*'],
    rules: {
      'import-sort/imports': importOrder([outsidePackage], packageAliases),
    },
  }
})

export default defineConfig({
  plugins: ['react', 'typescript', 'oxc'],
  jsPlugins: [
    { name: 'import-sort', specifier: 'eslint-plugin-simple-import-sort' },
  ],
  ignorePatterns: ['dist/**', 'dist-ssr/**', '.husky/**'],
  rules: {
    'react/rules-of-hooks': 'error',
    'react/only-export-components': ['warn', { allowConstantExport: true }],
    'import-sort/imports': importOrder(),
  },
  overrides: [
    ...packageImportRules,
    {
      files: ['src/common/components/ui/button.tsx'],
      rules: {
        'react/only-export-components': [
          'warn',
          { allowExportNames: ['buttonVariants'] },
        ],
      },
    },
  ],
})
