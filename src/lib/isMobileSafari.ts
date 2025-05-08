export function isMobileSafari() {
  const ua = window.navigator.userAgent;
  return (
    /iP(ad|hone|od)/.test(ua) &&
    /WebKit/.test(ua) &&
    !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
  );
}
