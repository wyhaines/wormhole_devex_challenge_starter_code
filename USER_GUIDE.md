# Wormhole Multichain Configuration Tool 

## What is This Tool?

If you're building a token bridge that spans multiple blockchain networks using Wormhole, you're going to need to configure a number of details about your intentions: which chains you're deploying to, how they connect to each other, where your tokens live on each chain, and which keys you'll use to sign transactions. This tool helps you manage all of that configuration in one place, generating a `wormhole.config.json` file (or any other filename that you require) that contains everything you need.

**Important:** This tool only generates configuration files. It doesn't touch the blockchain or perform any on-chain transactions. That happens later, after you've got your configuration sorted out.

## Understanding Wormhole Multichain Deployments

When you deploy a token bridge across multiple chains with, you need to make some key decisions about how your deployment will work.

### Environments: Where Are You Deploying?

You'll typically work across three different environments:

**Devnet** is for local development. If you're running blockchain nodes on your own machine for development purposes, this is the environment you'd use. It's completely isolated from the real world.

**Testnet** is where you'll spend most of your development time. It's a safe playground where you can experiment without risking real assets. This is usually where you'll start when building and testing your integration.

**Mainnet** is production. Real money, real transactions, real consequences. You'll configure this last, after everything works perfectly on testnet.

### Chains: Which Blockchains Are You Using?

This tool has built-in support five chains: Ethereum, Arbitrum, Optimism, Base, and Solana. You can configure as many or as few as you need for your deployment. Each chain needs its own configuration because each one might use different RPC endpoints, different private keys, and different token contracts. 

### Deployment Modes: LOCKING vs BURNING

When you bridge a token across multiple chains, your configuration will have to specify which chain holds the "original" tokens and which chains use wrapped versions.

**LOCKING mode** means this chain holds the original tokens. When someone bridges tokens away from this chain, the original tokens get locked up in a contract. There can only be one LOCKING chain in your deployment.

**BURNING mode** means this chain uses wrapped tokens. When someone bridges tokens away, the wrapped tokens get burned (destroyed). When tokens arrive, new wrapped tokens get minted.

Your deployment can work in two ways:

You can have all chains in BURNING mode. This is less common but valid for certain use cases.

More typically, you'll have one chain in LOCKING mode (where your original tokens live) and all other chains in BURNING mode (where wrapped versions exist). For example, if your original token is an Ethereum ERC-20, you'd set Ethereum to LOCKING and set Arbitrum, Optimism, and Base to BURNING.

### Token Addresses: A Special Format

Wormhole uses a special 32-byte address format for storing token addresses, regardless of which chain they're from. Don't worry about converting addresses manually, as this tool handles that for you automatically. When you enter a standard Ethereum address like `0x1234...` or a Solana address, the tool converts it to Wormhole's format behind the scenes.

## Getting Started

### Installation

First, you'll need Node.js installed on your machine. This tool has not currently been tested on versions of Node.js lower than 22, so if you have a lower version than that installed, we recommend that you upgrade before using the tool.

Once you have that, navigate to the directory where you've got this tool and run:

```bash
npm install
```

This installs all the dependencies the tool needs. If you want to use the `wormhole` command from anywhere on your system, you can install it globally:

```bash
npm install -g
```

Otherwise, you'll run it directly from this directory using `./wormhole` or `node wormhole`.

### Running the Tool

The simplest way to invoke the tool from within the install directory is just:

```bash
./wormhole
```

Or, if you have installed it with `npm install -g`, you should be able to run it like so:

```bash
wormhole
```

This shows you the top level command help with all of the basic commands displayed and described. Each command has its own help text, which you can see by adding `--help`:

```bash
./wormhole config --help
./wormhole wizard --help
```

## Your First Configuration: Using the Wizard

The easiest way to create your first configuration is to use the interactive wizard. It walks you through every decision step by step, asking questions and validating your answers as you go.

Start the wizard by running:

```bash
./wormhole wizard
```

The wizard will guide you through several steps:

**First, you'll choose your environment.** Starting with testnet is usually the right move. You can always come back and configure mainnet later.

**Next, you'll decide on your deployment strategy.** The wizard asks whether you're setting up a multi-chain bridge (one LOCKING chain with others BURNING) or a single-mode deployment (all BURNING). For most token bridges, you'll want the multi-chain option.

**Then you'll select which chains to configure.** Pick the blockchains where you want your token to be available. The wizard will ask you to select exactly the number of chains you specified in the previous step.

**If you're doing a multi-chain deployment, you'll choose which chain is LOCKING.** This is typically the chain where your original token already exists.

**For each chain, you'll configure the details.** The wizard asks about:

- The RPC endpoint for connecting to that chain. Default public endpoints are suggested, but you can provide your own if you have private RPC access.
- The private key you'll use for signing transactions on that chain. For security, you can reference an environment variable using syntax like `${ETH_PRIVATE_KEY}` instead of hardcoding the actual key.
- The token contract address on that chain. The wizard validates that you've entered the right format and automatically converts it to Wormhole's 32-byte format.

**Finally, you'll see a summary of your configuration.** The wizard shows you everything you've configured and validates it to make sure there are no errors. You can review it and either save it or cancel to start over.

When you're done, you'll have a `wormhole.config.json` file in your current directory with all your settings.

## Working with Configurations

Sometimes you don't need the full wizard experience. Maybe you just want to update one chain's RPC endpoint, or add a new chain to an existing configuration. That's where the `config` commands come in.

### Setting Individual Chain Options

You can set or update configuration for a specific chain using the `config set` command. This is useful when you want surgical control over individual settings.

For example, to configure Ethereum on testnet with a custom RPC and put it in LOCKING mode:

```bash
./wormhole config set ethereum --rpc https://eth.llamarpc.com --mode locking
```

To add a token address to Arbitrum:

```bash
./wormhole config set arbitrum --token 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9 --mode burning
```

The tool won't let you set just one option at a time without specifying at least one flag. This prevents accidental empty updates.

If you want to work with a different environment, add the `--env` flag:

```bash
./wormhole config set ethereum --env mainnet --private-key ${ETH_MAINNET_KEY}
```

For security, using environment variable syntax like `${VAR_NAME}` is strongly recommended for private keys. This way, your actual keys never get written to the config file—they're referenced at runtime instead.

### Viewing Your Configuration

To see what you've configured so far, use the `show` command:

```bash
./wormhole config show
```

This displays all configured chains in the current environment (testnet by default). To see a specific chain:

```bash
./wormhole config show ethereum
```

Or to see a different environment:

```bash
./wormhole config show --env mainnet
```

Private keys are automatically truncated in the display for security. You'll see the first 10 and last 4 characters, or the full environment variable reference if that's what you used.

### Listing Configured Chains

Sometimes you just want a quick overview of what's configured. The `list` command gives you a compact summary:

```bash
./wormhole config list
```

You'll see a line for each configured chain showing its mode and whether it has a token address and private key set up. This is helpful for a quick sanity check.

## Validating Your Configuration

Before you use your configuration file to actually deploy anything, you'll want to make sure everything is set up correctly. The `validate` command checks your configuration against Wormhole's requirements.

```bash
./wormhole validate
```

This checks all three environments. To validate just one:

```bash
./wormhole validate --env testnet
```

The validator checks several things:

- That all required fields are present for each chain (RPC, private key, token address, and mode)
- That your BURNING/LOCKING configuration is valid (either all BURNING, or exactly one LOCKING with the rest BURNING)
- That private keys aren't suspiciously short (which usually means you forgot to set them properly)

If there are any errors, the validator will tell you exactly what's wrong and which chains need attention. Warnings won't stop you from using the configuration, but they're worth paying attention to.

## Converting Addresses

If you're curious about how your token addresses look in Wormhole's 32-byte format, or if you want to convert an address before using it, the `convert` command is useful:

```bash
./wormhole convert 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 ethereum
```

This shows you both the original address and the converted Wormhole format. It's the same conversion that happens automatically when you set token addresses through other commands.

## Working with Multiple Configuration Files

By default, the tool uses `wormhole.config.json` in your current directory. But sometimes you might want to maintain separate configuration files—maybe one for testing and one for production, or different files for different projects.

You can specify a different config file with the `--config` flag on any command:

```bash
./wormhole --config my-project.json config show
./wormhole --config production.json validate
```

This global flag works with any command and tells the tool to use that file instead of the default.

## Common Workflows

### Starting a New Project

When you're starting completely fresh, the wizard is your friend:

```bash
./wormhole wizard
```

Choose testnet, pick your chains, configure everything in one go. You'll have a working configuration in a few minutes.

### Adding a New Chain to an Existing Deployment

Maybe you've been running on Ethereum and Arbitrum, and now you want to add Optimism. No need to run the wizard again:

```bash
./wormhole config set optimism --mode burning --token 0xYourOptimismToken --private-key ${OPT_KEY}
./wormhole validate --env testnet
```

The validate command will make sure your new chain fits properly with your existing configuration.

### Preparing for Mainnet

You've tested everything on testnet and you're ready to go to production. You could run the wizard again with `--env mainnet`, or you can set up mainnet chains individually:

```bash
./wormhole config set ethereum --env mainnet --rpc https://eth-mainnet.example.com --private-key ${ETH_MAINNET_KEY}
./wormhole config set arbitrum --env mainnet --rpc https://arb-mainnet.example.com --private-key ${ARB_MAINNET_KEY}
# ... set up other chains ...
./wormhole validate --env mainnet
```

Make absolutely sure your mainnet private keys are secure. Using environment variables is critical here.

### Updating RPC Endpoints

RPC providers come and go, or you might want to switch from public to private RPC endpoints for better reliability. Updating is straightforward:

```bash
./wormhole config set ethereum --rpc https://new-rpc-endpoint.com
./wormhole config show ethereum
```

The existing private key, token address, and mode stay untouched—you're only updating what you specify.

### Reviewing Before Deployment

Before you actually deploy your contracts and push anything on-chain, review your configuration one more time:

```bash
./wormhole validate --env mainnet
./wormhole config show --env mainnet
```

Take a moment to read through everything. Check that your modes are correct, that you're using the right RPC endpoints, and that your token addresses match what you expect. Once you start deploying, changing things becomes more complicated.

## Security Considerations

Your configuration file contains sensitive information, especially if you've hardcoded private keys. Here are some things to keep in mind:

**Never commit your config file to version control** if it contains actual private keys. Add `wormhole.config.json` to your `.gitignore` file. If you must version your config, use environment variable syntax exclusively for keys.

**Use environment variables for production.** The `${VARIABLE_NAME}` syntax is there for a reason. Set your actual keys as environment variables on the machine where you'll run deployments, and reference them in your config:

```bash
export ETH_MAINNET_KEY="your-actual-private-key-here"
./wormhole config set ethereum --env mainnet --private-key ${ETH_MAINNET_KEY}
```

**Different keys for different environments.** Your testnet keys should be completely separate from your mainnet keys. Never use a mainnet key on testnet, even for testing.

**Backup your configuration.** Once you've got everything set up, especially for mainnet, make a backup of your config file and store it securely. Losing your configuration means redoing all this work.

## Troubleshooting

### "Please specify at least one option to set"

You ran `config set` but didn't include any flags like `--rpc`, `--private-key`, `--token`, or `--mode`. The tool needs you to tell it what to set. Add at least one option:

```bash
./wormhole config set ethereum --mode locking
```

### "Invalid configuration: X chains have LOCKING mode"

You've set more than one chain to LOCKING mode, which isn't allowed. Only one chain can be LOCKING; all others must be BURNING. Review your configuration:

```bash
./wormhole config show
```

Find which chains are LOCKING and change all but one to BURNING.

### "The token address provided is not a valid..."

The address you entered doesn't match the expected format for that chain. Ethereum addresses should start with `0x` and be followed by 40 hexadecimal characters. Solana addresses are base58 encoded and typically 32-44 characters long. Double-check the address and try again.

### "No configuration found for X in Y"

You tried to show or update a chain that hasn't been configured yet. Either you misspelled the chain name, or you need to configure it first:

```bash
./wormhole config set ethereum --mode locking --token 0x...
```

### Private keys look wrong in the display

If your private key shows up as something like `abcdefghij...1234` instead of your environment variable syntax, it means the actual key got stored in the config instead of the variable reference. This is fine for testing but not ideal for production. Update it to use environment variable syntax:

```bash
./wormhole config set ethereum --private-key ${ETH_KEY}
```

### Terminal looks weird or wrapped oddly

The tool tries to detect your terminal width automatically and format output to fit. If something looks off, your terminal might be reporting an unusual width. The tool defaults to 80 columns if it can't detect the width, which should work in most cases.

## Getting Help

Every command has detailed help text built in. Add `--help` to any command to see all available options and examples:

```bash
./wormhole --help
./wormhole config --help
./wormhole config set --help
./wormhole wizard --help
```

The help text includes practical examples you can copy and modify for your own use.

## What's in the Configuration File?

The `wormhole.config.json` file that this tool generates is structured with three top-level keys: `mainnet`, `testnet`, and `devnet`. Under each environment, you'll find objects for each chain you've configured, containing their RPC endpoints, private keys, token addresses (in Wormhole's 32-byte format), and deployment modes.

Here's a simplified example of what it might look like:

```json
{
  "testnet": {
    "ethereum": {
      "rpc": "https://ethereum-sepolia-rpc.publicnode.com",
      "privateKey": "${ETH_TESTNET_KEY}",
      "tokenAddress": "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "mode": "LOCKING"
    },
    "arbitrum": {
      "rpc": "https://arbitrum-sepolia-rpc.publicnode.com",
      "privateKey": "${ARB_TESTNET_KEY}",
      "tokenAddress": "0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      "mode": "BURNING"
    }
  },
  "mainnet": {},
  "devnet": {}
}
```

You can edit this file by hand if you prefer, but using the CLI helps ensure the format is correct and the addresses are properly converted.

## Next Steps

Once you've got your configuration file set up and validated, you're ready to move on to the actual deployment process. The configuration file you've created here will be used by your deployment scripts to know which chains to deploy to, how to connect to them, and how to set up the token bridge contracts.

The [EXAMPLES.md](EXAMPLES.md) file also contains some other usage examples that may be helpful if you want to see other common patterns of usage.

Remember: this tool only creates the configuration. The actual on-chain deployment is a separate step that you'll handle with other tools or scripts. Keep your configuration file safe and secure, especially the mainnet version, as it contains everything needed to execute your multichain deployment.
