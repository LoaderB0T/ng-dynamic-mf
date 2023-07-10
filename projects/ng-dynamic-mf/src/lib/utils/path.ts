export function join(...paths: string[]): string {
  return paths.map(p => normalizePath(p)).join('/');
}

export function normalizePath(path: string): string {
  const r = path.replace(/(?<!:)\/+/g, '/'); // replace every occurence of slashes except the one after the protocol (eg http:// or https://)
  r.replace(/\/$/, '');
  r.replace(/^\//, '');
  return r;
}
