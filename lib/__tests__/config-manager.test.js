/**
 * Tests for config-manager.js
 */

const fs = require('fs');
const path = require('path');

// Mock the fs module
jest.mock('fs');

const {
  setConfigFile,
  getConfigPath,
  configExists,
  readConfig,
  writeConfig,
  getEnvironmentConfig,
  getChainConfig,
  setChainConfig,
  updateChainConfig
} = require('../config-manager');

describe('config-manager', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset to default config file
    setConfigFile('wormhole.config.json');
  });

  describe('setConfigFile', () => {
    it('should change the config file path', () => {
      setConfigFile('custom-config.json');
      const configPath = getConfigPath();

      expect(configPath).toContain('custom-config.json');
    });

    it('should handle absolute paths', () => {
      const absolutePath = '/tmp/custom-config.json';
      setConfigFile(absolutePath);
      const configPath = getConfigPath();

      expect(configPath).toBe(absolutePath);
    });
  });

  describe('getConfigPath', () => {
    it('should return absolute path with cwd for relative paths', () => {
      const configPath = getConfigPath();

      expect(path.isAbsolute(configPath)).toBe(true);
      expect(configPath).toContain('wormhole.config.json');
    });

    it('should return absolute path as-is', () => {
      const absolutePath = '/tmp/config.json';
      setConfigFile(absolutePath);
      const configPath = getConfigPath();

      expect(configPath).toBe(absolutePath);
    });
  });

  describe('configExists', () => {
    it('should return true when file exists', () => {
      fs.existsSync.mockReturnValue(true);

      expect(configExists()).toBe(true);
    });

    it('should return false when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(configExists()).toBe(false);
    });
  });

  describe('readConfig', () => {
    it('should return empty config structure when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const config = readConfig();

      expect(config).toEqual({
        mainnet: {},
        testnet: {},
        devnet: {}
      });
    });

    it('should parse and return config when file exists', () => {
      const mockConfig = {
        mainnet: { ethereum: { rpc: 'test' } },
        testnet: {},
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const config = readConfig();

      expect(config).toEqual(mockConfig);
    });

    it('should throw error when JSON is invalid', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      expect(() => readConfig()).toThrow();
    });
  });

  describe('writeConfig', () => {
    it('should write config with all three environments', () => {
      const config = {
        mainnet: { ethereum: { rpc: 'test' } },
        testnet: {},
        devnet: {}
      };

      writeConfig(config);

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData).toHaveProperty('mainnet');
      expect(parsedData).toHaveProperty('testnet');
      expect(parsedData).toHaveProperty('devnet');
    });

    it('should add missing environments', () => {
      const config = {
        mainnet: { ethereum: { rpc: 'test' } }
      };

      writeConfig(config);

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData).toHaveProperty('mainnet');
      expect(parsedData).toHaveProperty('testnet');
      expect(parsedData).toHaveProperty('devnet');
    });

    it('should write formatted JSON with 2-space indentation', () => {
      const config = {
        mainnet: {},
        testnet: {},
        devnet: {}
      };

      writeConfig(config);

      const writtenData = fs.writeFileSync.mock.calls[0][1];

      // Check that it's formatted (contains newlines and spaces)
      expect(writtenData).toContain('\n');
      expect(writtenData).toContain('  ');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return environment config when it exists', () => {
      const mockConfig = {
        mainnet: { ethereum: { rpc: 'test' } },
        testnet: {},
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const envConfig = getEnvironmentConfig('mainnet');

      expect(envConfig).toEqual({ ethereum: { rpc: 'test' } });
    });

    it('should return empty object when environment does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const envConfig = getEnvironmentConfig('mainnet');

      expect(envConfig).toEqual({});
    });
  });

  describe('getChainConfig', () => {
    it('should return chain config when it exists', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {
          ethereum: { rpc: 'test', mode: 'BURNING' }
        },
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const chainConfig = getChainConfig('ethereum', 'testnet');

      expect(chainConfig).toEqual({ rpc: 'test', mode: 'BURNING' });
    });

    it('should return null when chain does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const chainConfig = getChainConfig('ethereum', 'testnet');

      expect(chainConfig).toBeNull();
    });
  });

  describe('setChainConfig', () => {
    it('should create environment if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      setChainConfig('ethereum', 'testnet', { rpc: 'test' });

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet).toHaveProperty('ethereum');
    });

    it('should set chain config', () => {
      fs.existsSync.mockReturnValue(false);

      const chainConfig = { rpc: 'test', mode: 'BURNING' };
      setChainConfig('ethereum', 'testnet', chainConfig);

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet.ethereum).toEqual(chainConfig);
    });

    it('should overwrite existing chain config', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {
          ethereum: { rpc: 'old', mode: 'LOCKING' }
        },
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      const newConfig = { rpc: 'new', mode: 'BURNING' };
      setChainConfig('ethereum', 'testnet', newConfig);

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet.ethereum).toEqual(newConfig);
    });
  });

  describe('updateChainConfig', () => {
    it('should create chain if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      updateChainConfig('ethereum', 'testnet', { rpc: 'test' });

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet.ethereum).toEqual({ rpc: 'test' });
    });

    it('should merge updates with existing config', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {
          ethereum: { rpc: 'old', mode: 'LOCKING' }
        },
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      updateChainConfig('ethereum', 'testnet', { rpc: 'new' });

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet.ethereum).toEqual({ rpc: 'new', mode: 'LOCKING' });
    });

    it('should add new fields without removing existing ones', () => {
      const mockConfig = {
        mainnet: {},
        testnet: {
          ethereum: { rpc: 'test' }
        },
        devnet: {}
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));

      updateChainConfig('ethereum', 'testnet', { mode: 'BURNING', privateKey: '${KEY}' });

      const writtenData = fs.writeFileSync.mock.calls[0][1];
      const parsedData = JSON.parse(writtenData);

      expect(parsedData.testnet.ethereum).toEqual({
        rpc: 'test',
        mode: 'BURNING',
        privateKey: '${KEY}'
      });
    });
  });
});
