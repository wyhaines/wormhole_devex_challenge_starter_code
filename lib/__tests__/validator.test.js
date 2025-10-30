/**
 * Tests for validator.js
 */

const { validateEnvironmentConfig, validateConfig } = require('../validator');

describe('validator', () => {
  describe('validateEnvironmentConfig', () => {
    it('should pass for empty environment', () => {
      const result = validateEnvironmentConfig({}, 'testnet');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('No chains configured');
    });

    it('should pass for all BURNING chains', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'BURNING'
        },
        arbitrum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'BURNING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass for one LOCKING and rest BURNING', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'LOCKING'
        },
        arbitrum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'BURNING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for multiple LOCKING chains', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'LOCKING'
        },
        arbitrum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'LOCKING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('2 chains have LOCKING mode');
    });

    it('should fail for missing required fields', () => {
      const envConfig = {
        ethereum: {
          mode: 'BURNING'
          // Missing rpc, privateKey, tokenAddress
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('missing required fields');
      expect(result.errors[0]).toContain('rpc');
      expect(result.errors[0]).toContain('privateKey');
      expect(result.errors[0]).toContain('tokenAddress');
    });

    it('should fail for invalid mode', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'INVALID'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('invalid mode');
    });

    it('should warn about short private keys', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: 'short',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'BURNING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('suspiciously short private key');
    });

    it('should not warn about environment variable keys', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${MY_KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'BURNING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      const keyWarnings = result.warnings.filter(w => w.includes('private key'));
      expect(keyWarnings).toHaveLength(0);
    });

    it('should warn when only LOCKING chain and no BURNING chains', () => {
      const envConfig = {
        ethereum: {
          rpc: 'https://test.com',
          privateKey: '${KEY}',
          tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
          mode: 'LOCKING'
        }
      };

      const result = validateEnvironmentConfig(envConfig, 'testnet');

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Only one chain'))).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should validate all environments', () => {
      const config = {
        mainnet: {},
        testnet: {
          ethereum: {
            rpc: 'https://test.com',
            privateKey: '${KEY}',
            tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            mode: 'BURNING'
          }
        },
        devnet: {}
      };

      const result = validateConfig(config);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('results');
      expect(result.results).toHaveProperty('mainnet');
      expect(result.results).toHaveProperty('testnet');
      expect(result.results).toHaveProperty('devnet');
    });

    it('should be valid when all environments are valid', () => {
      const config = {
        mainnet: {},
        testnet: {
          ethereum: {
            rpc: 'https://test.com',
            privateKey: '${KEY}',
            tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            mode: 'BURNING'
          }
        },
        devnet: {}
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
    });

    it('should be invalid when any environment is invalid', () => {
      const config = {
        mainnet: {},
        testnet: {
          ethereum: {
            rpc: 'https://test.com',
            privateKey: '${KEY}',
            tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            mode: 'LOCKING'
          },
          arbitrum: {
            rpc: 'https://test.com',
            privateKey: '${KEY}',
            tokenAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            mode: 'LOCKING'  // Invalid: two LOCKING chains
          }
        },
        devnet: {}
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.results.testnet.valid).toBe(false);
    });
  });
});
