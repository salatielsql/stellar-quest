import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Account,
} from "@stellar/stellar-sdk";
import dotenv from "dotenv";
dotenv.config();

const questKeypair = Keypair.fromSecret(process.env.BUMP_SEQUENCE_SQ_SECRET!);

const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);
const questAccount = await server.loadAccount(questKeypair.publicKey());
console.log(
  "sequence before",
  questAccount.sequence,
  questAccount.sequenceNumber()
);

const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.bumpSequence({
      bumpTo: (parseInt(questAccount.sequence) + 100).toString(),
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(questKeypair);
console.log("XDR", transaction.toXDR());

try {
  const res = await server.submitTransaction(transaction);

  //   const bumpedAccount = new Account(
  //     questKeypair.publicKey(),
  //     (parseInt(questAccount.sequence) + 99).toString()
  //   );
  const questAccount2 = await server.loadAccount(questKeypair.publicKey());

  const transaction2 = new TransactionBuilder(questAccount2, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: "sequence",
        value: "bumped",
      })
    )
    .setTimeout(30)
    .build();
  transaction2.sign(questKeypair);

  const res2 = await server.submitTransaction(transaction2);

  console.log(`Transaction Successful! Hash: ${res.hash}`);
  console.log(`Transaction 2222! Hash: ${res2.hash}`);
  console.log(
    "sequence before",
    questAccount2.sequence,
    questAccount2.sequenceNumber()
  );
} catch (error) {
  console.log(
    `${error}. More details:\n${JSON.stringify(
      error.response.data.extras,
      null,
      2
    )}`
  );
}
