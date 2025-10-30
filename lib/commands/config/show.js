/**
 * Command: wormhole config show
 * Display the current configuration
 */

const { ENVIRONMENTS, CHAINS } = require('../../constants');
const { formatPrivateKey } = require('../../display-utils');

module.exports = {
  command: 'show [chain]',
  describe: 'Display the current configuration for one or all chains in an environment. This shows the RPC endpoint, private key, token address, and deployment mode for each configured chain.',

  builder: (yargs) => {
    return yargs
      .positional('chain', {
        describe: 'The specific chain to show. If not specified, shows configuration for all configured chains.',
        type: 'string',
        choices: CHAINS
      })
      .option('env', {
        alias: 'e',
        describe: 'The environment to display configuration for.',
        type: 'string',
        choices: ENVIRONMENTS,
        default: 'testnet'
      })
      .example('$0 config show', 'Show configuration for all chains in testnet')
      .example('$0 config show ethereum --env mainnet', 'Show only Ethereum configuration in mainnet');
  },

  handler: (argv) => {
    const { getChainConfig, getEnvironmentConfig } = require('../../config-manager');

    try {
      if (argv.chain) {
        const config = getChainConfig(argv.chain, argv.env);

        if (!config) {
          console.log(`No configuration found for ${argv.chain} in ${argv.env}`);
          return;
        }

        console.log(`Configuration for ${argv.chain} (${argv.env}):\n`);
        if (config.rpc) console.log(`  RPC:          ${config.rpc}`);
        if (config.privateKey) console.log(`  Private Key:  ${formatPrivateKey(config.privateKey)}`);
        if (config.tokenAddress) console.log(`  Token:        ${config.tokenAddress}`);
        if (config.mode) console.log(`  Mode:         ${config.mode}`);

      } else {
        const envConfig = getEnvironmentConfig(argv.env);
        const configuredChains = Object.keys(envConfig);

        if (configuredChains.length === 0) {
          console.log(`No chains configured for ${argv.env}`);
          return;
        }

        console.log(`Configuration for ${argv.env}:\n`);

        configuredChains.forEach(chain => {
          console.log(`${chain}:`);
          const config = envConfig[chain];
          if (config.rpc) console.log(`  RPC:          ${config.rpc}`);
          if (config.privateKey) console.log(`  Private Key:  ${formatPrivateKey(config.privateKey)}`);
          if (config.tokenAddress) console.log(`  Token:        ${config.tokenAddress}`);
          if (config.mode) console.log(`  Mode:         ${config.mode}`);
          console.log('');
        });
      }

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};
