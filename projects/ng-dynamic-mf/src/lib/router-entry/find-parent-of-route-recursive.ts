import { Route, Routes } from '@angular/router';

export const findParentOfRouteRecursive = (routes: Routes, path: string, level = 0): Route | undefined => {
  const value = findParentOfRouteRecursiveImpl(routes, path, level);
  if (value === true) {
    return undefined;
  }
  return value;
};

export const findParentOfRouteRecursiveImpl = (routes: Routes, path: string, level = 0): Route | true | undefined => {
  for (const route of routes) {
    if (route.path === path) {
      if (level === 0) {
        throw new Error(
          'The entry point cannot be at the root of the routing configuration.' +
            "You don't need to use this method if you are using the entry point at the root of the routing configuration."
        );
      }
      return true;
    }

    if (route.children) {
      const found = findParentOfRouteRecursiveImpl(route.children, path, level + 1);
      if (found === true) {
        return route;
      } else if (found) {
        return found;
      }
    }
  }
  return undefined;
};
