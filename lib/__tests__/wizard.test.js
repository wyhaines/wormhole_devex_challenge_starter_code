/**
 * Tests for wizard.js
 */

const inquirer = require('inquirer');

// Mock inquirer
jest.mock('inquirer');

// Mock address-converter to avoid ESM import issues
jest.mock('../address-converter', () => ({
  convertToWormholeAddress: jest.fn().mockResolvedValue('0x0000000000000000000000001234567890123456789012345678901234567890'),
  isValidAddressFormat: jest.fn((address, chain) => {
    if (chain === 'solana') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } else {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  })
}));

const {
  selectEnvironment,
  selectDeploymentStrategy,
  selectChains,
  selectLockingChain,
  configureChain
} = require('../wizard');

// Mock console.log to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn()
};

describe('wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('selectEnvironment', () => {
    it('should return pre-selected environment if valid', async () => {
      const result = await selectEnvironment('testnet');

      expect(result).toBe('testnet');
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    it('should prompt user if no pre-selection', async () => {
      inquirer.prompt.mockResolvedValue({ environment: 'mainnet' });

      const result = await selectEnvironment();

      expect(inquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'list',
            name: 'environment',
            message: 'Which environment are you configuring?'
          })
        ])
      );
      expect(result).toBe('mainnet');
    });

    it('should prompt user if pre-selection is invalid', async () => {
      inquirer.prompt.mockResolvedValue({ environment: 'testnet' });

      const result = await selectEnvironment('invalid');

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(result).toBe('testnet');
    });
  });

  describe('selectDeploymentStrategy', () => {
    it('should return deployment strategy', async () => {
      inquirer.prompt.mockResolvedValue({
        type: 'multichain',
        chainCount: 3
      });

      const result = await selectDeploymentStrategy();

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(result).toEqual({
        type: 'multichain',
        chainCount: 3
      });
    });

    it('should prompt for type and chain count', async () => {
      inquirer.prompt.mockResolvedValue({
        type: 'single',
        chainCount: 2
      });

      await selectDeploymentStrategy();

      const call = inquirer.prompt.mock.calls[0][0];
      expect(call).toHaveLength(2);
      expect(call[0].name).toBe('type');
      expect(call[1].name).toBe('chainCount');
    });
  });

  describe('selectChains', () => {
    it('should return selected chains', async () => {
      inquirer.prompt.mockResolvedValue({
        chains: ['ethereum', 'arbitrum']
      });

      const result = await selectChains(2);

      expect(result).toEqual(['ethereum', 'arbitrum']);
    });

    it('should prompt with checkbox for chain selection', async () => {
      inquirer.prompt.mockResolvedValue({
        chains: ['base', 'optimism']
      });

      await selectChains(2);

      const call = inquirer.prompt.mock.calls[0][0];
      expect(call[0].type).toBe('checkbox');
      expect(call[0].name).toBe('chains');
    });

    it('should include validation for exact count', async () => {
      inquirer.prompt.mockResolvedValue({
        chains: ['ethereum', 'arbitrum', 'base']
      });

      await selectChains(3);

      const call = inquirer.prompt.mock.calls[0][0];
      const validate = call[0].validate;

      expect(validate(['ethereum', 'arbitrum'])).toContain('exactly 3');
      expect(validate(['ethereum', 'arbitrum', 'base'])).toBe(true);
    });
  });

  describe('selectLockingChain', () => {
    it('should return only chain if only one provided', async () => {
      const result = await selectLockingChain(['ethereum']);

      expect(result).toBe('ethereum');
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    it('should prompt for selection if multiple chains', async () => {
      inquirer.prompt.mockResolvedValue({
        lockingChain: 'ethereum'
      });

      const result = await selectLockingChain(['ethereum', 'arbitrum', 'base']);

      expect(inquirer.prompt).toHaveBeenCalled();
      expect(result).toBe('ethereum');
    });

    it('should offer all chains as choices', async () => {
      inquirer.prompt.mockResolvedValue({
        lockingChain: 'optimism'
      });

      await selectLockingChain(['ethereum', 'optimism', 'base']);

      const call = inquirer.prompt.mock.calls[0][0];
      expect(call[0].choices).toHaveLength(3);
    });
  });

  describe('configureChain', () => {
    it('should configure chain with default RPC', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'default' })
        .mockResolvedValueOnce({ privateKey: '${ETH_KEY}' })
        .mockResolvedValueOnce({ token: '0x1234567890123456789012345678901234567890' });

      const result = await configureChain('ethereum', 'LOCKING', 'testnet');

      expect(result).toHaveProperty('rpc');
      expect(result).toHaveProperty('privateKey', '${ETH_KEY}');
      expect(result).toHaveProperty('mode', 'LOCKING');
      expect(result).toHaveProperty('tokenAddress');
    });

    it('should configure chain with custom RPC', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'custom' })
        .mockResolvedValueOnce({ rpc: 'https://custom-rpc.com' })
        .mockResolvedValueOnce({ privateKey: 'test-key' })
        .mockResolvedValueOnce({ token: '0x1234567890123456789012345678901234567890' });

      const result = await configureChain('ethereum', 'BURNING', 'mainnet');

      expect(result.rpc).toBe('https://custom-rpc.com');
      expect(result.mode).toBe('BURNING');
    });

    it('should validate RPC endpoint format', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'custom' })
        .mockResolvedValueOnce({ rpc: 'https://my-rpc.com' })
        .mockResolvedValueOnce({ privateKey: 'key' })
        .mockResolvedValueOnce({ token: '0x1234567890123456789012345678901234567890' });

      await configureChain('ethereum', 'LOCKING', 'testnet');

      const rpcPromptCall = inquirer.prompt.mock.calls[1][0];
      const validate = rpcPromptCall[0].validate;

      expect(validate('')).toContain('required');
      expect(validate('invalid')).toContain('http');
      expect(validate('https://valid.com')).toBe(true);
    });

    it('should validate private key is provided', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'default' })
        .mockResolvedValueOnce({ privateKey: 'my-key' })
        .mockResolvedValueOnce({ token: '0x1234567890123456789012345678901234567890' });

      await configureChain('arbitrum', 'BURNING', 'testnet');

      const keyPromptCall = inquirer.prompt.mock.calls[1][0];
      const validate = keyPromptCall[0].validate;

      expect(validate('')).toContain('required');
      expect(validate('some-key')).toBe(true);
    });

    it('should validate token address format for EVM chains', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'default' })
        .mockResolvedValueOnce({ privateKey: 'key' })
        .mockResolvedValueOnce({ token: '0x1234567890123456789012345678901234567890' });

      await configureChain('ethereum', 'LOCKING', 'testnet');

      const tokenPromptCall = inquirer.prompt.mock.calls[2][0];
      const validate = tokenPromptCall[0].validate;

      // Validate is async, so we need to await it
      await expect(validate('')).resolves.toContain('required');
      await expect(validate('invalid')).resolves.toContain('Invalid EVM address');
      await expect(validate('0x1234567890123456789012345678901234567890')).resolves.toBe(true);
    });

    it('should validate token address format for Solana', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ rpcChoice: 'default' })
        .mockResolvedValueOnce({ privateKey: 'key' })
        .mockResolvedValueOnce({ token: 'So11111111111111111111111111111111111111112' });

      await configureChain('solana', 'BURNING', 'testnet');

      const tokenPromptCall = inquirer.prompt.mock.calls[2][0];
      const validate = tokenPromptCall[0].validate;

      await expect(validate('invalid')).resolves.toContain('Invalid Solana address');
      await expect(validate('So11111111111111111111111111111111111111112')).resolves.toBe(true);
    });
  });
});
