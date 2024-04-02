import {
  environment,
  Environment,
  ɵinitializeEnvironment,
  ɵreuseEnvironment,
} from 'ng-dynamic-mf/environment';
import { ModuleDefinitions } from '../models/module-definitions.type';
import { loadModule, MfOrNf } from './load-module';
import { AppStartupSettings, AppStartupSettingsInternal } from './load-module-settings.type';
import { LoadRemoteModule } from './load-remote-module.type';
import { loadedModules } from './loaded-modules';

export const initializeAppInternal = async (
  settings: AppStartupSettings,
  loadRemoteModule: LoadRemoteModule,
  mfOrNf: MfOrNf
) => {
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
    ɵinitializeEnvironment(env, actualSettings.loadEnvironment === 'load');
  }
  if (actualSettings.loadEnvironment === 'reuse') {
    ɵreuseEnvironment();
  }

  if (settings.type === 'host') {
    const moduleMap: Record<string, string> = {};
    moduleDefs.modules.forEach(module => {
      moduleMap[module.name] = module.url;
    });
    await Promise.all(
      moduleDefs.modules.map(moduleToLoad => loadModule(moduleToLoad, loadRemoteModule, mfOrNf))
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
