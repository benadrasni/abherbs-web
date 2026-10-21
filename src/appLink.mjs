export const IOS_APP_ID = '1449982118';

// Smart App Banner content. A species URL is handed to the app as the
// argument so Open lands on that species. Every other page just opens the app.
export function appleSmartBanner(canonicalUrl) {
  const url = String(canonicalUrl || '');
  if (!/\/plant\/[^/?#]/.test(url)) return `app-id=${IOS_APP_ID}`;
  return `app-id=${IOS_APP_ID}, app-argument=${url}`;
}
