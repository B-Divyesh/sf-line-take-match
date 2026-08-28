import './legal.css';

document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  history.replaceState(null, '', `${location.pathname}#main`);
  document.querySelector<HTMLElement>('#main')?.focus();
});
