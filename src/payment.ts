import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import dotenv from "dotenv";
import { fundMe } from "./_utils";
dotenv.config();

/* TODO (3): setup the necessary keypairs here */
const questKeypair = Keypair.fromSecret(process.env.PAYMENT_SQ_SECRET!);
const destinationKeypair = Keypair.random();

/* This method of using friendbot is not strictly necessary. We've put together
 * this helper function simply as a convenience. You are free to choose any
 * number of ways to fund these accounts. */
const funded = await fundMe(destinationKeypair.publicKey());
if (funded)
  console.log("Account: " + destinationKeypair.publicKey() + " funded!");

/* TODO (4): create your server here, and then use it to load your account */
const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());
console.log("questAccount", questAccount.accountId());

/* TODO (5): include a payment operation and finish building your transaction here */
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: destinationKeypair.publicKey(),
      asset: Asset.native(),
      amount: "100",
    })
  )
  .setTimeout(30)
  .build();
console.log("XDR", transaction.toXDR());

/* TODO (6): sign your transaction here */
transaction.sign(questKeypair);

try {
  /* TODO (7): submit your transaction here using your server */
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
