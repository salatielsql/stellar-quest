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
dotenv.config();

const questKeypair = Keypair.fromSecret(process.env.MANAGE_OFFERS_SQ_SECRET!);
const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());

const usdcAsset = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: usdcAsset,
    })
  )
  //   .addOperation(
  //     // Means I'm buying USDC offering XLM
  //     Operation.manageBuyOffer({
  //       selling: Asset.native(),
  //       buying: usdcAsset,
  //       buyAmount: "100",
  //       // Divide the amount you're selling by the amount you're buying.
  //       // For example, if you want to buy 100 USD for 1,000 XLM, your price would be 1000/100=10.
  //       // The reason this can be tricky is that the result (10) isn't necessarily the amount of either the selling or buying asset,
  //       // it's the price point for the counter asset of the offer.
  //       price: "10",
  //       offerId: "0",
  //       source: questKeypair.publicKey(),
  //     })
  //   )
  //   .addOperation(
  //     // Means I'm selling XLM but I only accept USDC as payment
  //     Operation.manageSellOffer({
  //       selling: Asset.native(),
  //       buying: usdcAsset,
  //       amount: "1000",
  //       price: "0.1",
  //       offerId: "0",
  //     })
  //   )
  .addOperation(
    Operation.createPassiveSellOffer({
      selling: usdcAsset,
      buying: Asset.native(),
      amount: "400",
      price: "0.1",
      source: questKeypair.publicKey(),
    })
  )
  .setTimeout(30)
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
