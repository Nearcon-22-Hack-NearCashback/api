import BN from "bn.js";
import { Account, Contract, providers, utils } from "near-api-js";

export interface ChangeMethodOptions {
  gas?: BN;
  attachedDeposit?: BN;
  walletMeta?: string;
  walletCallbackUrl?: string;
}

export class CashbackContract extends Contract {
  constructor(account: Account, contractId: string) {
    super(account, contractId, {
      changeMethods: ["create", "update_claiming_key"],
      viewMethods: ["get_claiming_key"],
    });
  }

  public createCashback = async (
    args: {
      pub_key: string;
      amount: string;
    },
    options?: ChangeMethodOptions
  ): Promise<number> => {
    return providers.getTransactionLastResult(
      await this.createCashbackRaw(args, options)
    );
  };

  public createCashbackRaw = async (
    args: {
      pub_key: string;
      amount: string;
    },
    options?: ChangeMethodOptions
  ): Promise<providers.FinalExecutionOutcome> => {
    return this.account.functionCall({
      contractId: this.contractId,
      methodName: "create",
      args,
      ...options,
    });
  };
}
