/**
 * Validates if a URL is safe to open as an external link.
 * Only http and https protocols are allowed.
 *
 * @param url The URL to validate
 * @returns true if the URL is a valid external link, false otherwise
 */
export const isValidExternalLink = (url: any): boolean => {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};
