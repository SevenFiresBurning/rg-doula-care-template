import { renderToString } from 'react-dom/server';
import App from './App';
export { renderHead, sitemap } from './seo';
export { themeVariables } from './theme';
export { routes, site } from './config';
export function render(path: string) { return renderToString(<App path={path}/>); }
