<p align="center">
<img src="Door_INTU_Grad_Trans.png" alt="drawing" width="400" style="margin:0 auto; display:block;"/>
</p>

# :computer: Interface Example
A basic decentralized application in JavaScript to provide an "invisible" on-chain account creation experience for end-users. 

## :tada: What is it?

This is code that can be ran alongside our [Automated Co-Signer](https://github.com/w3-key/intu_node_signer). 

It allows an end-user to create a on-chain account for your dApp without needing a wallet or gas. The goal is to get your user into your dApp seamlessly, without realizing they're even on-chain.

## :rocket: Getting Started
1. Clone the repo
2. Rename the .env.example file to .env, 
3. Replace the placeholder with the public addresses of your node_signers  
4. Add in a clerk pub key: https://clerk.com/
   
```Note: you can use any Web2/Cloud-based service to log-in users```

6. Run npm i && npm start and it should be up and running!

This dapp relies on a SKALE sFUEL distributor of mine, which may or may not be up. If you wish to setup your own SKALE sFuel distributor, see here: 

### :alien: Why SKALE?
This example is set to run on the SKALE Testnet. Any EVM network can be supported.
```
Chain ID : 974399131
```
SKALE is an ideal network for creating and using INTU accounts: 
- Gasless
- Near instant finality
- Built on/for Ethereum

**INTU accounts created and utilized on SKALE can be used form transactions for any EVM-compatible chain.**  
SKALE is used for participant communication and data storage, and the completed transaction can be broadcast to any EVM-compatible chain.
 
This application uses a SKALE Testnet sFUEL distributor run by INTU, which may not be always available. 

If you wish to set up your own sFuel distributor, more information can be found [here](https://docs.skale.network/infrastructure/sfuel-api-distribution).

## What does this application actually do?
1. The end-user clicks on "Sign In" with any of the available options.
2. Once signed in, the INTU SDK creates and manages a Web3 Account (ECDSA Keypair) associated with that method of user authentication.
3. This Web3 Account is funded with sFUEL for use with SKALE.
4. The INTU SDK automatically begins the account creation process
5. **Automatated Co-Signers** pick up the event, and support the account creation process using multi-party computation.
```
Note: Automated Co-signers are not maintained by INTU. 
These can be maintained and operated by your application, and can be deployed to a variety of cloud-based services.
```
6. During Decentralized Account Generation, we recommend end-users to provide any additional profile details, such as e-mail, name, handle, etc. This process can last up to 45 seconds, depending on blockchain speed and the end-users device.
7. Once complete, the end-user can carry out **any** on-chain operation. This particular example includes "Claim NFT" as their first Web3 interaction.
  
:tada: Congratulations! Using nothing more than an e-mail address, you've successfully brought your end-user on-chain! No gas, no wallet, no seed phrase required! 

## :fire: How is this different than other solutions?
- The account is dynamic! Evolve your end-user to full self-custody, removing or reduce dependence on Automated Co-signers
- Using Automated Co-signers allows your application to enforce KYC, protect against bots and spam, or enforce other application-specific policies, while keeping end-user account authority
- Broad compatibility with most on-chain applications and blockchain networks
- INTU provides technology, not a service! Build the account solution directly into your product.

### Questions? 
:email: <dev@intu.xyz> :email:
discord: 🏮 [_https://discord.gg/sc9SjTewph_]

### License
 
The MIT License (MIT)

Copyright (c) 2024 Intu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
