/**
 * CLI application logic for Wormhole configuration tool
 */

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { getTerminalWidth } = require('./text-formatter');
const configCommands = require('./commands/config');
const wizardCommand = require('./commands/wizard');
const validateCommand = require('./commands/validate');
const convertCommand = require('./commands/convert');
const showCommand = require('./commands/show');
const { version } = require('../package.json');

/**
 * Run the CLI application
 * @param {string[]} argv - Command line arguments (default: process.argv)
 */
function run(argv = process.argv) {
  const columns = getTerminalWidth();

  yargs(hideBin(argv))
    .scriptName('wormhole')
    .usage('$0 <command> [options]')
    .option('config', {
      alias: 'c',
      describe: 'Path to the configuration file to use instead of wormhole.config.json',
      type: 'string',
      global: true
    })
    .middleware((argv) => {
      if (argv.config) {
        const { setConfigFile } = require('./config-manager');
        setConfigFile(argv.config);
      }
    })
    .command('config', 'Manage your Wormhole multichain deployment configuration. Use this command to set up chains, specify RPC endpoints, configure private keys, set token addresses, and define deployment modes (BURNING or LOCKING).', (yargs) => {
      return yargs
        .command(configCommands.set)
        .command(configCommands.show)
        .command(configCommands.list)
        .demandCommand(1, 'Please specify a subcommand (set, show, or list)')
        .help();
    })
    .command(wizardCommand)
    .command(validateCommand)
    .command(convertCommand)
    .command(showCommand)
    .demandCommand(1, 'Please specify a command. Use --help to see available commands.')
    .help()
    .alias('help', 'h')
    .version(version)
    .alias('version', 'v')
    .epilogue('\nThis tool generates a wormhole.config.json file for multichain deployments. It does not interact with blockchains or perform any on-chain transactions.\n\nImportant: Keep your private keys secure. Consider using environment variable syntax (${VAR_NAME}) instead of hardcoding keys in the configuration file.\n\nFor more information about Wormhole, visit https://wormhole.com/docs')
    .wrap(columns)
    .parse();
}

module.exports = {
  run
};
