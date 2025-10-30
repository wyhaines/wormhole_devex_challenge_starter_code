# Wormhole Configuration Tool - Examples

This document shows real-world examples of using the Wormhole configuration tool. All command outputs shown here are actual results from running the tool.

## Getting Started: Your First Commands

### Viewing Available Commands

Let's start by seeing what the tool can do:

```bash
$ ./wormhole --help
```

```
wormhole <command> [options]

Commands:
  wormhole config                     Manage your Wormhole multichain deployment configuration. Use this command to set
                                      up chains, specify RPC endpoints, configure private keys, set token addresses, and
                                      define deployment modes (BURNING or LOCKING).
  wormhole wizard                     Launch an interactive wizard to guide you through creating a complete multichain
                                      configuration. The wizard will help you select chains, configure RPC endpoints, set
                                      up private keys, specify token addresses, and assign deployment modes (LOCKING or
                                      BURNING). This is the recommended way to create your initial configuration,
                                      especially for first-time users.
  wormhole validate                   Validate your configuration to ensure it meets Wormhole deployment requirements.
                                      This checks that deployment modes are correctly set (either all BURNING, or exactly
                                      one LOCKING with the rest BURNING) and that all required fields are present.
  wormhole convert <address> <chain>  Convert a native blockchain address to Wormhole's universal 32-byte address format.
                                      This is useful for verifying how addresses will be stored in your configuration
                                      file.
  wormhole show                       Display the entire configuration file. Private keys are truncated for security.

Options:
  -c, --config   Path to the configuration file to use instead of wormhole.config.json                           [string]
  -h, --help     Show help                                                                                      [boolean]
  -v, --version  Show version number                                                                            [boolean]


This tool generates a wormhole.config.json file for multichain deployments. It does not interact with blockchains or
perform any on-chain transactions.

Important: Keep your private keys secure. Consider using environment variable syntax (${VAR_NAME}) instead of hardcoding
keys in the configuration file.

For more information about Wormhole, visit https://wormhole.com/docs
```

## Example 1: Setting Up Your First Chain (Ethereum)

Let's configure Ethereum as our LOCKING chain. We'll use the USDC token address as an example and reference our private key from an environment variable for security:

```bash
$ ./wormhole config set ethereum --mode locking --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --private-key '${ETH_KEY}'
```

```
✓ Configuration updated for ethereum (testnet)

Current configuration:
  RPC:          https://ethereum-sepolia-rpc.publicnode.com
  Private Key:  ${ETH_KEY}
  Token:        0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  Mode:         LOCKING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
Run "wormhole validate" to check your configuration.
```

Notice a few things:
- The tool automatically selected a default RPC endpoint for Ethereum Sepolia (testnet)
- Our token address was converted to Wormhole's 32-byte format (see how it's now padded with zeros?)
- The private key is stored as `${ETH_KEY}` - a reference to an environment variable, not the actual key

## Example 2: Adding a Second Chain (Arbitrum)

Now let's add Arbitrum in BURNING mode. We'll use a USDT token address:

```bash
$ ./wormhole config set arbitrum --mode burning --token 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 --private-key '${ARB_KEY}'
```

```
✓ Configuration updated for arbitrum (testnet)

Current configuration:
  RPC:          https://arbitrum-sepolia-rpc.publicnode.com
  Private Key:  ${ARB_KEY}
  Token:        0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
  Mode:         BURNING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
Run "wormhole validate" to check your configuration.
```

Again, the tool automatically selected the appropriate testnet RPC endpoint for Arbitrum Sepolia.

## Example 3: Viewing Configured Chains (List)

Let's see a quick overview of what we've configured so far:

```bash
$ ./wormhole config list
```

```
Configured chains in testnet:

  • ethereum [LOCKING] ✓ token ✓ key
  • arbitrum [BURNING] ✓ token ✓ key
```

This gives us a nice quick view - we can see both chains have tokens and keys configured, and we can see their modes at a glance.

## Example 4: Viewing Full Configuration (Show All)

For more details, let's look at the complete configuration:

```bash
$ ./wormhole config show
```

```
Configuration for testnet:

ethereum:
  RPC:          https://ethereum-sepolia-rpc.publicnode.com
  Private Key:  ${ETH_KEY}
  Token:        0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  Mode:         LOCKING

arbitrum:
  RPC:          https://arbitrum-sepolia-rpc.publicnode.com
  Private Key:  ${ARB_KEY}
  Token:        0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9
  Mode:         BURNING
```

Now we see all the details for both chains.

## Example 5: Viewing a Single Chain Configuration

If you only want to see one specific chain:

```bash
$ ./wormhole config show ethereum
```

```
Configuration for ethereum (testnet):

  RPC:          https://ethereum-sepolia-rpc.publicnode.com
  Private Key:  ${ETH_KEY}
  Token:        0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  Mode:         LOCKING
```

This is useful when you just want to check one chain quickly.

## Example 6: Validating Your Configuration

Before using your configuration to deploy, validate that everything is set up correctly:

```bash
$ ./wormhole validate --env testnet
```

```
Validating testnet configuration...

✓ testnet configuration is valid
```

Perfect! Our configuration passes all validation checks.

## Example 7: Converting an Address to Wormhole Format

Curious about how address conversion works? You can convert any address to see what it looks like in Wormhole's 32-byte format:

```bash
$ ./wormhole convert 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 ethereum
```

```
Converting ethereum address to Wormhole format...

Original address: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
Wormhole format:  0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

This is the format that will be stored in your
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
file.
```

Notice how the Ethereum address (20 bytes) gets padded with zeros to create a 32-byte address. This is the format Wormhole uses internally.

## Example 8: Adding a Solana Chain

Let's add Solana to show how it handles a different address format. Solana uses base58-encoded addresses:

```bash
$ ./wormhole config set solana --mode burning --token So11111111111111111111111111111111111111112 --private-key '${SOL_KEY}'
```

```
✓ Configuration updated for solana (testnet)

Current configuration:
  RPC:          https://api.testnet.solana.com
  Private Key:  ${SOL_KEY}
  Token:        0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001
  Mode:         BURNING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
Run "wormhole validate" to check your configuration.
```

The Solana address was also converted to the 32-byte format, but notice it looks quite different from the Ethereum addresses - that's because the conversion process is different for Solana's base58 encoding.

## Example 9: Updating Just the RPC Endpoint

Sometimes you need to change just one thing. Let's update Ethereum's RPC endpoint to use a different provider:

```bash
$ ./wormhole config set ethereum --rpc https://eth.llamarpc.com
```

```
✓ Configuration updated for ethereum (testnet)

Current configuration:
  RPC:          https://eth.llamarpc.com
  Private Key:  ${ETH_KEY}
  Token:        0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  Mode:         LOCKING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
Run "wormhole validate" to check your configuration.
```

Notice that only the RPC changed - the private key, token, and mode all stayed the same. You only update what you specify.

## Example 10: Using a Custom Configuration File

By default, the tool uses `wormhole.config.json`, but you can work with different config files:

```bash
$ ./wormhole --config examples-test.json config set base --mode burning --token 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 --private-key '${BASE_KEY}'
```

```
✓ Configuration updated for base (testnet)

Current configuration:
  RPC:          https://sepolia.base.org
  Private Key:  ${BASE_KEY}
  Token:        0x000000000000000000000000833589fcd6edb6e08f4c7c32d4f71b54bda02913
  Mode:         BURNING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/examples-test.json
Run "wormhole validate" to check your configuration.
```

This created a separate `examples-test.json` file instead of using the default. This is useful for maintaining multiple configurations or for testing.

## Example 11: What the Configuration File Looks Like

After running the commands above, here's what our `wormhole.config.json` file actually contains:

```json
{
  "mainnet": {},
  "testnet": {
    "ethereum": {
      "rpc": "https://eth.llamarpc.com",
      "privateKey": "${ETH_KEY}",
      "tokenAddress": "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "mode": "LOCKING"
    },
    "arbitrum": {
      "rpc": "https://arbitrum-sepolia-rpc.publicnode.com",
      "privateKey": "${ARB_KEY}",
      "tokenAddress": "0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      "mode": "BURNING"
    },
    "solana": {
      "rpc": "https://api.testnet.solana.com",
      "privateKey": "${SOL_KEY}",
      "tokenAddress": "0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001",
      "mode": "BURNING"
    }
  },
  "devnet": {}
}
```

You can see:
- Three top-level environments: mainnet, testnet, and devnet
- Our testnet configuration has three chains configured
- All token addresses are in Wormhole's 32-byte format
- Private keys are stored as environment variable references
- One chain is LOCKING, the others are BURNING

## Example 12: Error Handling - Missing Options

The tool helps you avoid mistakes. Here's what happens if you try to run a set command without specifying what to set:

```bash
$ ./wormhole config set optimism
```

```
Error: You must specify at least one option to set. Available options: --rpc,
--private-key, --token, --mode

Example: wormhole config set optimism --mode burning --token 0xYourTokenAddress
```

The tool tells you exactly what went wrong and shows you an example of the correct usage.

## Example 13: Configuring Mainnet

When you're ready to move to production, you can configure mainnet using the `--env` flag. Let's set up Ethereum for mainnet:

```bash
$ ./wormhole config set ethereum --env mainnet --mode locking --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --private-key '${ETH_MAINNET_KEY}' --rpc https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

```
✓ Configuration updated for ethereum (mainnet)

Current configuration:
  RPC:          https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
  Private Key:  ${ETH_MAINNET_KEY}
  Token:        0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  Mode:         LOCKING

Configuration saved to
/media/wyhaines/home/wyhaines/wormhole-cli/devex-challenge-starter-code/wormhole.config.json
Run "wormhole validate" to check your configuration.
```

Notice we used a custom RPC URL this time (Alchemy) and a different environment variable for the mainnet private key. Always use separate keys for mainnet!

## Example 14: Validating All Environments

You can validate your entire configuration across all environments at once:

```bash
$ ./wormhole validate
```

```
Validating all environments...

mainnet:
  ⚠ Only one chain configured with LOCKING mode. Consider adding BURNING chains for a multichain deployment.

testnet:
  ✓ Valid

devnet:
  ⚠ No chains configured for devnet

✓ Configuration is valid (with warnings)
```

The validator checks all three environments and gives you feedback on each. Warnings don't stop you from using the configuration, but they're worth paying attention to. In this case:
- Mainnet only has one chain (might want to add more)
- Testnet is fully configured and valid
- Devnet has nothing configured yet

## Common Workflows

### Workflow 1: Setting Up a Simple Two-Chain Bridge

Let's walk through setting up a simple bridge between Ethereum (LOCKING) and Arbitrum (BURNING):

```bash
# Configure Ethereum as the LOCKING chain
./wormhole config set ethereum --mode locking \
  --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \
  --private-key '${ETH_KEY}'

# Configure Arbitrum as a BURNING chain
./wormhole config set arbitrum --mode burning \
  --token 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 \
  --private-key '${ARB_KEY}'

# Validate the configuration
./wormhole validate --env testnet

# Review what we've set up
./wormhole config show
```

### Workflow 2: Moving from Testnet to Mainnet

Once you've tested everything on testnet:

```bash
# Set up mainnet Ethereum with a private RPC provider
./wormhole config set ethereum --env mainnet \
  --mode locking \
  --token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \
  --private-key '${ETH_MAINNET_KEY}' \
  --rpc https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Set up mainnet Arbitrum
./wormhole config set arbitrum --env mainnet \
  --mode burning \
  --token 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 \
  --private-key '${ARB_MAINNET_KEY}' \
  --rpc https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Triple-check mainnet configuration before deployment
./wormhole validate --env mainnet
./wormhole config show --env mainnet
```

### Workflow 3: Adding a New Chain to Existing Deployment

If you need to expand to a new chain:

```bash
# Check current configuration
./wormhole config list

# Add the new chain in BURNING mode
./wormhole config set optimism --mode burning \
  --token 0x1234567890123456789012345678901234567890 \
  --private-key '${OPT_KEY}'

# Validate that it fits with existing chains
./wormhole validate --env testnet

# Verify everything looks good
./wormhole config show
```

## Tips and Best Practices

**Use Environment Variables for Keys**

Always reference keys via environment variables in your config:
```bash
export ETH_KEY="0x1234..."
./wormhole config set ethereum --private-key '${ETH_KEY}'
```

**Validate Early and Often**

Run validation after making changes:
```bash
./wormhole validate --env testnet
```

**Use Custom Config Files for Different Projects**

Keep separate configurations:
```bash
./wormhole --config project-a.json config set ethereum ...
./wormhole --config project-b.json config set ethereum ...
```

**Review Before Production**

Before deploying to mainnet, review everything:
```bash
./wormhole config show --env mainnet
./wormhole validate --env mainnet
```

## Next Steps

Once you have your configuration file set up and validated, you're ready to use it with your deployment scripts. The configuration file you've created contains all the information needed to deploy your token bridge across multiple chains.

For more detailed information about using the tool, see the [USER_GUIDE.md](USER_GUIDE.md).
