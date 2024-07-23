import "./App.css";
import { Spinner, Box, Text, AbsoluteCenter, FormControl, Input, Stack, Button, Heading, VStack, Center } from "@chakra-ui/react";
import {
  vaultCreation,
  automateRegistration,
  preRegistration,
  registerAllSteps,
  getUserRegistrationAllInfos,
  completeVault,
  getVault,
  combineSignedTx,
  submitTransaction,
  getFilteredUserInitializedLogs,
  getUniqueHashFromSignature,
  getVaults,
} from "@intuweb3/exp-web";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import abi from "./721.json";

const provider = new ethers.providers.JsonRpcProvider("https://testnet.skalenodes.com/v1/juicy-low-small-testnet");
//const provider = new ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/eth/sepolia/public");

function App() {
  const [currentVault, setCurrentVault] = useState("");
  const { userId } = useAuth();
  const [intuWallet, setIntuWallet] = useState();
  const [intuSigner, setIntuSigner] = useState();
  const [intuPublic, setIntuPublic] = useState();
  const [connected, setConnected] = useState();
  const [gatheringVaults, setGatheringVaults] = useState(false);
  const [creatingVault, setCreatingVault] = useState(false);

  //useEffect(() => {
  //  getIntuId().then((res) => {
  //    console.log(res);
  //    console.log(currentVault);
  //    if (currentVault === "" || currentVault === undefined) {
  //      console.log("createintuvault");
  //      createIntuVault();
  //    }
  //  });
  //}, [userId, intuWallet, currentVault]);

  useEffect(() => {
    async function fetchData() {
      if (userId && intuWallet === undefined) {
        const uHash = await getUniqueHashFromSignature(ethers.utils.sha512(ethers.utils.toUtf8Bytes(userId)));
        const wallet = new ethers.Wallet("0x" + uHash.key);
        const walletaddress = await wallet.getAddress();
        setIntuPublic(walletaddress);
        let signer = wallet.connect(provider);
        setIntuWallet(wallet);
        console.log(wallet);
        setIntuSigner(signer);
        if (intuPublic) {
          console.log("CurrentWallet : " + intuPublic);
        }
        if (currentVault === "" || currentVault === undefined || Object.keys(currentVault).length === 0) {
          setGatheringVaults(true);
          await getVaults(walletaddress, provider).then(async (res) => {
            if (res && res.length > 0) {
              setCurrentVault(res[res.length - 1].vaultAddress);
              console.log(res[res.length - 1]);
              console.log("CurrentVault : " + res[res.length - 1].vaultAddress);
              setGatheringVaults(false);

              return res[res.length - 1];
            } else {
              console.log("createvault");
            }
          });
          setGatheringVaults(false);
        }
      }
    }
    fetchData();
    createIntuVault();
  }, [userId, intuWallet, currentVault]);

  const connectWallet = async () => {
    if (!connected) {
      const provider = new ethers.providers.Web3Provider(window.Ethereum);
      provider.send("eth_requestAccounts", []).then(async () => {
        const signer = await provider.getSigner();
        const _walletAddress = await signer.getAddress();
        setConnected(true);
        setIntuPublic(_walletAddress);
      });
    }
  };

  const disconnectWallet = async () => {
    //window.ethereum.selectedAddress = null;
    setConnected(false);
    setIntuPublic("");
    setIntuWallet("");
    setIntuSigner("");
  };

  const createIntuVault = async () => {
    //console.log("intuPublic : " + intuPublic);
    if (intuPublic && !creatingVault) {
      setCreatingVault(true);
      let walletAddress = await intuWallet.getAddress();
      let vaults = await getVaults(walletAddress, provider);
      if (vaults.lenght > 0 && (currentVault === "" || currentVault === undefined || Object.keys(currentVault).length === 0)) {
        console.log(vaults);
        setCurrentVault(vaults[0].masterPublicAddress);
      }
      if (vaults && vaults.length === 0) {
        const d1public = import.meta.env.VITE_NODE_SIGNER_PUBLIC_1;
        const d2public = import.meta.env.VITE_NODE_SIGNER_PUBLIC_2;
        const proposedAddresses = [d1public, d2public, intuPublic]; // it is important to put the node signers FIRST in this array
        if (intuSigner && intuPublic) {
          console.log("getskale");
          await fetch(`http://intufaucet.xyz/faucet/claim/${intuPublic}`)
            //.then((response) => console.log(response.text()))
            .catch((error) => console.log("error", error));
          await sleep(5000);
          console.log("startvaultcreation");
          const createVaultTransaction = await vaultCreation(proposedAddresses, "NewTestVault", 66, 66, 66, intuSigner);
          const createVaultResult = await createVaultTransaction.wait();
          const vaultAddress = createVaultResult.events[0].address;
          console.log("createdVault at : " + vaultAddress);
          preRegistration(vaultAddress, intuSigner).then(async () => {
            console.log("start auto reg");
            await sleep(5000);
            automateRegistration(vaultAddress, intuPublic, intuSigner).then(async (result) => {
              console.log("automateregistrationdone");
              await registerAllSteps(vaultAddress, intuSigner);
              let vault = await getVault(vaultAddress, provider);
              for (let i = 0; i < (await vault.users.length); i++) {
                let isRegistered = await getUserRegistrationAllInfos(vaultAddress, intuPublic, provider);
                console.log("registereduserinfo " + i);
                console.log(isRegistered.registered);
              }
              await sleep(2500);
              await completeVault(vaultAddress, intuSigner).then((res) => {
                console.log("ALLDONE!!!");
                getFilteredUserInitializedLogs(intuPublic, provider).then(async (res) => {
                  console.log(res);
                  if (res && res.length > 0) {
                    setCurrentVault(res[res.length - 1]);
                    console.log(await getvVult(res[res.length - 1], provider));
                  }
                });
              });
            });
          });
        }
      }
    }
  };

  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  let submitTx = async (myVaultAddress) => {
    console.log(intuPublic);
    let contractInterface = new ethers.utils.Interface(abi);
    let d = contractInterface.encodeFunctionData("mint", [intuPublic, "6"]);
    console.log(d);
    //let contract = new ethers.Contract("0x4c7cDa9DcE917C8490577f31d482FAcE62D2D630", abi, intuSigner);

    // get gas price from ethers

    //let chainId = "1351057110";
    //let chainId = "974399131";
    let chainId = "11155111";
    let value = "0";
    let to = "0x374620b9cfc556b6ef09c537ae20007d81ce7832";
    let gasPrice = "500000000";
    let gas = "250000";
    let nonce = 0;
    let data = d;

    //thought, launch the smart contract on sepolia and try interacting with it there
    console.log(myVaultAddress);
    try {
      await submitTransaction(to, value, chainId, String(nonce), data, gasPrice, gas, myVaultAddress, intuSigner);
    } catch (e) {
      console.error(e);
    }
  };

  //let submitTx = async (myVaultAddress) => {
  //  //const erc721Interface = new ethers.utils.Interface(["function safeTransferFrom(address _from, address _to, uint256 _tokenId)"]);
  //  let contractInterface = new ethers.utils.Interface(abi);
  //  let d = contractInterface.encodeFunctionData("mint", [intuPublic, "1"]);
  //  let chainId = "11155111";
  //  let value = "0";
  //  let to = "0x374620b9cfc556b6ef09c537ae20007d81ce7832"; //this is the smart contract address where we will mint our NFT from
  //  let gasPrice = "50000000000";
  //  let gas = "250000";
  //  let nonce = 0;
  //  let data = d;
  //  await submitTransaction(to, value, chainId, String(nonce), data, gasPrice, gas, myVaultAddress, intuSigner);
  //};

  // sign transaction not needed in our example because the nodesigners do it for us.
  //let signTransaction = async (myVaultAddress) => {
  //  let txId = 1;
  //  await signTx(myVaultAddress, txId, intuSigner);
  //};

  let combineTx = async (myVaultAddress) => {
    let txId = 1;
    let hash = await combineSignedTx(myVaultAddress, txId, intuSigner);
    console.log("hash to send:");
    console.log(hash);
    let p = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/a6122371120a4819ae02bac868b9d07a");

    p.sendTransaction(hash.combinedTxHash.finalSignedTransaction)
      .then((txResponse) => {
        console.log(txResponse);
        console.log("https://juicy-low-small-testnet.explorer.testnet.skalenodes.com/tx/" + txResponse.hash);
      })
      .catch((error) => {
        console.error("Failed to send transaction:", error);
      });
  };

  return (
    <div className="App">
      <Box h="calc(100vh)" w="100%" bgGradient="linear(to-l, #7928CA, #FF0080)">
        <SignedIn>
          <SignOutButton>
            <Button onClick={() => disconnectWallet()}>Disconnect...</Button>
          </SignOutButton>
        </SignedIn>
        <AbsoluteCenter>
          <SignedOut>
            <Text fontSize="xl">Welcome to the Gem Game!!</Text>
            <Text fontSize="xl">
              The only game that offers NFT gems <br />
              without needing a wallet!
            </Text>
            <SignInButton mode={"modal"}>
              <Button colorScheme="purple" size="lg">
                Sign In
              </Button>
            </SignInButton>

            <Text>OR</Text>
            <Button colorScheme="purple" size="lg" onClick={() => connectWallet()}>
              Connect Wallet
            </Button>
          </SignedOut>

          <SignedIn>
            {currentVault === "" && !gatheringVaults ? (
              <>
                <Center bg="white">
                  <Stack spacing={4}>
                    <Stack align="center">
                      <Heading fontSize="1xl">
                        {" "}
                        Setting up your account! <br />
                        In the meantime, why not fill out your profile!
                      </Heading>
                    </Stack>
                    <VStack as="form" spacing={8} w={{ base: "sm", sm: "lg" }} p={{ base: 5, sm: 6 }}>
                      <VStack spacing={5} w="100%">
                        <FormControl id="name">
                          <Input type="name" placeholder="Your Name" rounded="md" borderBottomLeftRadius="0" borderBottomRightRadius="0" />
                        </FormControl>
                        <FormControl id="handle">
                          <Input type="handle" placeholder="Game Handle" rounded="md" borderBottomLeftRadius="0" borderBottomRightRadius="0" />
                        </FormControl>
                        <FormControl id="email">
                          <Input type="email" placeholder="Email Address" rounded="md" borderBottomLeftRadius="0" borderBottomRightRadius="0" />
                        </FormControl>
                        <FormControl id="password" position="relative" bottom="1px">
                          <Input type="password" placeholder="Password" rounded="md" borderTopLeftRadius="0" borderTopRightRadius="0" />
                        </FormControl>
                      </VStack>
                      <VStack w="100%">
                        <Button
                          //leftIcon={<BiLockAlt />}
                          bg="green.300"
                          color="white"
                          _hover={{
                            bg: "green.500",
                          }}
                          rounded="md"
                          w="100%"
                        >
                          Save
                        </Button>
                      </VStack>
                    </VStack>
                  </Stack>
                </Center>
              </>
            ) : (
              <>
                {!gatheringVaults ? (
                  <>
                    <Text>Your web3 account is all set!</Text>
                    <Text>Time to claim your Gem so you can play the game!</Text>
                    <Button onClick={() => submitTx(currentVault)}>Claim My Gem!</Button>
                    <Button onClick={() => combineTx(currentVault)}>Confirm</Button>
                  </>
                ) : (
                  <>
                    <Text>Gathering your Vaults</Text>
                    <br />
                    <br />
                    <Spinner />
                  </>
                )}
              </>
            )}
          </SignedIn>
        </AbsoluteCenter>
      </Box>
    </div>
  );
}
export default App;
