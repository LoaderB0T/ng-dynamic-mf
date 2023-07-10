export function join(...paths: string[]): string {
  return paths.map(p => normalizePath(p)).join('/');
}

export function normalizePath(path: string): string {
  const r = path.replace(/\/+/g, '/');
  r.replace(/\/$/, '');
  r.replace(/^\//, '');
  return r;
}
