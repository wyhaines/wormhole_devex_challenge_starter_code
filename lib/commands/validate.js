/**
 * Command: wormhole validate
 * Validate configuration
 */

const { ENVIRONMENTS } = require('../constants');
const { breakText, getTerminalWidth } = require('../text-formatter');

module.exports = {
  command: 'validate',
  describe: 'Validate your configuration to ensure it meets Wormhole deployment requirements. This checks that deployment modes are correctly set (either all BURNING, or exactly one LOCKING with the rest BURNING) and that all required fields are present.',

  builder: (yargs) => {
    return yargs
      .option('env', {
        alias: 'e',
        describe: 'The environment to validate. If not specified, validates all environments.',
        type: 'string',
        choices: ENVIRONMENTS
      })
      .example('$0 validate', 'Validate all environments')
      .example('$0 validate --env testnet', 'Validate only the testnet configuration')
      .example('$0 validate --env mainnet', 'Validate the mainnet configuration before deployment');
  },

  handler: (argv) => {
    const { readConfig } = require('../config-manager');
    const { validateConfig, validateEnvironmentConfig } = require('../validator');
    const columns = getTerminalWidth();

    try {
      const config = readConfig();

      if (argv.env) {
        const envConfig = config[argv.env] || {};
        const result = validateEnvironmentConfig(envConfig, argv.env);

        console.log(`\nValidating ${argv.env} configuration...\n`);

        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach(warning => {
            console.log(`  ⚠ ${warning}`);
          });
          console.log('');
        }

        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(error => {
            console.log(`  ✗ ${error}`);
          });
          console.log('');
          console.log(breakText(`Validation failed for ${argv.env}. Please fix the errors above.`, columns));
          process.exit(1);
        }

        if (result.warnings.length === 0) {
          console.log(`✓ ${argv.env} configuration is valid`);
        } else {
          console.log(`✓ ${argv.env} configuration is valid (with warnings)`);
        }
      } else {
        const validation = validateConfig(config);

        console.log('\nValidating all environments...\n');

        let hasWarnings = false;
        let hasErrors = false;

        ['mainnet', 'testnet', 'devnet'].forEach(env => {
          const result = validation.results[env];

          console.log(`${env}:`);

          if (result.warnings.length > 0) {
            hasWarnings = true;
            result.warnings.forEach(warning => {
              console.log(`  ⚠ ${warning}`);
            });
          }

          if (result.errors.length > 0) {
            hasErrors = true;
            result.errors.forEach(error => {
              console.log(`  ✗ ${error}`);
            });
          }

          if (result.errors.length === 0 && result.warnings.length === 0) {
            const chains = Object.keys(config[env] || {});
            if (chains.length > 0) {
              console.log(`  ✓ Valid`);
            } else {
              console.log(`  (not configured)`);
            }
          }

          console.log('');
        });

        if (hasErrors) {
          console.log(breakText('Validation failed. Please fix the errors above.', columns));
          process.exit(1);
        }

        if (hasWarnings) {
          console.log('✓ Configuration is valid (with warnings)');
        } else {
          console.log('✓ All configurations are valid');
        }
      }

    } catch (error) {
      console.error(breakText(`Error: ${error.message}`, columns));
      process.exit(1);
    }
  }
};
