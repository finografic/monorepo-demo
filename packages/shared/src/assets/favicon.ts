import faviconUrl from './favicon.svg';

export function setFavicon(): void {
  const existingLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const faviconLink = existingLink ?? document.createElement('link');

  faviconLink.rel = 'icon';
  faviconLink.type = 'image/svg+xml';
  faviconLink.href = faviconUrl;

  if (!existingLink) {
    document.head.append(faviconLink);
  }
}
