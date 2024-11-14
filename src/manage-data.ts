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

const questKeypair = Keypair.fromSecret(process.env.MANAGE_DATA_SQ_SECRET!);

const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());

const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.manageData({
      name: "Hello",
      value: "World",
    })
  )
  .addOperation(
    Operation.manageData({
      name: "Buffer",
      value: Buffer.from("Stellar Quest Rocks!"),
    })
  )
  .setTimeout(15)
  .build();

transaction.sign(questKeypair);
console.log(transaction.toXDR());

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
