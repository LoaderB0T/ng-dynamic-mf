import { Route, Routes } from '@angular/router';

export const findParentOfRouteRecursive = (routes: Routes, path: string): Route | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }

    if (route.children) {
      const found = findParentOfRouteRecursive(route.children, path);
      if (found) {
        return route;
      }
    }
  }
  return undefined;
};
