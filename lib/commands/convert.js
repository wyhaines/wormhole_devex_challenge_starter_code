/**
 * Command: wormhole convert
 * Convert addresses to Wormhole format
 */

const { CHAINS } = require('../constants');
const { breakText, getTerminalWidth } = require('../text-formatter');

module.exports = {
  command: 'convert <address> <chain>',
  describe: 'Convert a native blockchain address to Wormhole\'s universal 32-byte address format. This is useful for verifying how addresses will be stored in your configuration file.',

  builder: (yargs) => {
    return yargs
      .positional('address', {
        describe: 'The native address to convert (EVM addresses start with 0x, Solana addresses are base58 encoded)',
        type: 'string'
      })
      .positional('chain', {
        describe: 'The blockchain this address belongs to',
        type: 'string',
        choices: CHAINS
      })
      .example('$0 convert 0x1234567890123456789012345678901234567890 ethereum', 'Convert an Ethereum address to Wormhole format')
      .example('$0 convert So11111111111111111111111111111111111111112 solana', 'Convert a Solana address to Wormhole format');
  },

  handler: async (argv) => {
    const { convertToWormholeAddress, isValidAddressFormat } = require('../address-converter');
    const { getConfigPath } = require('../config-manager');
    const columns = getTerminalWidth();

    try {
      if (!isValidAddressFormat(argv.address, argv.chain)) {
        console.error('\n' + breakText(`Error: The address provided is not a valid ${argv.chain} address.`, columns));
        if (argv.chain === 'solana') {
          console.error(breakText('\nSolana addresses are base58 encoded and typically 32-44 characters long.', columns));
          console.error(breakText('Example: So11111111111111111111111111111111111111112', columns));
        } else {
          console.error(breakText('\nEVM addresses must start with 0x followed by 40 hexadecimal characters.', columns));
          console.error(breakText('Example: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', columns));
        }
        console.error(breakText('\nTip: Use "wormhole convert --help" for more information.', columns));
        process.exit(1);
      }

      console.log(breakText(`\nConverting ${argv.chain} address to Wormhole format...`, columns) + '\n');
      const wormholeAddress = await convertToWormholeAddress(argv.address, argv.chain);

      console.log(breakText(`Original address: ${argv.address}`, columns));
      console.log(breakText(`Wormhole format:  ${wormholeAddress}`, columns));

      console.log(breakText(`\nThis is the format that will be stored in your ${getConfigPath()} file.`, columns));
    } catch (error) {
      console.error('\n' + breakText(`Error: ${error.message}`, columns));
      console.error(breakText('\nIf this error persists, please verify that the address is correct for the specified chain.', columns));
      process.exit(1);
    }
  }
};
