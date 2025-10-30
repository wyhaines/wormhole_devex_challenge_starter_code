# DevEx Engineer Technical Challenge

> [!NOTE]  
> This codebase uses [yargs](https://www.npmjs.com/package/yargs). There is thorough documentation for this package, as well as detailed examples of how to use it [here](https://github.com/yargs/yargs/blob/HEAD/docs/examples.md).
> Our goal is NOT to make you stuck in dependency hell. Please ask us any questions. If there is a different library or method you prefer for building CLI tools, feel free to use that instead.

**Summary:** Build a CLI tool that outputs, and allows modifying, a config file for multichain deployments. The CLI tool should output a `wormhole.config.json` file with proper structure and validation. The CLI should be well documented and provide the right combination of commands and options that results in the best possible developer experience.

**Feature Requirements:**

- **Multi-Environment Support:** The CLI tool should support setting configs across 3 environments — Mainnet, Testnet, and Devnet
- **Multi-Chain Support:** The CLI tool should support setting options on Ethereum, Arbitrum, Optimism, Base, and Solana, with the ability to use custom RPC endpoints on each chain.
- **Private Key Configuration:** The CLI tool should allow the user to specify the private key they want to use for the deployment on each chain.
- **Token Contract Addresses:** The CLI tool should allow the user to specify the token contract address to be used on each chain. Each chain should only have 1 token address configured. These token addresses should be stored in the [Wormhole 32-byte address representation](https://wormhole.com/docs/products/reference/wormhole-formatted-addresses/).
- **Burning/Locking Modes:** On each chain, the deployment mode can be either BURNING or LOCKING. There are 2 kinds of configurations:
    - BURNING mode on all chains.
    - LOCKING mode on only 1 chain, BURNING mode on all other chains.

> [!IMPORTANT]  
> Remember, the tool should just output a config file. The tool should not interact with the blockchain to perform any on-chain transactions.
> Imagine that this tool will be used by a developer to set all of their configuration options **before** pushing anything on-chain.

**Documentation & DevEx:**

- **Documentation:** The CLI should be well documented, with a description of what it is and instructions on how to run it. A developer who is completely new to Wormhole, with a fresh environment, should be able to understand what the tool does and successfully follow the instructions to use it.
- **DevEx Enhancements:** Now that you have a working CLI, put yourself in the shoes of someone who might be using it. What other features, commands, or option flags would provide the best user experience? Are your commands structured in a way that would make sense to a completely new user? Think back to other great CLI tools you may have used in the past and use your best judgement.
