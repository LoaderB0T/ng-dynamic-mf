import type { loadRemoteModule as LoadRemoteModule } from '@angular-architects/native-federation-runtime';
import { environment, Environment, initializeEnvironment, reuseEnvironment } from '../environment';
import { AppInitBehavior } from '../models/app-init-behavior.type';
import { ModuleDefinitions } from '../models/module-definitions.type';
import { loadModule } from './load-module';
import { loadedModules } from './loaded-modules';

export const initializeApp = async (
  behavior: AppInitBehavior = 'loadModulesAndEnvironment',
  settings?: {
    modulePath?: string;
    environmentPath?: string;
    disableParentEnvironmentReuse?: boolean;
    loadRemoteModule?: typeof LoadRemoteModule;
  }
) => {
  const doLoadModules = behavior === 'loadModulesAndEnvironment' || behavior === 'loadModules';
  const doLoadEnvironment = behavior === 'loadModulesAndEnvironment' || behavior === 'loadEnvironment';

  const fetchModules = doLoadModules
    ? fetch(settings?.modulePath ?? '/modules.json', { cache: 'no-cache' })
        .then(x => x.json())
        .catch(() => {
          throw new Error('Failed to load modules.json');
        })
    : Promise.resolve([]);

  const fetchEnvironment = doLoadEnvironment
    ? fetch(settings?.environmentPath ?? '/environment.json', { cache: 'no-cache' })
        .then(x => x.json())
        .catch(() => {
          throw new Error('Failed to load environment.json');
        })
    : Promise.resolve({});

  const [moduleDefs, env] = (await Promise.all([fetchModules, fetchEnvironment])) as [ModuleDefinitions, Environment];
  if (doLoadEnvironment) {
    initializeEnvironment(env, settings?.disableParentEnvironmentReuse);
  }
  if (behavior === 'reuseEnvironment') {
    reuseEnvironment();
  }

  if (doLoadModules) {
    const moduleMap: Record<string, string> = {};
    moduleDefs.modules.forEach(module => {
      moduleMap[module.name] = module.url;
    });
    await Promise.all(moduleDefs.modules.map(moduleToLoad => loadModule(moduleToLoad, settings!.loadRemoteModule!)));
    if (!environment.production) {
      console.debug(
        'Loaded modules:',
        moduleDefs.modules.map(x => x.name),
        loadedModules
      );
    }
  }
};
