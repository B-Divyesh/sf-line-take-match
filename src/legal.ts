import './legal.css';
import { focusAndAnnounceRoute, installBackRouteFocus, shouldFocusRouteHeading, trackInternalRoutes } from './route-focus';

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  history.replaceState(null, '', `${location.pathname}#main`);
  document.querySelector<HTMLElement>('#main')?.focus();
});

trackInternalRoutes();
installBackRouteFocus();
if (shouldFocusRouteHeading()) requestAnimationFrame(focusAndAnnounceRoute);
