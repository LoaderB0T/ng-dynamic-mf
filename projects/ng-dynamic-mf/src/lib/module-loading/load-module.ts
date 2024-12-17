import { environment } from 'ng-dynamic-mf/environment';

import { LoadRemoteModule } from './load-remote-module.type';
import { loadedModules } from './loaded-modules';
import { ModuleDefinition } from '../models/module-definition.type';
import { basePaths, resourceMapper } from '../resource-map/resource-mapper';
import { join } from '../utils';

export type MfOrNf = 'mf' | 'nf';

export const loadModule = async (
  moduleToLoad: ModuleDefinition,
  loadRemoteModule: LoadRemoteModule,
  mfOrNf: MfOrNf
) => {
  fixModuleToLoadUrl(moduleToLoad);

  const remoteEntryFileName = mfOrNf === 'nf' ? 'remoteEntry.json' : 'remoteEntry.js';

  const hash = moduleToLoad.hash ? `?${moduleToLoad.hash}` : '';

  let loadedModule: any;
  try {
    loadedModule = await loadRemoteModule({
      exposedModule: './Module',
      remoteEntry: `${join(moduleToLoad.url, remoteEntryFileName)}${hash}`,
    });
  } catch (error) {
    console.error(`Module not loaded: ${moduleToLoad.name}`, error);
    return;
  }
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
    link.onerror = e => {
      console.error(`Error loading global styles for module: ${moduleToLoad.name}`, e);
    };
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
