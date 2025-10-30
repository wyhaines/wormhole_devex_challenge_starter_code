/**
 * Interactive wizard for configuring Wormhole multichain deployments
 */

const inquirer = require('inquirer');
const { ENVIRONMENTS, CHAINS, MODES } = require('./constants');
const { getDefaultRpc } = require('./defaults');
const { convertToWormholeAddress, isValidAddressFormat } = require('./address-converter');
const { validateEnvironmentConfig } = require('./validator');
const { writeConfig, readConfig, getEnvironmentConfig } = require('./config-manager');
const { formatPrivateKey, formatAddress } = require('./display-utils');

/**
 * Run the configuration wizard
 * @param {Object} options - Wizard options
 * @param {string} options.environment - Pre-selected environment (optional)
 * @returns {Promise<void>}
 */
async function runWizard(options = {}) {
  console.log('\n🧙 Welcome to the Wormhole Multichain Configuration Wizard!\n');

  try {
    // Step 1: Environment selection
    const environment = await selectEnvironment(options.environment);

    // Step 2: Deployment strategy
    const strategy = await selectDeploymentStrategy();

    // Step 3: Chain selection
    const selectedChains = await selectChains(strategy.chainCount);

    // Step 4: Determine LOCKING chain (if applicable)
    let lockingChain = null;
    if (strategy.type === 'multichain') {
      lockingChain = await selectLockingChain(selectedChains);
    }

    // Step 5: Configure each chain
    const chainConfigs = await configureChains(selectedChains, lockingChain, environment);

    // Step 6: Show summary and confirm
    const confirmed = await showSummaryAndConfirm(environment, chainConfigs);

    if (!confirmed) {
      console.log('\n❌ Configuration cancelled.\n');
      return;
    }

    // Step 7: Save configuration
    await saveConfiguration(environment, chainConfigs);

    // Step 8: Show next steps
    showNextSteps(environment, chainConfigs);

  } catch (error) {
    if (error.isTtyError) {
      console.error('\n❌ Error: Your terminal does not support interactive prompts.');
      console.error('Please use the direct configuration commands instead: wormhole config set --help\n');
    } else if (error.message === 'User force closed the prompt') {
      console.log('\n\n❌ Configuration cancelled.\n');
    } else {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
    process.exit(1);
  }
}

/**
 * Select the target environment
 */
async function selectEnvironment(preSelected) {
  if (preSelected && ENVIRONMENTS.includes(preSelected)) {
    console.log(`Environment: ${preSelected}\n`);
    return preSelected;
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'Which environment are you configuring?',
      choices: [
        { name: 'Testnet (recommended for development)', value: 'testnet' },
        { name: 'Mainnet (production deployments)', value: 'mainnet' },
        { name: 'Devnet (local development)', value: 'devnet' }
      ],
      default: 'testnet'
    }
  ]);

  console.log('');
  return answers.environment;
}

/**
 * Select deployment strategy
 */
async function selectDeploymentStrategy() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'What type of deployment are you setting up?',
      choices: [
        { name: 'Multi-chain bridge (1 LOCKING chain, others BURNING)', value: 'multichain' },
        { name: 'Single mode deployment (all chains BURNING)', value: 'single' }
      ],
      default: 'multichain'
    },
    {
      type: 'number',
      name: 'chainCount',
      message: 'How many chains do you want to configure?',
      default: 2,
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 1 || num > 5) {
          return 'Please enter a number between 1 and 5';
        }
        if (num === 1) {
          return 'A multichain deployment requires at least 2 chains. Please enter 2 or more, or choose single mode deployment.';
        }
        return true;
      }
    }
  ]);

  console.log('');
  return answers;
}

/**
 * Select chains to configure
 */
async function selectChains(count) {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'chains',
      message: `Select ${count} chain(s) to configure:`,
      choices: CHAINS.map(chain => ({
        name: chain.charAt(0).toUpperCase() + chain.slice(1),
        value: chain
      })),
      validate: (input) => {
        if (input.length !== count) {
          return `Please select exactly ${count} chain(s)`;
        }
        return true;
      }
    }
  ]);

  console.log('');
  return answers.chains;
}

/**
 * Select which chain will use LOCKING mode
 */
async function selectLockingChain(chains) {
  if (chains.length === 1) {
    return chains[0];
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'lockingChain',
      message: 'Which chain will hold the original tokens (LOCKING mode)?',
      choices: chains.map(chain => ({
        name: chain.charAt(0).toUpperCase() + chain.slice(1),
        value: chain
      })),
      suffix: '\n  The other chain(s) will use BURNING mode for wrapped tokens.'
    }
  ]);

  console.log('');
  return answers.lockingChain;
}

/**
 * Configure each chain interactively
 */
async function configureChains(chains, lockingChain, environment) {
  const configs = {};

  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    const mode = lockingChain === chain ? 'LOCKING' : 'BURNING';
    const chainDisplay = chain.charAt(0).toUpperCase() + chain.slice(1);

    console.log(`\nConfiguring: ${chainDisplay} (${mode}) [${i + 1}/${chains.length}]`);
    console.log('━'.repeat(50));

    configs[chain] = await configureChain(chain, mode, environment);
  }

  console.log('');
  return configs;
}

/**
 * Configure a single chain
 */
async function configureChain(chain, mode, environment) {
  const defaultRpc = getDefaultRpc(chain, environment);
  const config = { mode };

  // RPC endpoint
  const rpcAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'rpcChoice',
      message: `RPC Endpoint (default: ${defaultRpc})`,
      choices: [
        { name: 'Use default', value: 'default' },
        { name: 'Custom RPC endpoint', value: 'custom' }
      ],
      default: 'default'
    }
  ]);

  if (rpcAnswer.rpcChoice === 'default') {
    config.rpc = defaultRpc;
  } else {
    const customRpc = await inquirer.prompt([
      {
        type: 'input',
        name: 'rpc',
        message: 'Enter custom RPC endpoint:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'RPC endpoint is required';
          }
          if (!input.startsWith('http://') && !input.startsWith('https://')) {
            return 'RPC endpoint must start with http:// or https://';
          }
          return true;
        }
      }
    ]);
    config.rpc = customRpc.rpc;
  }

  // Private key
  console.log('\n  ⚠ Security tip: Use environment variable syntax for production');
  console.log('  Example: ${OPTIMISM_PRIVATE_KEY}\n');

  const keyAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'privateKey',
      message: 'Private Key (required for transactions):',
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Private key is required';
        }
        return true;
      }
    }
  ]);
  config.privateKey = keyAnswer.privateKey;

  // Token address
  const tokenAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: 'Token contract address:',
      validate: async (input) => {
        if (!input || input.trim() === '') {
          return 'Token address is required';
        }

        if (!isValidAddressFormat(input, chain)) {
          if (chain === 'solana') {
            return 'Invalid Solana address. Must be base58 encoded, 32-44 characters.';
          } else {
            return 'Invalid EVM address. Must start with 0x followed by 40 hex characters.';
          }
        }

        return true;
      }
    }
  ]);

  console.log('  ⟳ Converting to Wormhole format...');
  config.tokenAddress = await convertToWormholeAddress(tokenAnswer.token, chain);
  console.log(`  ✓ Converted: ${formatAddress(config.tokenAddress)}`);

  return config;
}

/**
 * Show configuration summary and get confirmation
 */
async function showSummaryAndConfirm(environment, chainConfigs) {
  console.log('\n');
  console.log('Configuration Summary');
  console.log('━'.repeat(50));
  console.log(`\nEnvironment: ${environment}\n`);
  console.log('Chains:');

  Object.entries(chainConfigs).forEach(([chain, config]) => {
    const chainDisplay = chain.charAt(0).toUpperCase() + chain.slice(1);

    console.log(`  • ${chainDisplay} [${config.mode}]`);
    console.log(`    RPC:   ${config.rpc}`);
    console.log(`    Key:   ${formatPrivateKey(config.privateKey)}`);
    console.log(`    Token: ${formatAddress(config.tokenAddress)}`);
    console.log('');
  });

  const validation = validateEnvironmentConfig(chainConfigs, environment);

  if (validation.errors.length > 0) {
    console.log('❌ Configuration has errors:\n');
    validation.errors.forEach(error => {
      console.log(`   ✗ ${error}`);
    });
    console.log('\nPlease run the wizard again to fix these issues.\n');
    return false;
  }

  if (validation.warnings.length > 0) {
    console.log('⚠ Warnings:\n');
    validation.warnings.forEach(warning => {
      console.log(`   ⚠ ${warning}`);
    });
    console.log('');
  } else {
    console.log('✓ Configuration is valid\n');
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirm',
      message: 'Save this configuration?',
      choices: [
        { name: 'Yes, save and exit', value: true },
        { name: 'Cancel', value: false }
      ],
      default: true
    }
  ]);

  return answers.confirm;
}

/**
 * Save the configuration to file
 */
async function saveConfiguration(environment, chainConfigs) {
  const config = readConfig();
  config[environment] = chainConfigs;
  writeConfig(config);

  const { getConfigPath } = require('./config-manager');
  console.log(`\n✓ Configuration saved to ${getConfigPath()}\n`);
}

/**
 * Show next steps to the user
 */
function showNextSteps(environment, chainConfigs) {
  console.log('Next steps:\n');

  // Show environment variable setup
  const envVars = Object.entries(chainConfigs)
    .filter(([_, config]) => config.privateKey.startsWith('${'))
    .map(([_, config]) => config.privateKey.slice(2, -1));

  if (envVars.length > 0) {
    console.log('  1. Set your environment variables:');
    envVars.forEach(varName => {
      console.log(`     export ${varName}="your-private-key"`);
    });
    console.log('');
  }

  const step = envVars.length > 0 ? 2 : 1;

  console.log(`  ${step}. Verify your configuration:`);
  console.log(`     wormhole validate --env ${environment}`);
  console.log('');

  console.log(`  ${step + 1}. View your configuration anytime:`);
  console.log('     wormhole config show');
  console.log('');
}

module.exports = {
  runWizard,
  // Export for testing
  selectEnvironment,
  selectDeploymentStrategy,
  selectChains,
  selectLockingChain,
  configureChain,
  showSummaryAndConfirm
};
