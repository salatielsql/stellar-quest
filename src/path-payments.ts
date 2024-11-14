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
console.log(process.env.PATH_PAYMENTS_SQ_SECRET!);
const questKeypair = Keypair.fromSecret(process.env.PATH_PAYMENTS_SQ_SECRET!);
const issuerKeypair = Keypair.random();
const distributorKeypair = Keypair.random();
const destinationKeypair = Keypair.random();

await fundMe(issuerKeypair.publicKey());
await fundMe(distributorKeypair.publicKey());
await fundMe(destinationKeypair.publicKey());

console.log([
  `Account issuerKeypair: ${issuerKeypair.publicKey()} funded! \n`,
  `Account distributorKeypair: ${distributorKeypair.publicKey()} funded! \n`,
  `Account destinationKeypair: ${destinationKeypair.publicKey()} funded! \n`,
]);

const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());

const pathAsset = new Asset("PATH", issuerKeypair.publicKey());

const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: destinationKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: pathAsset,
      amount: "1000000",
      source: issuerKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.createPassiveSellOffer({
      selling: pathAsset,
      buying: Asset.native(),
      amount: "2000",
      price: "1",
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.createPassiveSellOffer({
      selling: Asset.native(),
      buying: pathAsset,
      amount: "2000",
      price: "1",
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset: Asset.native(),
      sendAmount: "1000",
      destination: destinationKeypair.publicKey(),
      destAsset: pathAsset,
      destMin: "1000",
    })
  )
  .addOperation(
    Operation.pathPaymentStrictReceive({
      sendAsset: pathAsset,
      sendMax: "450",
      destination: questKeypair.publicKey(),
      destAsset: Asset.native(),
      destAmount: "450",
      source: destinationKeypair.publicKey(),
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(
  questKeypair,
  issuerKeypair,
  destinationKeypair,
  distributorKeypair
);
console.log("XDR", transaction.toXDR());

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
