import { basePaths, resourceMapper } from '../resource-map/resource-mapper';
import { environment } from '../environment';
import { loadedModules } from './loaded-modules';
import { ModuleDefinition } from '../models/module-definition.type';
import { join } from '../utils';
import { LoadRemoteModule } from './load-remote-module.type';

export const loadModule = async (
  moduleToLoad: ModuleDefinition,
  loadRemoteModule: LoadRemoteModule
) => {
  fixModuleToLoadUrl(moduleToLoad);

  const hash = moduleToLoad.hash ? `?${moduleToLoad.hash}` : '';
  const loadedModule = await loadRemoteModule({
    exposedModule: './Module',
    remoteEntry: `${join(moduleToLoad.url, 'remoteEntry.json')}${hash}`,
  });
  basePaths[moduleToLoad.name] = moduleToLoad.url;
  loadedModules.push(loadedModule[moduleToLoad.ngModuleName]);
  if (moduleToLoad.hasGlobalStyles) {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.id = `global-style-${moduleToLoad.name}`;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = resourceMapper(
      moduleToLoad.name,
      moduleToLoad.globalStyleBundleName ?? 'global-styles.css'
    );
    link.media = 'all';
    head.appendChild(link);
  }
  if (!environment.production) {
    console.debug(`Loaded module: ${moduleToLoad.name}`);
  }
};
function fixModuleToLoadUrl(moduleToLoad: ModuleDefinition) {
  if (!moduleToLoad.url.startsWith('http')) {
    if (moduleToLoad.url.startsWith('/')) {
      moduleToLoad.url = `.${moduleToLoad.url}`;
    } else if (!moduleToLoad.url.startsWith('./')) {
      moduleToLoad.url = `./${moduleToLoad.url}`;
    }
  }
}
