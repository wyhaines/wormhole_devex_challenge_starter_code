/**
 * Tests for show command
 */

const showCommand = require('../commands/show');
const configManager = require('../config-manager');
const displayUtils = require('../display-utils');

// Mock dependencies
jest.mock('../config-manager');
jest.mock('../display-utils');

describe('show command', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Default mock for formatPrivateKey
    displayUtils.formatPrivateKey.mockImplementation((key) => {
      if (key.startsWith('${')) {
        return key;
      }
      return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('handler', () => {
    it('should display message when config file does not exist', () => {
      configManager.configExists.mockReturnValue(false);
      configManager.getConfigPath.mockReturnValue('/path/to/wormhole.config.json');

      showCommand.handler({});

      expect(consoleLogSpy).toHaveBeenCalledWith('No configuration file found at /path/to/wormhole.config.json');
      expect(consoleLogSpy).toHaveBeenCalledWith('\nRun "wormhole wizard" to create a new configuration.');
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should display entire config with formatted private keys', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {
          ethereum: {
            rpc: 'https://eth-sepolia.example.com',
            privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            tokenAddress: '0x0000000000000000000000001234567890123456789012345678901234567890',
            mode: 'BURNING'
          },
          arbitrum: {
            rpc: 'https://arb-sepolia.example.com',
            privateKey: '${ARBITRUM_PRIVATE_KEY}',
            tokenAddress: '0x0000000000000000000000009876543210987654321098765432109876543210',
            mode: 'LOCKING'
          }
        },
        devnet: {}
      };

      configManager.configExists.mockReturnValue(true);
      configManager.getConfigPath.mockReturnValue('wormhole.config.json');
      configManager.readConfig.mockReturnValue(mockConfig);

      showCommand.handler({});

      expect(configManager.configExists).toHaveBeenCalled();
      expect(configManager.readConfig).toHaveBeenCalled();
      expect(displayUtils.formatPrivateKey).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      expect(displayUtils.formatPrivateKey).toHaveBeenCalledWith('${ARBITRUM_PRIVATE_KEY}');

      expect(consoleLogSpy).toHaveBeenCalledWith('Configuration from wormhole.config.json:\n');

      // Verify JSON output contains formatted keys
      const jsonOutput = consoleLogSpy.mock.calls.find(call =>
        typeof call[0] === 'string' && call[0].includes('"ethereum"')
      );
      expect(jsonOutput).toBeDefined();
      expect(jsonOutput[0]).toContain('0x12345678...cdef'); // Formatted hardcoded key (10 chars + ... + 4 chars)
      expect(jsonOutput[0]).toContain('${ARBITRUM_PRIVATE_KEY}'); // Env var kept as-is
    });

    it('should handle empty config file', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {},
        devnet: {}
      };

      configManager.configExists.mockReturnValue(true);
      configManager.getConfigPath.mockReturnValue('wormhole.config.json');
      configManager.readConfig.mockReturnValue(mockConfig);

      showCommand.handler({});

      expect(consoleLogSpy).toHaveBeenCalledWith('Configuration from wormhole.config.json:\n');
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockConfig, null, 2));
    });

    it('should handle errors gracefully', () => {
      configManager.configExists.mockReturnValue(true);
      configManager.readConfig.mockImplementation(() => {
        throw new Error('Failed to read config');
      });

      showCommand.handler({});

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Failed to read config');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should respect custom config file path', () => {
      configManager.configExists.mockReturnValue(true);
      configManager.getConfigPath.mockReturnValue('/custom/path/config.json');
      configManager.readConfig.mockReturnValue({
        mainnet: {},
        testnet: {},
        devnet: {}
      });

      showCommand.handler({});

      expect(consoleLogSpy).toHaveBeenCalledWith('Configuration from /custom/path/config.json:\n');
    });

    it('should format all private keys in multi-chain config', () => {
      const mockConfig = {
        mainnet: {
          ethereum: {
            privateKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
          },
          solana: {
            privateKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
          }
        },
        testnet: {
          base: {
            privateKey: '${BASE_KEY}'
          }
        },
        devnet: {}
      };

      configManager.configExists.mockReturnValue(true);
      configManager.getConfigPath.mockReturnValue('wormhole.config.json');
      configManager.readConfig.mockReturnValue(mockConfig);

      showCommand.handler({});

      expect(displayUtils.formatPrivateKey).toHaveBeenCalledTimes(3);
      expect(displayUtils.formatPrivateKey).toHaveBeenCalledWith('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(displayUtils.formatPrivateKey).toHaveBeenCalledWith('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
      expect(displayUtils.formatPrivateKey).toHaveBeenCalledWith('${BASE_KEY}');
    });
  });

  describe('command metadata', () => {
    it('should have correct command name', () => {
      expect(showCommand.command).toBe('show');
    });

    it('should have a description', () => {
      expect(showCommand.describe).toBeDefined();
      expect(typeof showCommand.describe).toBe('string');
    });

    it('should have a builder function', () => {
      expect(showCommand.builder).toBeDefined();
      expect(typeof showCommand.builder).toBe('function');
    });
  });
});
