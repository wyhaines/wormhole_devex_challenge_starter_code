/**
 * Command: wormhole config show
 * Display the current configuration
 */

const { ENVIRONMENTS, CHAINS } = require('../../constants');
const { formatPrivateKey } = require('../../display-utils');
const { breakText, getTerminalWidth } = require('../../text-formatter');

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
    const columns = getTerminalWidth();

    try {
      if (argv.chain) {
        const config = getChainConfig(argv.chain, argv.env);

        if (!config) {
          console.log(breakText(`No configuration found for ${argv.chain} in ${argv.env}`, columns));
          return;
        }

        console.log(breakText(`Configuration for ${argv.chain} (${argv.env}):`, columns) + '\n');
        if (config.rpc) console.log(breakText(`  RPC:          ${config.rpc}`, columns));
        if (config.privateKey) console.log(breakText(`  Private Key:  ${formatPrivateKey(config.privateKey)}`, columns));
        if (config.tokenAddress) console.log(breakText(`  Token:        ${config.tokenAddress}`, columns));
        if (config.mode) console.log(breakText(`  Mode:         ${config.mode}`, columns));

      } else {
        const envConfig = getEnvironmentConfig(argv.env);
        const configuredChains = Object.keys(envConfig);

        if (configuredChains.length === 0) {
          console.log(breakText(`No chains configured for ${argv.env}`, columns));
          return;
        }

        console.log(breakText(`Configuration for ${argv.env}:`, columns) + '\n');

        configuredChains.forEach(chain => {
          console.log(breakText(`${chain}:`, columns));
          const config = envConfig[chain];
          if (config.rpc) console.log(breakText(`  RPC:          ${config.rpc}`, columns));
          if (config.privateKey) console.log(breakText(`  Private Key:  ${formatPrivateKey(config.privateKey)}`, columns));
          if (config.tokenAddress) console.log(breakText(`  Token:        ${config.tokenAddress}`, columns));
          if (config.mode) console.log(breakText(`  Mode:         ${config.mode}`, columns));
          console.log('');
        });
      }

    } catch (error) {
      console.error(breakText(`Error: ${error.message}`, columns));
      process.exit(1);
    }
  }
};
