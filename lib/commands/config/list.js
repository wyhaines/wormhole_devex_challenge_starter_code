/**
 * Command: wormhole config list
 * List all configured chains
 */

const { ENVIRONMENTS } = require('../../constants');

module.exports = {
  command: 'list',
  describe: 'List all configured chains in an environment with a quick summary of their configuration status. Shows which chains have tokens, keys, and their deployment modes.',

  builder: (yargs) => {
    return yargs
      .option('env', {
        alias: 'e',
        describe: 'The environment to list configured chains for.',
        type: 'string',
        choices: ENVIRONMENTS,
        default: 'testnet'
      })
      .example('$0 config list', 'List all configured chains in testnet with status indicators')
      .example('$0 config list --env mainnet', 'List all configured chains in mainnet');
  },

  handler: (argv) => {
    const { getEnvironmentConfig } = require('../../config-manager');

    try {
      const envConfig = getEnvironmentConfig(argv.env);
      const configuredChains = Object.keys(envConfig);

      if (configuredChains.length === 0) {
        console.log(`No chains configured for ${argv.env}`);
        return;
      }

      console.log(`Configured chains in ${argv.env}:\n`);

      configuredChains.forEach(chain => {
        const config = envConfig[chain];
        const mode = config.mode ? ` [${config.mode}]` : '';
        const hasToken = config.tokenAddress ? ' ✓ token' : '';
        const hasKey = config.privateKey ? ' ✓ key' : '';

        console.log(`  • ${chain}${mode}${hasToken}${hasKey}`);
      });

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};
