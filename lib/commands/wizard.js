/**
 * Command: wormhole wizard
 * Interactive configuration wizard
 */

const { ENVIRONMENTS } = require('../constants');
const { breakText, getTerminalWidth } = require('../text-formatter');

module.exports = {
  command: 'wizard',
  describe: 'Launch an interactive wizard to guide you through creating a complete multichain configuration. The wizard will help you select chains, configure RPC endpoints, set up private keys, specify token addresses, and assign deployment modes (LOCKING or BURNING). This is the recommended way to create your initial configuration, especially for first-time users.',

  builder: (yargs) => {
    return yargs
      .option('env', {
        alias: 'e',
        describe: 'Pre-select the environment to configure (skips environment selection step)',
        type: 'string',
        choices: ENVIRONMENTS
      })
      .example('$0 wizard', 'Launch the wizard with all steps')
      .example('$0 wizard --env testnet', 'Launch the wizard for testnet environment')
      .example('$0 wizard --env mainnet', 'Launch the wizard for mainnet deployment');
  },

  handler: async (argv) => {
    const { runWizard } = require('../wizard');
    const columns = getTerminalWidth();

    try {
      await runWizard({
        environment: argv.env
      });
    } catch (error) {
      console.error(breakText(`Error: ${error.message}`, columns));
      process.exit(1);
    }
  }
};
