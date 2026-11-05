import { matchPath } from 'react-router';
import { paths, REDIRECT_PARAM } from '@/app/navigation';

/** Any origin works as long as it is only used to resolve and compare. */
const RESOLVE_BASE = 'http://kanbot.invalid';
const MAX_REDIRECT_LENGTH = 2048;
const AUTH_PATHS: readonly string[] = [paths.login, paths.register];

/**
 * True when the router would render a guest-only page or the root redirect for this path.
 * Uses the router's own matcher on the decoded path, so `/login/`, `/LOGIN` and `/%6Cogin`
 * are caught too. Sending a signed-in user there would bounce between the two guards.
 */
function isGuestOrRootPath(pathname: string): boolean {
  const decoded = decodeURIComponent(pathname);
  return [...AUTH_PATHS, paths.root].some(
    (path) => matchPath({ path, end: true }, decoded) !== null,
  );
}

/**
 * Returns a safe in-app path to go to after logging in, or the projects page.
 * Rejects absolute URLs, `//host`, `/\host` (browsers treat `\` as `/`) and the
 * login/register pages themselves (that would loop between the two guards).
 */
export function safeRedirect(raw: string | null | undefined): string {
  if (typeof raw !== 'string' || raw === '' || raw.length > MAX_REDIRECT_LENGTH) {
    return paths.projects;
  }
  if (!raw.startsWith('/')) return paths.projects;

  let url: URL;
  try {
    url = new URL(raw, RESOLVE_BASE);
  } catch {
    return paths.projects;
  }
  if (url.origin !== RESOLVE_BASE) return paths.projects;
  try {
    if (isGuestOrRootPath(url.pathname)) return paths.projects;
  } catch {
    // Malformed percent-encoding: not a path the app can render.
    return paths.projects;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

type LocationParts = { pathname: string; search: string; hash: string };

/** `/login?redirect=<current page>`. After a logout the user did not "ask" for the page, so no redirect. */
export function buildLoginPath(
  location: LocationParts,
  { isLogout }: { isLogout: boolean },
): string {
  if (isLogout) return paths.login;
  const target = `${location.pathname}${location.search}${location.hash}`;
  return `${paths.login}?${REDIRECT_PARAM}=${encodeURIComponent(target)}`;
}
