const { PublicKey, Keypair, signByt } = require("@solana/web3.js");
const bs58 = require("bs58");
const axios = require("axios");
const nacl = require("tweetnacl");
const { decodeUTF8 } = require("tweetnacl-util");

// put here the public address of your claim wallet
var claimWallet = "";

// put here the private keys of your compromised wallets
const wallets = ["private key 1", "private key 2", "etc"];

async function sendApiCall(json) {
  const response = await axios.post(
    "https://mefoundation.com/api/trpc/auth.linkWallet?batch=1",
    {
      "0": {
        json: json,
      },
    }
  );

  console.log(response.data[0].result);
}

async function run() {
  const hours = "0" + new Date().getHours();
  const minutes = "0" + new Date().getMinutes();
  const seconds = "0" + new Date().getSeconds();

  for (const privateKey of wallets) {
    const wallet = Keypair.fromSecretKey(bs58.decode(privateKey));

    console.log("publicKey:", wallet.publicKey.toString());

    const message =
      "URI: mefoundation.com\nIssued At: 2024-12-08T" +
      hours.slice(-2) +
      ":" +
      minutes.slice(-2) +
      ":" +
      seconds.slice(-2) +
      ".902Z\nChain ID: sol\nAllocation Wallet: " +
      wallet.publicKey.toString() +
      "\nClaim Wallet: " +
      claimWallet;
    const messageBytes = decodeUTF8(message);

    const signature = nacl.sign.detached(messageBytes, wallet.secretKey);

    const base58Signature = bs58.encode(signature);

    sendApiCall({
      message: message,
      wallet: wallet.publicKey.toString(),
      chain: "sol",
      signature: base58Signature,
      allocationEvent: "tge-airdrop-final",
      isLedger: false,
    });
  }

  // every second
  setTimeout(run, 1000);
}

run();
