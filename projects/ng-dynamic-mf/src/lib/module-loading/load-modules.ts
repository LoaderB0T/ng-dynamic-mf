import { environment, Environment, initializeEnvironment } from '../environment';
import { AppInitBehavior } from '../models/app-init-behavior.type';
import { ModuleDefinition } from '../models/module-definition.type';
import { loadModule } from './load-module';
import { loadedModules } from './loaded-modules';

export const initializeApp = async (
  behavior: AppInitBehavior = 'loadModulesAndEnvironment',
  modulePath?: string,
  environmentPath?: string
) => {
  const doLoadModules = behavior === 'loadModulesAndEnvironment' || behavior === 'loadModules';
  const doLoadEnvironment = behavior === 'loadModulesAndEnvironment' || behavior === 'loadEnvironment';

  const fetchModules = doLoadModules
    ? fetch(modulePath ?? '/modules/modules.json', { cache: 'no-cache' })
        .then(x => x.json())
        .catch(() => {
          throw new Error('Failed to load modules.json');
        })
    : Promise.resolve([]);

  const fetchEnvironment = doLoadEnvironment
    ? fetch(environmentPath ?? '/environments/environment.json')
        .then(x => x.json())
        .catch(() => {
          throw new Error('Failed to load environment.json');
        })
    : Promise.resolve({});

  const [modules, env] = (await Promise.all([fetchModules, fetchEnvironment])) as [ModuleDefinition[], Environment];
  if (doLoadEnvironment) {
    initializeEnvironment(env);
  }

  if (doLoadModules) {
    await Promise.all(modules.map(moduleToLoad => loadModule(moduleToLoad)));
    if (!environment.production) {
      console.debug(
        'Loaded modules:',
        modules.map(x => x.name),
        loadedModules
      );
    }
  }
};
