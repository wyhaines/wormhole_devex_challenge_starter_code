/**
 * Configuration file manager for wormhole.config.json
 */

const fs = require('fs');
const path = require('path');

let CONFIG_FILE = 'wormhole.config.json';

/**
 * @param {string} filename - Custom config file name or path
 */
function setConfigFile(filename) {
  CONFIG_FILE = filename;
}

/**
 * @returns {string} Absolute path to config file
 */
function getConfigPath() {
  if (path.isAbsolute(CONFIG_FILE)) {
    return CONFIG_FILE;
  }
  return path.join(process.cwd(), CONFIG_FILE);
}

/**
 * @returns {boolean}
 */
function configExists() {
  return fs.existsSync(getConfigPath());
}

/**
 * @returns {Object} Configuration object
 */
function readConfig() {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    // Return empty config structure if file doesn't exist
    return {
      mainnet: {},
      testnet: {},
      devnet: {}
    };
  }

  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read config file: ${error.message}`);
  }
}

/**
 * @param {Object} config - Configuration object to write
 */
function writeConfig(config) {
  const configPath = getConfigPath();

  try {
    // Ensure the config has all three environments
    const fullConfig = {
      mainnet: config.mainnet || {},
      testnet: config.testnet || {},
      devnet: config.devnet || {}
    };

    fs.writeFileSync(configPath, JSON.stringify(fullConfig, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write config file: ${error.message}`);
  }
}

/**
 * @param {string} environment - Environment name (mainnet, testnet, devnet)
 * @returns {Object} Environment configuration
 */
function getEnvironmentConfig(environment) {
  const config = readConfig();
  return config[environment] || {};
}

/**
 * @param {string} chain - Chain name
 * @param {string} environment - Environment name
 * @returns {Object|null} Chain configuration or null if not found
 */
function getChainConfig(chain, environment) {
  const envConfig = getEnvironmentConfig(environment);
  return envConfig[chain] || null;
}

/**
 * @param {string} chain - Chain name
 * @param {string} environment - Environment name
 * @param {Object} chainConfig - Chain configuration
 */
function setChainConfig(chain, environment, chainConfig) {
  const config = readConfig();

  // Ensure environment exists
  if (!config[environment]) {
    config[environment] = {};
  }

  // Set or update chain config
  config[environment][chain] = chainConfig;

  writeConfig(config);
}

/**
 * @param {string} chain - Chain name
 * @param {string} environment - Environment name
 * @param {Object} updates - Fields to update
 */
function updateChainConfig(chain, environment, updates) {
  const config = readConfig();

  // Ensure environment exists
  if (!config[environment]) {
    config[environment] = {};
  }

  // Ensure chain exists
  if (!config[environment][chain]) {
    config[environment][chain] = {};
  }

  // Update fields
  config[environment][chain] = {
    ...config[environment][chain],
    ...updates
  };

  writeConfig(config);
}

module.exports = {
  setConfigFile,
  getConfigPath,
  configExists,
  readConfig,
  writeConfig,
  getEnvironmentConfig,
  getChainConfig,
  setChainConfig,
  updateChainConfig
};
