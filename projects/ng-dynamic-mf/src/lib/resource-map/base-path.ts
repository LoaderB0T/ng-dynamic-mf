export const basePaths: { [moduleName: string]: string } = {};

export const basePath = (moduleName: string) => {
  return basePaths[moduleName] ?? `${location.origin}/`;
};

export const resourceMapper = (moduleName: string, relativePathFromApp: string) => {
  return `${basePath(moduleName)}${relativePathFromApp}`;
};
