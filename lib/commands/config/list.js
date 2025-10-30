/**
 * Command: wormhole config list
 * List all configured chains
 */

const { ENVIRONMENTS } = require('../../constants');
const { breakText, getTerminalWidth } = require('../../text-formatter');

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
    const columns = getTerminalWidth();

    try {
      const envConfig = getEnvironmentConfig(argv.env);
      const configuredChains = Object.keys(envConfig);

      if (configuredChains.length === 0) {
        console.log(breakText(`No chains configured for ${argv.env}`, columns));
        return;
      }

      console.log(breakText(`Configured chains in ${argv.env}:`, columns) + '\n');

      configuredChains.forEach(chain => {
        const config = envConfig[chain];
        const mode = config.mode ? ` [${config.mode}]` : '';
        const hasToken = config.tokenAddress ? ' ✓ token' : '';
        const hasKey = config.privateKey ? ' ✓ key' : '';

        console.log(breakText(`  • ${chain}${mode}${hasToken}${hasKey}`, columns));
      });

    } catch (error) {
      console.error(breakText(`Error: ${error.message}`, columns));
      process.exit(1);
    }
  }
};
