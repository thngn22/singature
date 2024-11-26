import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaPaymentContract } from "../target/types/solana_payment_contract";
import privateKey from "../key.json";
import * as web3 from "@solana/web3.js";
import { BN } from "bn.js";

describe("solana_payment_contract", () => {
  const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanaPaymentContract as Program<SolanaPaymentContract>;
  const payer = web3.Keypair.fromSecretKey(Uint8Array.from(privateKey));

  let userA = anchor.web3.Keypair.generate();
  let amountAccount = anchor.web3.Keypair.generate();

  it("allows User A to deposit funds while User B sponsors fees", async () => {
    const balanceAuthor = await provider.connection.getBalance(payer.publicKey);
    console.log(`User author balance: ${balanceAuthor} lamports`);

    const balanceA = await provider.connection.getBalance(userA.publicKey);
    console.log(`User a balance: ${balanceA} lamports`);

    await program.methods
      .initializeAmount()
      .accounts({
        amount: amountAccount.publicKey,
        owner: payer.publicKey,
      })
      .signers([amountAccount, payer])
      .rpc();
    console.log("Amount account initialized!");

    const tx = new anchor.web3.Transaction();
    tx.add(
      await program.methods
        .recordAction(new BN(10))
        .accounts({
          userA: userA.publicKey,
          amount: amountAccount.publicKey,
        })
        .signers([userA])
        .instruction()
    );
    tx.feePayer = payer.publicKey;

    const { blockhash } = await provider.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    tx.partialSign(userA);
    tx.partialSign(payer);

    const txSig = await provider.connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    console.log("Transaction signature:", txSig);

    const balanceAuthor2 = await provider.connection.getBalance(
      payer.publicKey
    );
    console.log(`User author balance: ${balanceAuthor2} lamports`);
  });
});
