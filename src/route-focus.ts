const ROUTE_FOCUS_KEY = 'line-take-match:move-route-focus';

function navigationType() {
  return performance.getEntriesByType('navigation')[0]?.toJSON().type;
}

function addAnnouncement() {
  let announcer = document.querySelector<HTMLElement>('#route-announcement');
  if (!announcer) {
    announcer = document.createElement('p');
    announcer.id = 'route-announcement';
    announcer.className = 'visually-hidden';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.append(announcer);
  }
  return announcer;
}

export function trackInternalRoutes() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target || link.hasAttribute('download') || event.defaultPrevented) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || (destination.pathname === location.pathname && destination.search === location.search)) return;
    // Keep a marker on the page being left too. The browser restores that
    // history entry on Back, even when a full-document route is reloaded.
    history.replaceState({ ...(history.state ?? {}), lineTakeMatchRouteFocus: true }, '', location.href);
    sessionStorage.setItem(ROUTE_FOCUS_KEY, '1');
  });
}

export function shouldFocusRouteHeading() {
  const tracked = sessionStorage.getItem(ROUTE_FOCUS_KEY) === '1';
  if (tracked) sessionStorage.removeItem(ROUTE_FOCUS_KEY);
  return tracked || Boolean(history.state?.lineTakeMatchRouteFocus) || navigationType() === 'back_forward';
}

export function focusAndAnnounceRoute() {
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus();
  addAnnouncement().textContent = `${document.title}.`;
}

export function installBackRouteFocus() {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) requestAnimationFrame(focusAndAnnounceRoute);
  });
}
