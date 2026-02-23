import { isValidExternalLink } from '../url';

describe('isValidExternalLink', () => {
  it('should return true for valid http URLs', () => {
    expect(isValidExternalLink('http://google.com')).toBe(true);
  });

  it('should return true for valid https URLs', () => {
    expect(isValidExternalLink('https://google.com')).toBe(true);
  });

  it('should return true for URLs with uppercase protocols', () => {
    expect(isValidExternalLink('HTTPS://GOOGLE.COM')).toBe(true);
  });

  it('should return true for URLs with leading/trailing whitespace', () => {
    expect(isValidExternalLink('  https://google.com  ')).toBe(true);
  });

  it('should return false for javascript: URLs', () => {
    expect(isValidExternalLink('javascript:alert(1)')).toBe(false);
  });

  it('should return false for file: URLs', () => {
    expect(isValidExternalLink('file:///etc/passwd')).toBe(false);
  });

  it('should return false for data: URLs', () => {
    expect(isValidExternalLink('data:text/html,<html>')).toBe(false);
  });

  it('should return false for other protocols like ftp:', () => {
    expect(isValidExternalLink('ftp://files.com')).toBe(false);
  });

  it('should return false for incomplete protocols', () => {
    expect(isValidExternalLink('http://')).toBe(false);
    expect(isValidExternalLink('https://')).toBe(false);
  });

  it('should return false for non-string inputs', () => {
    expect(isValidExternalLink(null)).toBe(false);
    expect(isValidExternalLink(undefined)).toBe(false);
    expect(isValidExternalLink(123)).toBe(false);
    expect(isValidExternalLink({})).toBe(false);
  });

  it('should return false for empty strings', () => {
    expect(isValidExternalLink('')).toBe(false);
    expect(isValidExternalLink('   ')).toBe(false);
  });

  it('should return false for URLs missing a protocol', () => {
    expect(isValidExternalLink('google.com')).toBe(false);
    expect(isValidExternalLink('www.google.com')).toBe(false);
  });

  it('should handle authority normalization', () => {
    // These should be valid and normalized by URL constructor
    expect(isValidExternalLink('http:google.com')).toBe(true);
    expect(isValidExternalLink('https://example.com\\attacker.com')).toBe(true);
  });
});
