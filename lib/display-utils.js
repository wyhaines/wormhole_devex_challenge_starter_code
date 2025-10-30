/**
 * Display formatting utilities for terminal output
 */

/**
 * Format a private key for safe display
 * Shows full key if it's an environment variable reference,
 * otherwise truncates to first 10 and last 4 characters
 * @param {string} key - Private key to format
 * @returns {string} Formatted key safe for display
 */
function formatPrivateKey(key) {
  if (key.startsWith('${')) {
    return key;
  }
  return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
}

/**
 * Format a long address by truncating the middle
 * @param {string} address - Address to format
 * @param {number} prefixLen - Number of characters to show at start (default: 10)
 * @param {number} suffixLen - Number of characters to show at end (default: 4)
 * @returns {string} Formatted address
 */
function formatAddress(address, prefixLen = 10, suffixLen = 4) {
  if (address.length <= prefixLen + suffixLen) {
    return address;
  }
  return `${address.substring(0, prefixLen)}...${address.substring(address.length - suffixLen)}`;
}

module.exports = {
  formatPrivateKey,
  formatAddress
};
