export type ModuleDefinition = {
  name: string;
  projectName?: string;
  ngModuleName: string;
  url: string;
  hash?: string;
  hasGlobalStyles?: boolean;
  globalStyleBundleName?: string;
};
