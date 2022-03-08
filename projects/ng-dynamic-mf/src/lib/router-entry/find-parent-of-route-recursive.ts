import { Route, Routes } from '@angular/router';

export const findParentOfRouteRecursive = (routes: Routes, path: string): Route | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }

    if (route.children) {
      const found = findParentOfRouteRecursive(route.children, path);
      if (found) {
        if (found === route) {
          throw new Error(
            "The entry point cannot be at the root of the routing configuration.\
             You don't need to use this method if you are using the entry point at the root of the routing configuration."
          );
        }
        return route;
      }
    }
  }
  return undefined;
};
