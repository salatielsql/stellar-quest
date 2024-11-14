import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  NotFoundError,
  NetworkError,
  BadRequestError,
} from "@stellar/stellar-sdk";
import dotenv from "dotenv";
dotenv.config();

const questKeypair = Keypair.fromSecret(process.env.SET_OPTIONS_SQ_SECRET!);
const secondKeypair = Keypair.random();
const thirdKeypair = Keypair.random();

await fetch(
  `https://friendbot.stellar.org?addr=${encodeURIComponent(
    secondKeypair.publicKey()
  )}`
);

await fetch(
  `https://friendbot.stellar.org?addr=${encodeURIComponent(
    thirdKeypair.publicKey()
  )}`
);

const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());

const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setOptions({
      masterWeight: 1,
      lowThreshold: 5,
      medThreshold: 5,
      highThreshold: 5,
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: secondKeypair.publicKey(),
        weight: 2,
      },
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: thirdKeypair.publicKey(),
        weight: 2,
      },
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(questKeypair);
console.log(transaction.toXDR());

async function makeOtherTransaction() {
  const t = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        amount: "100",
        asset: Asset.native(),
        destination: thirdKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  t.sign(questKeypair, secondKeypair, thirdKeypair);
  console.log(t.toXDR());

  try {
    const res = await server.submitTransaction(transaction);
    console.log(`Transaction Successful! Hash: ${res.hash}`);
  } catch (error) {
    console.log(
      `${error}. More details:\n${JSON.stringify(error.response.data, null, 2)}`
    );
  }
}

try {
  const res = await server.submitTransaction(transaction);
  console.log(`Transaction Successful! Hash: ${res.hash}`);

  await makeOtherTransaction();

  console.log("END!");
} catch (error) {
  console.log(
    `${error}. More details:\n${JSON.stringify(error.response.data, null, 2)}`
  );
}
