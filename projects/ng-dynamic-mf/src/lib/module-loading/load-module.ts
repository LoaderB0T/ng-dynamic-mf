import { loadRemoteModule } from '@angular-architects/module-federation';
import { basePaths } from '../resource-map/base-path';
import { environment } from '../environment';
import { ModuleDefinition } from './load-modules';
import { loadedModules } from './loaded-modules';

export const loadModule = async (moduleToLoad: ModuleDefinition) => {
  const loadedModule = await loadRemoteModule({
    exposedModule: './Module',
    remoteEntry: `${moduleToLoad.url}remoteEntry.js`,
    type: 'module'
  });
  basePaths[moduleToLoad.name] = moduleToLoad.url;
  loadedModules.push(loadedModule[moduleToLoad.ngModuleName]);
  if (!environment.production) {
    console.debug(`Loaded module: ${moduleToLoad.name}`);
  }
};
