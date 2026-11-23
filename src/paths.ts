export const basePath = import.meta.env.BASE_URL;
export function sitePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? `${basePath}${path.slice(1)}` : path;
}
export function routePath(pathname: string) {
  const path = basePath !== '/' && pathname.startsWith(basePath) ? `/${pathname.slice(basePath.length)}` : pathname;
  return path.replace(/\/$/, '') || '/';
}
