const { convertToWormholeAddress, isValidAddressFormat } = require('../address-converter');

describe('address-converter', () => {
  describe('isValidAddressFormat', () => {
    describe('EVM addresses', () => {
      it('should accept valid Ethereum addresses', () => {
        expect(isValidAddressFormat('0x1234567890123456789012345678901234567890', 'ethereum')).toBe(true);
        expect(isValidAddressFormat('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'ethereum')).toBe(true);
      });

      it('should reject addresses without 0x prefix', () => {
        expect(isValidAddressFormat('1234567890123456789012345678901234567890', 'ethereum')).toBe(false);
      });

      it('should reject addresses with wrong length', () => {
        expect(isValidAddressFormat('0x123', 'ethereum')).toBe(false);
        expect(isValidAddressFormat('0x12345678901234567890123456789012345678901', 'ethereum')).toBe(false);
      });

      it('should reject addresses with invalid characters', () => {
        expect(isValidAddressFormat('0x123456789012345678901234567890123456789g', 'ethereum')).toBe(false);
      });

      it('should work for all EVM chains', () => {
        const validAddress = '0x1234567890123456789012345678901234567890';
        expect(isValidAddressFormat(validAddress, 'arbitrum')).toBe(true);
        expect(isValidAddressFormat(validAddress, 'optimism')).toBe(true);
        expect(isValidAddressFormat(validAddress, 'base')).toBe(true);
      });
    });

    describe('Solana addresses', () => {
      it('should accept valid Solana addresses', () => {
        expect(isValidAddressFormat('So11111111111111111111111111111111111111112', 'solana')).toBe(true);
        expect(isValidAddressFormat('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'solana')).toBe(true);
      });

      it('should reject addresses that are too short', () => {
        expect(isValidAddressFormat('So111111111111111111', 'solana')).toBe(false);
      });

      it('should reject addresses that are too long', () => {
        expect(isValidAddressFormat('So111111111111111111111111111111111111111111111111', 'solana')).toBe(false);
      });

      it('should reject addresses with invalid base58 characters', () => {
        // Base58 excludes 0, O, I, l
        expect(isValidAddressFormat('So1111111111111111111111111111111111111O', 'solana')).toBe(false);
        expect(isValidAddressFormat('So1111111111111111111111111111111111111I', 'solana')).toBe(false);
        expect(isValidAddressFormat('So1111111111111111111111111111111111111l', 'solana')).toBe(false);
      });
    });

    describe('Invalid inputs', () => {
      it('should reject null address', () => {
        expect(isValidAddressFormat(null, 'ethereum')).toBe(false);
      });

      it('should reject undefined address', () => {
        expect(isValidAddressFormat(undefined, 'ethereum')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(isValidAddressFormat('', 'ethereum')).toBe(false);
      });

      it('should reject non-string address', () => {
        expect(isValidAddressFormat(123, 'ethereum')).toBe(false);
      });
    });
  });
});
