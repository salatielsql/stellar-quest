import dotenv from "dotenv";
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} from "@stellar/stellar-sdk";
dotenv.config();

const questKeypair = Keypair.fromSecret(process.env.CREATE_ACCOUNT_SQ_SECRET!);

/* TODO (2): create a new keypair here to serve as the account to be created */
const newKeypair = Keypair.random();

/* TODO (3): create your server here, and then use it to load your account */
const testnetServer = new Horizon.Server(process.env.HORIZON_SERVER_URL!);

const questAccount = await testnetServer.loadAccount(questKeypair.publicKey());

/* TODO (5): Complete your transaction below this line
 * add your `createAccount` operation, set a timeout, and don't forget to build() */
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.createAccount({
      destination: newKeypair.publicKey(),
      startingBalance: "1000",
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(questKeypair);

/* TODO (5): Complete your transaction above this line */

/* TODO (6): sign your transaction here */

try {
  /* TODO (7): submit your transaction here using your server */
  const res = await testnetServer.submitTransaction(transaction);
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
