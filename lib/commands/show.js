/**
 * Command: wormhole show
 * Display the entire configuration file
 */

const { readConfig, configExists, getConfigPath } = require('../config-manager');
const { formatPrivateKey } = require('../display-utils');

module.exports = {
  command: 'show',
  describe: 'Display the entire configuration file. Private keys are truncated for security.',

  builder: (yargs) => {
    return yargs
      .example('$0 show', 'Display the entire wormhole.config.json file')
      .example('$0 show -c custom.json', 'Display a custom configuration file');
  },

  handler: (argv) => {
    try {
      const configPath = getConfigPath();

      if (!configExists()) {
        console.log(`No configuration file found at ${configPath}`);
        console.log('\nRun "wormhole wizard" to create a new configuration.');
        return;
      }

      const config = readConfig();

      // Deep clone and format private keys for display
      const displayConfig = formatConfigForDisplay(config);

      console.log(`Configuration from ${configPath}:\n`);
      console.log(JSON.stringify(displayConfig, null, 2));

    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
};

/**
 * Create a display-safe copy of the config with formatted private keys
 * @param {Object} config - Original configuration
 * @returns {Object} Config with formatted private keys
 */
function formatConfigForDisplay(config) {
  const display = {};

  for (const env in config) {
    display[env] = {};

    for (const chain in config[env]) {
      display[env][chain] = { ...config[env][chain] };

      // Format private key if it exists
      if (display[env][chain].privateKey) {
        display[env][chain].privateKey = formatPrivateKey(display[env][chain].privateKey);
      }
    }
  }

  return display;
}
