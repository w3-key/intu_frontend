### What is it?

This is code that could be ran alongside our [intu_signer](https://github.com/w3-key/intu_node_signer) to allow a user to create a web3 account without needing a wallet, gas, or even knowledge that they are interacting with web3 at all.

Clone the repo, rename the .env.example file to .env, and replace the placeholder with the public addresses of your node_signers --- and add in a clerk pub key: https://clerk.com/

This is example is setup to run on the SKALE testnet, Chain Id : 974399131.

Run npm i && npm start and it should be up and running!

This dapp relies on a SKALE sFUEL distributor of mine, which may or may not be up. If you wish to setup your own SKALE sFuel distributor, see here: https://docs.skale.network/infrastructure/sfuel-api-distribution

//////

### What does it do?

The process for the user is as follows.

They just need to click on 'sign in' and sign in with an option of their choice.  
Upon signing in, we create a deterministic private key for that user based on the resultant ID from their login.  
We then fund that private key with sFuel and immediately begin intu account creation.  
The node_signers pick up the event, and begin participating in the MPC process.  
Due to the cryptography and blockchain, the process takes about 45 seconds currently.  
We propose allowing the user to fill out profile details during that time (email,name,handle,etc)
When it is complete, the user will be presented with an option to 'claim an NFT' which we are providing as an example for the user's first interaction with Web3.  
Again, the user needed no wallet, gas, or web3 knowledge to now claim their first NFT and did so in under a minute.

Email questions to dev@intu.xyz