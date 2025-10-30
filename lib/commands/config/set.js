/**
 * Command: wormhole config set
 * Set or update configuration for a specific chain
 */

const { ENVIRONMENTS, CHAINS, MODES } = require('../../constants');
const { breakText, getTerminalWidth } = require('../../text-formatter');
const { formatPrivateKey } = require('../../display-utils');

module.exports = {
  command: 'set <chain>',
  describe: 'Set or update configuration for a specific chain. You can set the RPC endpoint, private key, token address, and deployment mode. Token addresses are automatically converted to Wormhole\'s 32-byte format. At least one option must be specified.',

  builder: (yargs) => {
    return yargs
      .positional('chain', {
        describe: 'The blockchain to configure. Supported chains: ' + CHAINS.join(', '),
        type: 'string',
        choices: CHAINS
      })
      .option('env', {
        alias: 'e',
        describe: 'The deployment environment. Use mainnet for production deployments, testnet for testing on public test networks, or devnet for local development.',
        type: 'string',
        choices: ENVIRONMENTS,
        default: 'testnet'
      })
      .option('rpc', {
        describe: 'The RPC endpoint URL for connecting to this chain. If not specified, a default public RPC endpoint will be used.',
        type: 'string'
      })
      .option('private-key', {
        describe: 'The private key for signing transactions on this chain. You can use ${ENV_VAR_NAME} syntax to reference an environment variable instead of hardcoding the key.',
        type: 'string'
      })
      .option('token', {
        describe: 'The token contract address to use on this chain. This will be automatically converted to Wormhole\'s 32-byte universal address format.',
        type: 'string'
      })
      .option('mode', {
        describe: 'The deployment mode for this chain. Use LOCKING if this is the primary chain (only one chain can be LOCKING), or BURNING for all other chains.',
        type: 'string',
        choices: MODES.map(m => m.toLowerCase())
      })
      .example('$0 config set ethereum --rpc https://eth.example.com --mode locking', 'Set Ethereum testnet with LOCKING mode and custom RPC')
      .example('$0 config set solana --env mainnet --private-key ${SOL_KEY}', 'Set Solana mainnet using an environment variable for the private key')
      .example('$0 config set arbitrum --token 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 --mode burning', 'Set Arbitrum with a token address (automatically converted to Wormhole format)');
  },

  handler: async (argv) => {
    const { updateChainConfig, getChainConfig, getConfigPath } = require('../../config-manager');
    const { convertToWormholeAddress, isValidAddressFormat } = require('../../address-converter');
    const { getDefaultRpc } = require('../../defaults');
    const columns = getTerminalWidth();

    try {
      if (!argv.rpc && !argv.privateKey && !argv.token && !argv.mode) {
        console.error('\n' + breakText('Error: You must specify at least one option to set. Available options: --rpc, --private-key, --token, --mode', columns));
        console.error(breakText('\nExample: wormhole config set ' + argv.chain + ' --mode burning --token 0xYourTokenAddress', columns));
        process.exit(1);
      }

      const existingConfig = getChainConfig(argv.chain, argv.env) || {};
      const updates = {};

      if (argv.rpc) {
        updates.rpc = argv.rpc;
      } else if (!existingConfig.rpc) {
        const defaultRpc = getDefaultRpc(argv.chain, argv.env);
        if (defaultRpc) {
          updates.rpc = defaultRpc;
        }
      }

      if (argv.privateKey) {
        updates.privateKey = argv.privateKey;
      }

      if (argv.token) {
        if (!isValidAddressFormat(argv.token, argv.chain)) {
          console.error('\n' + breakText(`Error: The token address provided is not a valid ${argv.chain} address.`, columns));
          if (argv.chain === 'solana') {
            console.error(breakText('\nSolana addresses are base58 encoded and typically 32-44 characters long.', columns));
            console.error(breakText('Example: So11111111111111111111111111111111111111112', columns));
          } else {
            console.error(breakText('\nEVM addresses must start with 0x followed by 40 hexadecimal characters.', columns));
            console.error(breakText('Example: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', columns));
          }
          process.exit(1);
        }

        const wormholeAddress = await convertToWormholeAddress(argv.token, argv.chain);
        updates.tokenAddress = wormholeAddress;
      }

      if (argv.mode) {
        updates.mode = argv.mode.toUpperCase();
      }

      updateChainConfig(argv.chain, argv.env, updates);
      console.log(`\n✓ Configuration updated for ${argv.chain} (${argv.env})\n`);

      const updatedConfig = getChainConfig(argv.chain, argv.env);
      console.log('Current configuration:');
      if (updatedConfig.rpc) console.log(`  RPC:          ${updatedConfig.rpc}`);
      if (updatedConfig.privateKey) console.log(`  Private Key:  ${formatPrivateKey(updatedConfig.privateKey)}`);
      if (updatedConfig.tokenAddress) console.log(`  Token:        ${updatedConfig.tokenAddress}`);
      if (updatedConfig.mode) console.log(`  Mode:         ${updatedConfig.mode}`);

      console.log(breakText(`\nConfiguration saved to ${getConfigPath()}`, columns));
      console.log(breakText('Run "wormhole validate" to check your configuration.', columns));

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};
