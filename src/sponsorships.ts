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

const questKeypair = Keypair.fromSecret(process.env.SPONSORSHIPS_SQ_SECRET!);
const sponsorKeypair = Keypair.random();

await fundMe(sponsorKeypair.publicKey()); // add  funds to the sponsor account

const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

const transaction = new TransactionBuilder(sponsorAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.beginSponsoringFutureReserves({
      sponsoredId: questKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.createAccount({
      destination: questKeypair.publicKey(),
      startingBalance: "0",
    })
  )
  .addOperation(
    Operation.endSponsoringFutureReserves({
      source: questKeypair.publicKey(),
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(sponsorKeypair, questKeypair);

console.log(transaction.toXDR());

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
