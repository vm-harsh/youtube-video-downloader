export function isValidYouTubeUrl(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  if (/%(?![0-9A-Fa-f]{2})/.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const supportedHosts = ['youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'];

    if (!supportedHosts.includes(host)) {
      return false;
    }

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean).length > 0;
    }

    if (url.pathname === '/watch') {
      return Boolean(url.searchParams.get('v'));
    }

    return /^\/(shorts|embed|live)\/[^/]+/.test(url.pathname);
  } catch {
    return false;
  }
}
