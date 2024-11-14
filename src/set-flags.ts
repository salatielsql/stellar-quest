import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { fundMe } from "./_utils";
import dotenv from "dotenv";
dotenv.config();

/* TODO (1): you'll need two funded keypairs for this quest */
const questKeypair = Keypair.fromSecret(process.env.FLAGS_SQ_SECRET!);
const issuerKeypair = Keypair.random();

await fundMe(issuerKeypair.publicKey());

/* TODO (1): create your server, and load the *issuer* account from it */
const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

/* TODO (2): create your custom asset that we can control authorization for */
const controlledAsset = new Asset("CONTROL", issuerKeypair.publicKey());

/* TODO (3-7): add onto the transaction below to complete your quest. Be mindful
 * of which source account you're using for each operation */
const transaction = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    /* (3) you need an operation to set the flags on the issuer account */
    Operation.setOptions({
      // @ts-ignore
      setFlags: 3,
    })
  )
  .addOperation(
    /* (4) you need an operation for the quest account to trust the asset */
    Operation.changeTrust({
      asset: controlledAsset,
      source: questKeypair.publicKey(),
    })
  )
  .addOperation(
    /* (5) you need an operation to authorize the trustline for the quest account */
    Operation.setTrustLineFlags({
      asset: controlledAsset,
      trustor: questKeypair.publicKey(),
      flags: {
        authorized: true,
      },
    })
  )
  .addOperation(
    /* (6) you need an operation to send the asset to the quest account */
    Operation.payment({
      amount: "1000",
      asset: controlledAsset,
      destination: questKeypair.publicKey(),
    })
  )
  .addOperation(
    /* (7) you need an operation to revoke the quest account's authorization */
    Operation.setTrustLineFlags({
      asset: controlledAsset,
      trustor: questKeypair.publicKey(),
      flags: {
        authorized: false,
      },
    })
  )
  .setTimeout(30)
  .build();

/* TODO (8): sign and submit the transaction to the testnet */
transaction.sign(questKeypair, issuerKeypair);
try {
  const res = await server.submitTransaction(transaction);
  console.log(`Transaction Successful! Hash: ${res.hash}`);
} catch (error) {
  console.log(
    `${error}. More details:\n${JSON.stringify(
      error.response.data.extras,
      null,
      2
    )}`
  );
}
