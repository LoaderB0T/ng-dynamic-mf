import { Route, Routes } from '@angular/router';

export const findParentOfRouteRecursive = (routes: Routes, path: string, level = 0): Route | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      if (level === 0) {
        throw new Error(
          "The entry point cannot be at the root of the routing configuration.\
           You don't need to use this method if you are using the entry point at the root of the routing configuration."
        );
      }
      return route;
    }

    if (route.children) {
      const found = findParentOfRouteRecursive(route.children, path, level + 1);
      if (found) {
        return route;
      }
    }
  }
  return undefined;
};
