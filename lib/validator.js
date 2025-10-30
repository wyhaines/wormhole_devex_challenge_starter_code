/**
 * Configuration validation utilities
 */

/**
 * @param {Object} envConfig - Environment configuration object
 * @param {string} environment - Environment name (for error messages)
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
function validateEnvironmentConfig(envConfig, environment) {
  const errors = [];
  const warnings = [];
  const chains = Object.keys(envConfig);

  if (chains.length === 0) {
    warnings.push(`No chains configured for ${environment}`);
    return { valid: true, errors, warnings };
  }

  let lockingCount = 0;
  let burningCount = 0;
  let missingModeChains = [];
  let lockingChains = [];

  chains.forEach(chain => {
    const config = envConfig[chain];

    const missingFields = [];
    if (!config.rpc) missingFields.push('rpc');
    if (!config.privateKey) missingFields.push('privateKey');
    if (!config.tokenAddress) missingFields.push('tokenAddress');
    if (!config.mode) {
      missingFields.push('mode');
      missingModeChains.push(chain);
    }

    if (missingFields.length > 0) {
      errors.push(`Chain "${chain}" is missing required fields: ${missingFields.join(', ')}`);
    }

    if (config.mode === 'LOCKING') {
      lockingCount++;
      lockingChains.push(chain);
    } else if (config.mode === 'BURNING') {
      burningCount++;
    } else if (config.mode) {
      errors.push(`Chain "${chain}" has invalid mode: ${config.mode}. Must be LOCKING or BURNING`);
    }

    if (config.privateKey) {
      const isEnvVar = config.privateKey.startsWith('${') && config.privateKey.endsWith('}');

      if (!isEnvVar && config.privateKey.length < 32) {
        warnings.push(`Chain "${chain}" has a suspiciously short private key. Consider using environment variable syntax: \${VAR_NAME}`);
      }
    }
  });

  if (lockingCount === 0 && burningCount > 0) {
    // All BURNING is valid
  } else if (lockingCount === 1) {
    // Exactly one LOCKING is valid
    if (burningCount === 0) {
      warnings.push('Only one chain configured with LOCKING mode. Consider adding BURNING chains for a multichain deployment.');
    }
  } else if (lockingCount > 1) {
    errors.push(`Invalid configuration: ${lockingCount} chains have LOCKING mode (${lockingChains.join(', ')}). Only one chain can have LOCKING mode, all others must be BURNING.`);
  }

  if (missingModeChains.length > 0 && (lockingCount > 0 || burningCount > 0)) {
    errors.push(`Some chains are missing mode configuration: ${missingModeChains.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * @param {Object} config - Full configuration object
 * @returns {Object} { valid: boolean, results: { mainnet: {...}, testnet: {...}, devnet: {...} } }
 */
function validateConfig(config) {
  const results = {};
  const environments = ['mainnet', 'testnet', 'devnet'];
  let allValid = true;

  environments.forEach(env => {
    const envConfig = config[env] || {};
    const validation = validateEnvironmentConfig(envConfig, env);
    results[env] = validation;

    if (!validation.valid) {
      allValid = false;
    }
  });

  return {
    valid: allValid,
    results
  };
}

module.exports = {
  validateEnvironmentConfig,
  validateConfig
};
