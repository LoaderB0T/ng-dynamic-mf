[![npm](https://img.shields.io/npm/v/ng-dynamic-mf?color=%2300d26a&style=for-the-badge)](https://www.npmjs.com/package/ng-dynamic-mf)
[![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/LoaderB0T_ng-dynamic-mf?server=https%3A%2F%2Fsonarcloud.io&style=for-the-badge)](https://sonarcloud.io/summary/new_code?id=LoaderB0T_ng-dynamic-mf)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ng-dynamic-mf?color=%23FF006F&label=Bundle%20Size&style=for-the-badge)](https://bundlephobia.com/package/ng-dynamic-mf)

# ng-dynamic-mf

Truly dynamic modules at runtime with Module / Native Federation!

## Motivation 💥

ng-dynamic-mf works with both module federation and native federation. In the following, I will refer to both as "module federation" for simplicity.

Module Federation builds upon the concepts of Module Federation without the need for webpack. For Angular, there is the excellent [Module Federation Plugin](https://github.com/angular-architects/module-federation-plugin/blob/main/README.md). ng-dynamic-mf now leverages Module Federation, bringing modularity in Angular to the next level by providing methods to easily load modules at runtime.

## Features 🔥

✅ Dynamic loading of modules at runtime

✅ The host/shell application does not need to be aware of the modules it loads

✅ Modules can be loaded from any location (e.g., from a CDN) that can be unknown to the developer

✅ Works with Webpack & ESBuild

✅ Modules can be deployed on demand without modifying the host/shell application

✅ Assets are resolved correctly at runtime (both for running the app standalone and in a shell) with a provided pipe.

✅ Support for custom routing logic (Register module routes as a child of any other module)

✅ Support for global styles (Load global styles from any module)

✅ Use with Nx with [nx-dynamic-mf](https://github.com/LoaderB0T/nx-dynamic-mf)

This project aims to improve the general experience of developers using Module Federation in Angular. Even if you don't _need_ truly dynamic modules, you can still benefit from this project.

## Built With 🔧

- [TypeScript](https://www.typescriptlang.org/)
- [Angular](https://angular.io/)

## Getting Started 🚀

If you want to check out a working example, take a look at my portfolio project [awdware](https://github.com/LoaderB0T/awdware3).

If you are using Nx, you should also check out [nx-dynamic-mf](https://github.com/LoaderB0T/nx-dynamic-mf)

### Module Federation Plugin

This project uses the [Module Federation Plugin](https://github.com/angular-architects/module-federation-plugin/blob/main/libs/mf/README.md) to load modules at runtime. Please follow the instructions in the README.md file of the plugin to get started.

### Bootstrapping the host/shell application

ng-dynamic-mf provides an `initializeApp` method that can be used to bootstrap the shell app.

Example:

```typescript
// This example uses native federation!

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { initializeApp } from 'ng-dynamic-mf/nf';
import { environment } from 'ng-dynamic-mf/environment';
// Due to an issue in the Module Federation Plugin, we need to import loadRemoteModule from the plugin directly and pass it to ng-dynamic-mf. This is only required for the native federation use case.
import { loadRemoteModule } from '@angular-architects/native-federation';

initializeApp({
  type: 'host', // Specify that this is the host/shell application
  loadRemoteModule,
})
.then(() => {
  if (environment.production) { // This is the environment variable provided by ng-dynamic-mf
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

Note: ng-dynamic-mf does also export the `environment` variable. This replaces Angulars environment system. You should remove the environment.\*.ts files generated by Angular and switch to the runtime version of ng-dynamic-mf. [more info here](#environment-variables).

ng-dynamic-mf expects a `modules.json` file to be present in the `src` folder of the host/shell application.
Examples of `modules.json`s:

```json
{
  "$schema": "https://raw.githubusercontent.com/LoaderB0T/ng-dynamic-mf/main/schema.json",
  "modules": [
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
}
```

or

```json
{
  "$schema": "https://raw.githubusercontent.com/LoaderB0T/ng-dynamic-mf/main/schema.json",
  "modules": [
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
}
```

(Mind that the `url`s must be absolute, not relative and end with a slash).

You also need to provide an `environment.json` file in the `src` folder of the host/shell application.
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
import { environment } from 'ng-dynamic-mf/environment';

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
import { DynamicTranslationService } from 'ng-dynamic-mf/translate';

export class HomeModule {
  constructor(dynamicTranslationService: DynamicTranslationService) {
    // Specify that assets/i18n/[..].json is the path to a translation file for each language. Other syntaxes are also supported (See inline documentation).
    // (Resolved with the resource mapper to the home module's assets folder) -> Works for standalone and shell use cases
    dynamicTranslationService.registerTranslationSet('home-i18n', {
      de: {
        moduleName: 'home',
        path: 'assets/i18n/home.de.json',
      },
      en: {
        moduleName: 'home',
        path: 'assets/i18n/home.en.json',
      }}
    );
  }
}
```

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

### Environment variables

ng-dynamic-mf provides a way to specify variables in an `environment.json` file (after the app has been built). This is different from the `environment.ts` file that is used by Angular CLI, as this will be baked into the app during the build. The `environment.json` file can be edited at any time and the change will be reflected in the app after a reload.

You do not have to use the `environment.json` file, you can also keep using the `environment.ts` file. (However you will need to create an empty `environment.json` file to prevent errors).

### Global Styles

ng-dynamic-mf provides a way to load global styles into the app. This is useful for loading styles that are defined by a module but should be applied globally (no view encapsulation). To do so, you need to add a styles file (eg `global.scss`) to your module that defines the styles. Afterwards you need to adjust your modules `angular.json` file to include the styles file and bundle it separately with the name `global-styles`:

```json
{
  [...],
  "targets": {
    "build": {
      [...],
      "options": {
        [...],
        "styles": [
          "apps/example-project/src/styles.scss",
          {
            "input": "apps/example-project/src/global.scss",
            "bundleName": "global-styles"
          }
        ],
        [...]
      }
    }
  }
}
```

Note: The bundle name has to be `global-styles` for ng-dynamic-mf to recognize it.

Afterwards you can tell ng-dynamic-mf to load the styles by adding `"hasGlobalStyles": true` to this modules config in the `modules.json` file.

Note: Don't forget to disable output hashing in the `angular.json` file or make sure to rename the file after it gets created. (File name has to be `global-styles.css` in the root of the module, next to the entry point file). Alternatively you can use [nx-dynamic-mf](https://github.com/LoaderB0T/nx-dynamic-mf) which will adjust the `module.json` file automatically to the hashed file name.

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
