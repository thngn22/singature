use anchor_lang::prelude::*;

declare_id!("Egb4NgqihXnqKkrzgRzQzD2uTdNFJEKH4zccobb4geW6");

#[program]
pub mod solana_payment_contract {
    use super::*;

    pub fn record_action(ctx: Context<RecordAction>, number: u64) -> Result<()> {
        let amount = &mut ctx.accounts.amount;
        amount.balance = number;
        Ok(())
    }

    pub fn initialize_amount(ctx: Context<InitializeAmount>) -> Result<()> {
        let amount = &mut ctx.accounts.amount;
        amount.balance = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RecordAction<'info> {
    #[account(mut)]
    pub user_a: Signer<'info>,

    #[account(mut)]
    pub amount: Account<'info, Amount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeAmount<'info> {
    #[account(init, payer = owner, space = 8 + 32)]
    pub amount: Account<'info, Amount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Amount {
    pub balance: u64,
}
