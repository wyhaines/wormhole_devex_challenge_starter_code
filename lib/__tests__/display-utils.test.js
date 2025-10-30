/**
 * Tests for display-utils.js
 */

const { formatPrivateKey, formatAddress } = require('../display-utils');

describe('display-utils', () => {
  describe('formatPrivateKey', () => {
    it('should preserve environment variable references', () => {
      const result = formatPrivateKey('${ETH_KEY}');
      expect(result).toBe('${ETH_KEY}');
    });

    it('should preserve full env var references with different names', () => {
      const result = formatPrivateKey('${MY_PRIVATE_KEY_123}');
      expect(result).toBe('${MY_PRIVATE_KEY_123}');
    });

    it('should truncate regular private keys', () => {
      const key = '0123456789abcdefghijklmnopqrstuvwxyz';
      const result = formatPrivateKey(key);

      expect(result).toContain('0123456789');
      expect(result).toContain('wxyz');
      expect(result).toContain('...');
      expect(result).toBe('0123456789...wxyz');
    });

    it('should show first 10 and last 4 characters', () => {
      const key = 'abcdefghij1234567890klmnop';
      const result = formatPrivateKey(key);

      expect(result).toBe('abcdefghij...mnop');
    });

    it('should handle keys exactly 14 characters', () => {
      const key = '01234567890123';
      const result = formatPrivateKey(key);

      expect(result).toBe('0123456789...0123');
    });

    it('should format partial env var syntax (no closing brace)', () => {
      const key = '${INCOMPLETE';
      const result = formatPrivateKey(key);

      // Since it starts with ${ but has no closing }, it's treated as env var
      expect(result).toBe('${INCOMPLETE');
    });
  });

  describe('formatAddress', () => {
    it('should truncate long addresses with default lengths', () => {
      const address = '0x1234567890abcdefABCDEF1234567890abcdefAB';
      const result = formatAddress(address);

      expect(result).toBe('0x12345678...efAB');
    });

    it('should use custom prefix length', () => {
      const address = '0x1234567890abcdefABCDEF1234567890abcdefAB';
      const result = formatAddress(address, 6, 4);

      expect(result).toBe('0x1234...efAB');
    });

    it('should use custom suffix length', () => {
      const address = '0x1234567890abcdefABCDEF1234567890abcdefAB';
      const result = formatAddress(address, 10, 6);

      expect(result).toBe('0x12345678...cdefAB');
    });

    it('should not truncate short addresses', () => {
      const address = '0x12345678AB';
      const result = formatAddress(address);

      expect(result).toBe('0x12345678AB');
    });

    it('should handle addresses exactly at threshold length', () => {
      const address = '0x1234567890AB';  // 12 chars = 10 prefix + 4 suffix - 2 for "..."
      const result = formatAddress(address);

      expect(result).toBe('0x1234567890AB');
    });

    it('should work with Solana addresses', () => {
      const address = 'So11111111111111111111111111111111111111112';
      const result = formatAddress(address);

      expect(result).toBe('So11111111...1112');
    });

    it('should handle Wormhole 32-byte format', () => {
      const address = '0x0000000000000000000000001234567890123456789012345678901234567890';
      const result = formatAddress(address);

      expect(result).toBe('0x00000000...7890');
    });
  });
});
