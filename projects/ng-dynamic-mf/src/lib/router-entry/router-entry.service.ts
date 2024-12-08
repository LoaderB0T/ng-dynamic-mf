import { Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';

import { findParentOfRouteRecursive } from './find-parent-of-route-recursive';
import { isAlreadyInConfig } from './is-already-in-config';

@Injectable({
  providedIn: 'root',
})
export class RouterEntryService {
  private readonly _router: Router;
  constructor(router: Router) {
    this._router = router;
  }

  public registerRoutes(routeConfig: Routes, entryPointName: string = '#module-entry-point#') {
    const hostRoutes = this._router.config;
    const outletName = entryPointName;
    const foundOutlet = findParentOfRouteRecursive(hostRoutes, outletName);
    if (!foundOutlet) {
      throw new Error(`Could not find outlet "${outletName}" in router config.`);
    }
    const duplicate = isAlreadyInConfig(foundOutlet.children!, routeConfig);
    if (duplicate) {
      return;
    }
    const indexInOutlet =
      foundOutlet.children?.findIndex(route => route.path === entryPointName) ?? 0;
    foundOutlet.children = [
      ...foundOutlet.children!.slice(0, indexInOutlet),
      ...routeConfig,
      ...foundOutlet.children!.slice(indexInOutlet),
    ];
    this._router.resetConfig(hostRoutes);
  }
}
