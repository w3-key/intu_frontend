import "./App.css";
import { Box, Text, Button, AbsoluteCenter } from "@chakra-ui/react";
import {
  vaultCreation,
  automateRegistration,
  preRegistration,
  registerAllSteps,
  getUserRegistrationAllInfos,
  completeVault,
  getSingleVaultDetails,
  getVault,
  signTx,
  combineSignedTx,
  submitTransaction,
  _getFilteredUserInitializedLogs,
  getDiscoId,
  getAllVaultsDetails,
  getRegistrationStatus,
} from "@intuweb3/exp-web";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import abi from "./721.json";

const provider = new ethers.providers.JsonRpcProvider("https://testnet.skalenodes.com/v1/juicy-low-small-testnet");

function App() {
  const [currentVault, setCurrentVault] = useState("");
  const { userId } = useAuth();
  const [intuWallet, setIntuWallet] = useState();
  const [intuSigner, setIntuSigner] = useState();
  const [intuPublic, setIntuPublic] = useState("");

  useEffect(() => {
    getIntuId();
    console.log("CurrentVault : " + currentVault);
    if (currentVault === "") {
      createIntuVault();
    }
  }, [userId, intuWallet, currentVault]);

  const getIntuId = async () => {
    if (userId && intuWallet === undefined) {
      const discoId = await getDiscoId(ethers.utils.sha512(ethers.utils.toUtf8Bytes(userId)));
      const wallet = new ethers.Wallet("0x" + discoId.key);
      const walletaddress = await wallet.getAddress();
      setIntuPublic(walletaddress);
      let signer: ethers.Signer = wallet.connect(provider);
      setIntuWallet(wallet);
      setIntuSigner(signer);
      if (currentVault === "") {
        _getFilteredUserInitializedLogs(walletaddress, provider).then(async (res) => {
          if (res && res.length > 0) {
            setCurrentVault(res[res.length - 1]);
            console.log("Vault Details below \\/");
            console.log(await getSingleVaultDetails(res[res.length - 1], provider));
          }
        });
      }
    } else if (intuWallet && currentVault === "") {
      _getFilteredUserInitializedLogs(intuPublic, provider).then(async (res) => {
        console.log(res);
        if (res && res.length > 0) {
          setCurrentVault(res[res.length - 1]);
          console.log(await getSingleVaultDetails(res[res.length - 1], provider));
        }
      });
    }
  };

  const createIntuVault = async () => {
    if (intuWallet) {
      let walletAddress = await intuWallet.getAddress();
      let vaults = await getAllVaultsDetails(walletAddress, provider);
      if (vaults && vaults.length === 0) {
        const d1public = process.env.REACT_APP_NODE_SIGNER_PUBLIC_1;
        const d2public = process.env.REACT_APP_NODE_SIGNER_PUBLIC_2;
        const proposedAddresses = [d1public, d2public, intuPublic]; // it is important to put the node signers FIRST in this array
        if (intuSigner && intuPublic) {
          console.log("getskale");
          await fetch(`http://18.246.208.46:8888/claim/${intuPublic}`)
            .then((response) => response.text())
            .catch((error) => console.log("error", error));
          await sleep(5000);
          console.log("startvaultcreation");
          const createVaultTransaction = await vaultCreation(proposedAddresses, "NewTestVault", 66, 66, 66, intuSigner);
          const createVaultResult = await createVaultTransaction.wait();
          const vaultAddress = createVaultResult.events[0].address;
          preRegistration(vaultAddress, intuSigner).then(async () => {
            console.log("start auto reg");
            await sleep(10000);
            automateRegistration(vaultAddress, intuPublic, intuSigner).then(async (result) => {
              console.log("automateregistrationdone");
              let registerallsteps = (await registerAllSteps(vaultAddress, intuSigner)).wait();
              console.log(await registerallsteps);

              let vault = await getVault(vaultAddress, provider);

              for (let i = 0; i < (await vault.users.length); i++) {
                let isRegistered = await getUserRegistrationAllInfos(vaultAddress, intuPublic, provider);
                console.log("registereduserinfo " + i);
                console.log(isRegistered.registered);
              }
              await sleep(3000);
              await completeVault(vaultAddress, intuSigner).then((res) => {
                console.log("ALLDONE!!!");
                // then refresh page
                _getFilteredUserInitializedLogs(intuPublic, provider).then(async (res) => {
                  console.log(res);
                  if (res && res.length > 0) {
                    setCurrentVault(res[res.length - 1]);
                    console.log(await getSingleVaultDetails(res[res.length - 1], provider));
                  }
                });
              });
            });
          });
        }
      }
    }
  };

  const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

  // Function to show the spinner
  //function showSpinner() {
  //  document.getElementById("spinner").style.display = "block";
  //}
  // Function to hide the spinner
  //function hideSpinner() {
  //  document.getElementById("spinner").style.display = "none";
  //}

  let submitTx = async (myVaultAddress) => {
    //const erc721Interface = new ethers.utils.Interface(["function safeTransferFrom(address _from, address _to, uint256 _tokenId)"]);
    let contractInterface = new ethers.utils.Interface(abi);
    let d = contractInterface.encodeFunctionData("mint", [intuPublic, "1"]);
    let chainId = "1444673419";
    let value = "0";
    let to = "0x3665589D97E04A139f1D95b8c852e7c6F67DFb78"; //this is the smart contract address where we will mint our NFT from
    let gasPrice = "5000000000000";
    let gas = "25000000000";
    let nonce = 0;
    let data = d;
    await submitTransaction(to, value, chainId, String(nonce), data, gasPrice, gas, myVaultAddress, intuSigner);
  };

  // sign transaction not needed in our example because the nodesigners do it for us.
  //let signTransaction = async (myVaultAddress) => {
  //  let txId = 1;
  //  await signTx(myVaultAddress, txId, intuSigner);
  //};

  let combineTx = async (myVaultAddress) => {
    let txId = 1;
    let hash = await combineSignedTx(myVaultAddress, txId, intuSigner);
    provider
      .sendTransaction(hash.combinedTxHash.finalSignedTransaction)
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
            <Button>Disconnect...</Button>
          </SignOutButton>
        </SignedIn>
        <AbsoluteCenter>
          <SignedOut>
            <Text fontSize="xl">Welcome to the Gem Game!</Text>
            <Text fontSize="xl">
              The only game that offers NFT gems <br />
              without needing a wallet!
            </Text>
            <SignInButton mode={"modal"}>
              <Button colorScheme="purple" size="lg">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {currentVault === "" ? (
              <>
                <div>
                  Setting up your account! <br />
                  In the meantime, why not fill out your profile!
                </div>
                <br />
                <br />
                <div>SOME EXAMPLE FORM HERE</div>
                <div>name ..... </div>
                <div>email .....</div>
                <div>handle .....</div>
                <br />
                <br />
                <Button>SAVE...</Button> {/*This would be saving the above data to your local database*/}
              </>
            ) : (
              <>
                <div>Your web3 account is all set!</div>
                <div>Time to claim your Gem so you can play the game!</div>
                <Button onClick={() => submitTx(currentVault)}>Claim My Gem!</Button>
                <Button onClick={() => combineTx(currentVault)}>Confirm</Button>
              </>
            )}
          </SignedIn>
        </AbsoluteCenter>
      </Box>
    </div>
  );
}
export default App;
