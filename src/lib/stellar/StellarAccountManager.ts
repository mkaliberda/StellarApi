import { StellarBaseManager } from './StellarBaseManager';
import { BadAddressError } from './StellarError';
import { Decimal } from 'decimal.js';

export class StellarAccountManager extends StellarBaseManager {
    constructor() {
        super();
    }

    public async getBalances(address: string): Promise<any> {
        let account: any;
        try {
            account = await this.server.loadAccount(address);
        } catch (err) {
            throw new BadAddressError('TODO ADD EXCEPTION 1' + err);
        }
        return account.balances;
    }

    public async checkEnoughBalance(address: string, asset: string, amount: Decimal): Promise<void> {
        const balances = await this.getBalances(address);
        const assetBalanceObj = balances.find(item => {
            return item.asset_code && item.asset_code === asset;
        });
        if (typeof assetBalanceObj === 'undefined') {
            // No trustline error
            throw new Error(`Asset '${asset}' not found in account trustlines.`);
        } else if (new Decimal(assetBalanceObj.balance).lessThan(amount)) {
            // Balance error
            throw new Error(`Account balance ${assetBalanceObj.balance} of ${asset} is less than ${amount}`);
        }
    }
}
