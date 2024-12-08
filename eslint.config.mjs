import awdwareNode from '@awdware/eslint-config-angular';

export default [
  {
    ignores: ['test/**/*', '**/jest.config.ts', 'eslint.config.mjs'],
  },
  ...awdwareNode,
  {
    rules: {},
  },
];
