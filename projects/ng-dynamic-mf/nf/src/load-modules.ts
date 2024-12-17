import { initializeAppInternal, AppStartupSettings, LoadRemoteModule } from 'ng-dynamic-mf';

import type { loadRemoteModule as LRM } from '@angular-architects/native-federation-runtime';

type AppStartupSettingsNf = AppStartupSettings &
  (
    | {
        type: 'host';
        loadRemoteModule: typeof LRM;
      }
    | { type: 'remote' }
  );

export function initializeApp(settings: AppStartupSettingsNf) {
  const lrm: LoadRemoteModule = async options => {
    if (settings.type === 'host') {
      const module = await settings.loadRemoteModule({
        ...options,
      });
      return module;
    } else {
      throw new Error(
        'loadRemoteModule has been called for non-host build. This is not supported.'
      );
    }
  };

  return initializeAppInternal(settings, lrm, 'nf');
}
