import { loadRemoteModule } from '@angular-architects/module-federation';

import { initializeAppInternal, AppStartupSettings, LoadRemoteModule } from 'ng-dynamic-mf';

export function initializeApp(settings: AppStartupSettings) {
  const lrm: LoadRemoteModule = async options => {
    const module = await loadRemoteModule({
      ...options,
      type: 'module',
    });
    return module;
  };

  return initializeAppInternal(settings, lrm);
}
