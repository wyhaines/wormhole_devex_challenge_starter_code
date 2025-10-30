/**
 * Tests for defaults.js
 */

const { DEFAULT_RPCS, getDefaultRpc } = require('../defaults');

describe('defaults', () => {
  describe('DEFAULT_RPCS', () => {
    it('should have all three environments', () => {
      expect(DEFAULT_RPCS).toHaveProperty('mainnet');
      expect(DEFAULT_RPCS).toHaveProperty('testnet');
      expect(DEFAULT_RPCS).toHaveProperty('devnet');
    });

    it('should have all chains in mainnet', () => {
      expect(DEFAULT_RPCS.mainnet).toHaveProperty('ethereum');
      expect(DEFAULT_RPCS.mainnet).toHaveProperty('arbitrum');
      expect(DEFAULT_RPCS.mainnet).toHaveProperty('optimism');
      expect(DEFAULT_RPCS.mainnet).toHaveProperty('base');
      expect(DEFAULT_RPCS.mainnet).toHaveProperty('solana');
    });

    it('should have all chains in testnet', () => {
      expect(DEFAULT_RPCS.testnet).toHaveProperty('ethereum');
      expect(DEFAULT_RPCS.testnet).toHaveProperty('arbitrum');
      expect(DEFAULT_RPCS.testnet).toHaveProperty('optimism');
      expect(DEFAULT_RPCS.testnet).toHaveProperty('base');
      expect(DEFAULT_RPCS.testnet).toHaveProperty('solana');
    });

    it('should have all chains in devnet', () => {
      expect(DEFAULT_RPCS.devnet).toHaveProperty('ethereum');
      expect(DEFAULT_RPCS.devnet).toHaveProperty('arbitrum');
      expect(DEFAULT_RPCS.devnet).toHaveProperty('optimism');
      expect(DEFAULT_RPCS.devnet).toHaveProperty('base');
      expect(DEFAULT_RPCS.devnet).toHaveProperty('solana');
    });

    it('should have https URLs for mainnet chains', () => {
      expect(DEFAULT_RPCS.mainnet.ethereum).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.mainnet.arbitrum).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.mainnet.optimism).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.mainnet.base).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.mainnet.solana).toMatch(/^https:\/\//);
    });

    it('should have https URLs for testnet chains', () => {
      expect(DEFAULT_RPCS.testnet.ethereum).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.testnet.arbitrum).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.testnet.optimism).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.testnet.base).toMatch(/^https:\/\//);
      expect(DEFAULT_RPCS.testnet.solana).toMatch(/^https:\/\//);
    });

    it('should have localhost URLs for devnet chains', () => {
      expect(DEFAULT_RPCS.devnet.ethereum).toMatch(/^http:\/\/localhost/);
      expect(DEFAULT_RPCS.devnet.arbitrum).toMatch(/^http:\/\/localhost/);
      expect(DEFAULT_RPCS.devnet.optimism).toMatch(/^http:\/\/localhost/);
      expect(DEFAULT_RPCS.devnet.base).toMatch(/^http:\/\/localhost/);
      expect(DEFAULT_RPCS.devnet.solana).toMatch(/^http:\/\/localhost/);
    });
  });

  describe('getDefaultRpc', () => {
    it('should return correct RPC for valid chain and environment', () => {
      expect(getDefaultRpc('ethereum', 'mainnet')).toBe(DEFAULT_RPCS.mainnet.ethereum);
      expect(getDefaultRpc('arbitrum', 'testnet')).toBe(DEFAULT_RPCS.testnet.arbitrum);
      expect(getDefaultRpc('solana', 'devnet')).toBe(DEFAULT_RPCS.devnet.solana);
    });

    it('should return null for invalid chain', () => {
      expect(getDefaultRpc('invalid-chain', 'mainnet')).toBeNull();
    });

    it('should return null for invalid environment', () => {
      expect(getDefaultRpc('ethereum', 'invalid-env')).toBeNull();
    });

    it('should return null for both invalid', () => {
      expect(getDefaultRpc('invalid-chain', 'invalid-env')).toBeNull();
    });
  });
});
