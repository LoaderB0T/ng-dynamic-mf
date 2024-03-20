import { environment, Environment, initializeEnvironment, reuseEnvironment } from '../environment';
import { ModuleDefinitions } from '../models/module-definitions.type';
import { loadModule } from './load-module';
import { loadedModules } from './loaded-modules';

type OptionalSettings = {
  modulePath: string;
  environmentPath: string;
  /**
   * Describes how the environment variables should be resolved.
   * - `none`: No environment variables are loaded.
   * - `loadAndReuse` *(default)*: The environment variables are loaded and reused from existing loaded environments.
   * - `load`: The environment variables are loaded, but none are reused.
   * - `reuse`: The environment variables are reused from existing loaded environments but not loaded.
   */
  loadEnvironment: 'none' | 'loadAndReuse' | 'load' | 'reuse';
};
type RequiredSettings =
  | {
      type: 'host';
    }
  | {
      type: 'remote';
    };

    export type AppStartupSettings = Partial<OptionalSettings> & RequiredSettings;
type AppStartupSettingsInternal = OptionalSettings & RequiredSettings;


export const initializeApp = async (settings: AppStartupSettings) => {
  const actualSettings: AppStartupSettingsInternal = {
    loadEnvironment: 'loadAndReuse',
    modulePath: '/modules.json',
    environmentPath: '/environment.json',
    ...settings,
  };

  const doLoadEnvironment =
    actualSettings.loadEnvironment === 'loadAndReuse' || actualSettings.loadEnvironment === 'load';

  const fetchModules =
    settings.type === 'host'
      ? fetch(actualSettings.modulePath, { cache: 'no-cache' })
          .then(x => x.json())
          .catch(() => {
            throw new Error('Failed to load modules.json');
          })
      : Promise.resolve([]);

  const fetchEnvironment = doLoadEnvironment
    ? fetch(actualSettings.environmentPath, { cache: 'no-cache' })
        .then(x => x.json())
        .catch(() => {
          throw new Error('Failed to load environment.json');
        })
    : Promise.resolve({});

  const [moduleDefs, env] = (await Promise.all([fetchModules, fetchEnvironment])) as [
    ModuleDefinitions,
    Environment,
  ];
  if (doLoadEnvironment) {
    initializeEnvironment(env, actualSettings.loadEnvironment === 'load');
  }
  if (actualSettings.loadEnvironment === 'reuse') {
    reuseEnvironment();
  }

  if (settings.type === 'host') {
    const moduleMap: Record<string, string> = {};
    moduleDefs.modules.forEach(module => {
      moduleMap[module.name] = module.url;
    });
    await Promise.all(
      moduleDefs.modules.map(moduleToLoad => loadModule(moduleToLoad))
    );
    if (!environment.production) {
      console.debug(
        'Loaded modules:',
        moduleDefs.modules.map(x => x.name),
        loadedModules
      );
    }
  }
};
