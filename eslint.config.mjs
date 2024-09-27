import awdwareAngular from '@awdware/eslint-config-angular';

export default [
  {
    ignores: ['test/**/*', '**/jest.config.ts', 'eslint.config.mjs'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs'],
          defaultProject: true,
        },
        tsconfigRootDir: import.meta.name,
        allowDefaultProject: true,
      },
    },
  },
  ...awdwareAngular,
  {},
];
