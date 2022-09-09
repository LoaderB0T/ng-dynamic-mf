import { Routes } from '@angular/router';

export const isAlreadyInConfig = (existingRoutes: Routes, routeConfig: Routes): boolean => {
  if (routeConfig.length === 0) {
    return true;
  }
  for (const route of routeConfig) {
    const existingRoute = existingRoutes.find(r => r.path === route.path);
    if (existingRoute) {
      return isAlreadyInConfig(existingRoute.children || [], route.children || []);
    }
  }
  return false;
};
