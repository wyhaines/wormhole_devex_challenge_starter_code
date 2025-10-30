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

        console.log('\n' + breakText(`Validating ${argv.env} configuration...`, columns) + '\n');

        if (result.warnings.length > 0) {
          console.log(breakText('Warnings:', columns));
          result.warnings.forEach(warning => {
            console.log(breakText(`  ⚠ ${warning}`, columns));
          });
          console.log('');
        }

        if (result.errors.length > 0) {
          console.log(breakText('Errors:', columns));
          result.errors.forEach(error => {
            console.log(breakText(`  ✗ ${error}`, columns));
          });
          console.log('');
          console.log(breakText(`Validation failed for ${argv.env}. Please fix the errors above.`, columns));
          process.exit(1);
        }

        if (result.warnings.length === 0) {
          console.log(breakText(`✓ ${argv.env} configuration is valid`, columns));
        } else {
          console.log(breakText(`✓ ${argv.env} configuration is valid (with warnings)`, columns));
        }
      } else {
        const validation = validateConfig(config);

        console.log('\n' + breakText('Validating all environments...', columns) + '\n');

        let hasWarnings = false;
        let hasErrors = false;

        ['mainnet', 'testnet', 'devnet'].forEach(env => {
          const result = validation.results[env];

          console.log(breakText(`${env}:`, columns));

          if (result.warnings.length > 0) {
            hasWarnings = true;
            result.warnings.forEach(warning => {
              console.log(breakText(`  ⚠ ${warning}`, columns));
            });
          }

          if (result.errors.length > 0) {
            hasErrors = true;
            result.errors.forEach(error => {
              console.log(breakText(`  ✗ ${error}`, columns));
            });
          }

          if (result.errors.length === 0 && result.warnings.length === 0) {
            const chains = Object.keys(config[env] || {});
            if (chains.length > 0) {
              console.log(breakText(`  ✓ Valid`, columns));
            } else {
              console.log(breakText(`  (not configured)`, columns));
            }
          }

          console.log('');
        });

        if (hasErrors) {
          console.log(breakText('Validation failed. Please fix the errors above.', columns));
          process.exit(1);
        }

        if (hasWarnings) {
          console.log(breakText('✓ Configuration is valid (with warnings)', columns));
        } else {
          console.log(breakText('✓ All configurations are valid', columns));
        }
      }

    } catch (error) {
      console.error(breakText(`Error: ${error.message}`, columns));
      process.exit(1);
    }
  }
};
