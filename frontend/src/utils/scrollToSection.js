import { useNavigate, useLocation } from 'react-router-dom';

export function scrollToSection(href, navigate, pathname) {
  if (pathname === '/') {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  navigate({ pathname: '/', hash: href.slice(1) });
}
