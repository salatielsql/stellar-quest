import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Claimant,
} from "@stellar/stellar-sdk";
import dotenv from "dotenv";
import { fundMe } from "./_utils";
dotenv.config();

const questKeypair = Keypair.fromSecret(
  process.env.CLAIMABLE_BALANCE_SQ_SECRET!
);
const claimantKeypair = Keypair.fromSecret(
  "SD25SGRNUSG6ACUTWFRCSACFYGJWBUQK3GZQBUWRHJXYGFMLOU5XOVZP"
);
console.log(claimantKeypair.publicKey());
const server = new Horizon.Server(process.env.HORIZON_SERVER_URL!);

let claimableId =
  "0000000079325ddb07566ad0a7d2c566e8cc1a685e7d167f1eddc28f3fd49e9419f150fd";

// async function createClaimableBalance() {
//   const questAccount = await server.loadAccount(questKeypair.publicKey());

//   // await fundMe(questKeypair.publicKey());

//   const claimant = new Claimant(
//     claimantKeypair.publicKey(),
//     Claimant.predicateNot(Claimant.predicateBeforeRelativeTime("300")) // 5min
//   );
//   const questClaimant = new Claimant(
//     questKeypair.publicKey(),
//     Claimant.predicateUnconditional()
//   );

//   // const clayAsset = new Asset("CLAY", questKeypair.publicKey());

//   const transaction = new TransactionBuilder(questAccount, {
//     fee: BASE_FEE,
//     networkPassphrase: Networks.TESTNET,
//   })
//     .addOperation(
//       Operation.createClaimableBalance({
//         asset: Asset.native(),
//         amount: "1000",
//         claimants: [claimant, questClaimant],
//       })
//     )
//     .setTimeout(30)
//     .build();

//   transaction.sign(questKeypair);

//   console.log(transaction.toXDR());

//   try {
//     const res = await server.submitTransaction(transaction);
//     console.log(`Transaction Successful! Hash: ${res.hash}`);
//     claimableId = transaction.getClaimableBalanceId(0);
//     console.log(`Claimable Balance ID: ${claimableId}`);

//     claim();
//   } catch (error) {
//     console.log(
//       `${error}. More details:\n${JSON.stringify(
//         error.response.data.extras,
//         null,
//         2
//       )}`
//     );
//   }
// }

async function claim() {
  console.log("> ", claimantKeypair.publicKey());
  const claimantAccount = await server.loadAccount(claimantKeypair.publicKey());

  const balances = await server
    .claimableBalances()
    .claimant(claimantKeypair.publicKey())
    .call();
  console.log(balances.records);
  console.log("CLAIMING:", claimableId);

  const claimTransaction = new TransactionBuilder(claimantAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.claimClaimableBalance({
        balanceId: claimableId,
      })
    )
    .setTimeout(30)
    .build();

  claimTransaction.sign(claimantKeypair);

  console.log(claimTransaction.toXDR());

  try {
    const res = await server.submitTransaction(claimTransaction);
    console.log(`Claimed Successful! Hash: ${res.hash}`);
  } catch (error) {
    console.log(
      `${error}. More details:\n${JSON.stringify(
        error.response.data.extras,
        null,
        2
      )}`
    );
  }
}
claim();
// await createClaimableBalance();
