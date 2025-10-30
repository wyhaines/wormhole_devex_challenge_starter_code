/**
 * Tests for text-formatter.js
 */

const { breakText, getTerminalWidth } = require('../text-formatter');

describe('text-formatter', () => {
  describe('breakText', () => {
    it('should return original text if maxLineLength is 0', () => {
      const text = 'This is a test';
      expect(breakText(text, 0)).toBe(text);
    });

    it('should return original text if maxLineLength is negative', () => {
      const text = 'This is a test';
      expect(breakText(text, -1)).toBe(text);
    });

    it('should break long text into multiple lines', () => {
      const text = 'This is a very long line that should be broken into multiple lines';
      const result = breakText(text, 20);
      const lines = result.split('\n');

      expect(lines.length).toBeGreaterThan(1);
      lines.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(20);
      });
    });

    it('should respect word boundaries when possible', () => {
      const text = 'This is a test of word boundaries';
      const result = breakText(text, 15);

      // Should not split words unnecessarily
      expect(result).not.toContain('boun-\ndaries');
    });

    it('should handle empty string', () => {
      expect(breakText('', 60)).toBe('');
    });

    it('should handle single word shorter than max length', () => {
      expect(breakText('test', 60)).toBe('test');
    });

    it('should preserve existing line breaks', () => {
      const text = 'Line one\nLine two';
      const result = breakText(text, 60);

      expect(result).toContain('\n');
    });

    it('should use default max length of 60 when not specified', () => {
      const longText = 'a'.repeat(100);
      const result = breakText(longText);
      const lines = result.split('\n');

      expect(lines.length).toBeGreaterThan(1);
    });

    it('should handle very long words by hyphenating', () => {
      const longWord = 'x'.repeat(100);
      const result = breakText(longWord, 30);

      // Should contain hyphens from word breaking
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('getTerminalWidth', () => {
    it('should return a number', () => {
      const width = getTerminalWidth();

      // Could be undefined if not in a terminal
      if (width !== undefined) {
        expect(typeof width).toBe('number');
        expect(width).toBeGreaterThan(0);
      }
    });
  });
});
