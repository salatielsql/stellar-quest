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

/* TODO (2): get your two keypairs ready, don't forget to have them funded */
const questKeypair = Keypair.fromSecret(process.env.CHANGE_TRURST_SQ_SECRET!);
const issuerKeypair = Keypair.random();

const funded = await fundMe(issuerKeypair.publicKey());
if (funded) console.log("Account: " + issuerKeypair.publicKey() + " funded!");

/* TODO (3): set up your server connection and load up your quest account */
const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());

/* TODO (4): Create your asset below. Use any code you like! */
const santaCoinAsset = new Asset("SantaCoin", issuerKeypair.publicKey());
console.log({ santaCoinAsset });
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: santaCoinAsset,
      limit: "1",
      source: questKeypair.publicKey(),
    })
  )
  .setTimeout(30)
  .build();
/* TODO (5): build your transaction containing the changeTrust operation */

transaction.sign(questKeypair);
console.log("XDR: ", transaction.toXDR());
/* TODO (6): Sign and submit your transaction to the network. */
try {
  let res = await server.submitTransaction(transaction);
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
