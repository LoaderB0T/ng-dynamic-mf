[![npm](https://img.shields.io/npm/v/ng-dynamic-mf?color=%2300d26a&style=for-the-badge)](https://www.npmjs.com/package/ng-dynamic-mf)
[![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/LoaderB0T_ng-dynamic-mf?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/summary/new_code?id=LoaderB0T_ng-dynamic-mf)

# ng-dynamic-mf

Truly dynamic modules at runtime with Module Federation!

## Motivation 💥

Module Federation gets a lot of attention lately - and rightfully so!
For Angular there is the awesome [Module Federation Plugin](https://github.com/angular-architects/module-federation-plugin).
ng-dynamic-mf builds upon this plugin and aims to bring the modularity of Module Federation in Angular to the next level by providing methods to easily load modules at runtime.

## Features 🔥

✅ Dynamic loading of modules at runtime

✅ The host/shell application does not need to be aware of the modules it loads

✅ Modules can be loaded from any location (e.g. from a CDN) that can be unknown to the developer

✅ Modules can be deployed on demand without modifying the host/shell application

✅ Assets are resolved correctly at runtime (both for running the app standalone and in a shell) with a provided pipe.

✅ (Future) Support for custom routing logic (Register module routes as child of any other module)

This project aims to improve the general experience of developers using Module Federation in Angular. Even if you don't _need_ truly dynamic modules, you can still benefit from this project.

## Built With 🔧

- [TypeScript](https://www.typescriptlang.org/)
- [Angular](https://angular.io/)

## Getting Started 🚀

### Module Federation Plugin

This project uses the [Module Federation Plugin](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/mf/README.md) to load modules at runtime. Please follow the instructions in the README.md file of the plugin to get started.

### bootstrapping the host/shell application

ng-dynamic-mf provides an `initializeApp` method that can be used to bootstrap the shell app.

Example:

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { initializeApp, environment } from 'ng-dynamic-mf';

initializeApp()
  .then(() => {
    if (environment.production) {
      enableProdMode();
    }
    return import('./app/app.module');
  })
  .then(x => x.AppModule)
  .then(x => {
    platformBrowserDynamic()
      .bootstrapModule(x)
      .catch(err => console.error(err));
  });
```

Note: ng-dynamic-mf does also export the `environment` variable. This replaces Angulars environment system. You should remove the environment.\*.ts files generated by Angular and switch to the runtime version of ng-dynamic-mf. [more info here](#Enviorment-variables).

ng-dynamic-mf expects a `modules.json` file to be present in the `src/modules` folder of the host/shell application.
Examples of `modules.json`s:

```json
[
  {
    "url": "http://localhost:4201/",
    "name": "home",
    "ngModuleName": "RemoteEntryModule"
  },
  {
    "url": "http://localhost:4202/",
    "name": "projects",
    "ngModuleName": "RemoteEntryModule"
  }
]
```

or

```json
[
  {
    "url": "https://example.com/assets/modules/home/",
    "name": "home",
    "ngModuleName": "RemoteEntryModule"
  },
  {
    "url": "https://example.com/assets/modules/projects/",
    "name": "projects",
    "ngModuleName": "RemoteEntryModule"
  }
]
```

(Mind that the `url`s must be absolute, not relative and end with a slash).

You also need to provide a `environment.json` file in the `src/environments` folder of the host/shell application.
Example of `environment.json`s:

```json
{
  "apiUrl": "http://localhost:5555",
  "production": false
}
```

or

```json
{
  "apiUrl": "https://api.example.com/",
  "production": true
}
```

### bootstrapping a module

Bootstrapping a module app is similar to a regular Angular app. The only difference is importing the `environment` from the `ng-dynamic-mf` module instead of the usual path.

```typescript
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from 'ng-dynamic-mf';

import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

### Assets resolution

When using static assets such as images in a module, you need to teach your app how to resolve the asset.
This is due to the fact that the assets are loaded at runtime and not at build time and the shell app is not aware of the assets that a module provides.

Example of how to resolve assets in a template of the home module:

```html
<img [alt]="contact.name" [src]="'assets/img/logo.svg' | resourceMap:'home'" />
```

When just serving the app this resolves to `${location.origin}/assets/img/logo.svg`. When loaded by the host this will resovle to `https://example.com/assets/modules/home/assets/img/logo.svg` (If this is the configured URL of the module).

You can also do this mapping in code:

```typescript
import { resourceMapper } from 'ng-dynamic-mf';

const path = 'assets/img/logo.svg';
const url = resourceMapper('home', path);
```

### Handling translations (ngx-translate)

When using translations in a module, they need to be loaded at runtime when the module is loaded.

Example of how to register german and english translations in the home module:

```typescript
import { TranslateService } from '@ngx-translate/core';
import { DynamicTranslationService } from 'ng-dynamic-mf';

export class HomeModule {
  constructor(translateService: TranslateService, dynamicTranslationService: DynamicTranslationService) {
    // Initialize the translation service (Has to be done only once)
    dynamicTranslationService.setTranslateService(translateService);
    // Specify that assets/locales/[..].json is the path to a translation file
    // (Resolved with the resource mapper to the home module's assets folder) -> Works for standalone and shell use cases
    return dynamicTranslationService.registerTranslations(['de', 'en'], l => `assets/locales/${l}.json`, 'home');
  }
}
```

<details>
 <summary>I went ahead and implemented a simple resolver for this as a convenient catch 'em all approach.</summary>

```typescript
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DynamicTranslationService } from 'ng-dynamic-mf';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationResolver implements Resolve<void> {
  private readonly _translateService: TranslateService;
  private readonly _dynamicTranslationService: DynamicTranslationService;

  constructor(translateService: TranslateService, dynamicTranslationService: DynamicTranslationService) {
    this._translateService = translateService;
    this._dynamicTranslationService = dynamicTranslationService;
  }

  public resolve(route: ActivatedRouteSnapshot): Observable<void> | Promise<void> | void {
    const moduleName = route.data['module'];
    if (!moduleName) {
      throw new Error('Module name is not defined in rotue data');
    }
    this._dynamicTranslationService.setTranslateService(this._translateService);
    return this._dynamicTranslationService.registerTranslations(['de', 'en'], l => `assets/locales/${l}.json`, moduleName);
  }
}

```

All you need to do then is to make sure that all of your routes have a `data` property with something like `{ module: '<insert-module-name>' }`.
</details>

### Routing

When a module provides routes that should be nested inside of another route of the shell, they need to be configured accordingly.
You dont need to do anything here, if the routes of your modules should all be resolved relative to the root of the shell app (no nesting).
Example:
Route config of the shell:
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '#module-entry-point#',
        redirectTo: '/'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```
We want all modules to be registered where `#module-entry-point#` is located.

```typescript
import { RouterEntryService } from 'ng-dynamic-mf';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home.module').then(m => m.HomeModule),
    data: { activePage: 'home' }
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  }
];

export class HomeEntryModule {
  constructor(routerEntryService: RouterEntryService) {
    routerEntryService.registerRoutes(routes);
    // - OR - You can also register the routes under a specific entry point.
    // This defaults to '#module-entry-point#'
    routerEntryService.registerRoutes(routes, 'details');
  }
}
```

### Enviorment variables

ng-dynamic-mf provides a way to specify variables in an `environment.json` file (after the app has been built). This is different from the `environment.ts` file that is used by Angular CLI, as this will be baked into the app during the build. The `environment.json` file can be edited at any time and the change will be reflected in the app after a reload.

You do not have to use the `environment.json` file, you can also keep using the `environment.ts` file. (However you will need to create an empty `environment.json` file to prevent errors).

## Contributing 🧑🏻‍💻

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 🔑

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact 📧

Janik Schumacher - [@LoaderB0T](https://twitter.com/LoaderB0T) - [linkedin](https://www.linkedin.com/in/janikschumacher/)

Project Link: [https://github.com/LoaderB0T/ng-dynamic-module-federation](https://github.com/LoaderB0T/ng-dynamic-module-federation)

[module-federation-plugin-url]: https://github.com/angular-architects/module-federation-plugin
